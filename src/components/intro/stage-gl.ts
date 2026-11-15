import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import type { Stage, StageFrame, StageOptions } from './stage';
import { buildTargets, CAMERA, FORM_VIEW, FORMS, formFit, formMix, formWeight, viewSize } from './targets';

/**
 * The WebGL stage. Tens of thousands of particles live entirely in one vertex shader: each has six
 * target positions (one per shape) as attributes, and the shader mixes the two on screen, staggers
 * and overshoots the move per particle, carries the particles along a divergence-free flow field
 * (an ABC flow, so they swirl without bunching up), pushes them away from the pointer and rides
 * shockwaves from clicks. Nothing is simulated on the CPU, so the cost does not grow with the count.
 *
 * Around the wave shape, glossy balls bounce on it: real spheres with a clearcoat physical material
 * and a procedural room environment, squashing on impact. The frame then goes through bloom and a
 * final pass with chromatic aberration at the edges, film grain and a vignette.
 */

const COUNT = { full: 60000, light: 22000 };
const SHOCKS = 3;
const BLOOM = 0.42;

const vertex = /* glsl */ `
  attribute vec3 aT0;
  attribute vec3 aT1;
  attribute vec3 aT2;
  attribute vec3 aT3;
  attribute vec3 aT4;
  attribute vec3 aT5;
  attribute vec4 aSeed;
  uniform float uTime;
  uniform int uFrom;
  uniform float uMix;
  uniform float uScale[6];
  uniform float uLift[6];
  uniform float uSpin[6];
  uniform float uTilt[6];
  uniform vec3 uPointer;
  uniform vec2 uReach;
  uniform vec4 uShock[${SHOCKS}];
  uniform float uPR;
  uniform float uSize;
  uniform float uRed;
  varying float vAlpha;
  varying vec3 vColor;

  vec3 shape(int i) {
    vec3 p = i == 0 ? aT0 : i == 1 ? aT1 : i == 2 ? aT2 : i == 3 ? aT3 : i == 4 ? aT4 : aT5;
    // The sphere breathes and the wave ripples.
    if (i == 0) p *= 1.0 + 0.035 * sin(uTime * 0.9 + aSeed.x * 6.283);
    if (i == 2) p.y += sin(p.x * 2.3 + uTime * 1.3) * cos(p.z * 2.7 + uTime * 0.9) * 0.11;
    float a = uSpin[i];
    float c = cos(a);
    float s = sin(a);
    p = vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
    float t = uTilt[i];
    c = cos(t);
    s = sin(t);
    p = vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
    return p * uScale[i] + vec3(0.0, uLift[i], 0.0);
  }

  // An ABC flow: each component ignores its own coordinate, so the field has no divergence.
  vec3 flow(vec3 p, float t) {
    return vec3(
      sin(p.y * 1.7 + t) + cos(p.z * 1.3 - t * 0.7),
      sin(p.z * 1.9 + t * 1.1) + cos(p.x * 1.5 + t * 0.6),
      sin(p.x * 1.6 - t * 0.9) + cos(p.y * 1.4 + t * 0.8)
    );
  }

  void main() {
    // Each particle leaves at its own moment and overshoots its new place before settling.
    float x = clamp(uMix * 1.5 - aSeed.x * 0.5, 0.0, 1.0);
    float k = x - 1.0;
    float m = 1.0 + 2.2 * k * k * k + 1.2 * k * k;
    float burst = sin(3.14159 * x);
    vec3 pos = mix(shape(uFrom), shape(uFrom + 1), m);
    vec3 drift = flow(pos * 0.9, uTime * 0.35) + 0.5 * flow(pos * 2.3 + 4.0, uTime * 0.6);
    pos += drift * (0.018 + 0.2 * burst) + (aSeed.yzw - 0.5) * burst * 0.5;

    // The pointer pushes particles aside.
    vec2 d = pos.xy - uPointer.xy;
    float push = uPointer.z * exp(-dot(d, d) / uReach.x);
    pos.xy += normalize(d + 1e-4) * push * uReach.y;
    pos.z += push * (aSeed.w - 0.5) * uReach.y * 2.0;

    // Shockwaves: an expanding ring that throws particles outward and lights them up.
    float glow = push * 0.6;
    for (int s = 0; s < ${SHOCKS}; s++) {
      float age = uShock[s].z;
      if (age < 0.0) continue;
      vec2 sd = pos.xy - uShock[s].xy;
      float r = length(sd);
      float ring = exp(-pow((r - age * 2.4) / 0.22, 2.0)) * exp(-age * 1.5) * uShock[s].w;
      pos.xy += normalize(sd + 1e-4) * ring * 0.4;
      pos.z += ring * (aSeed.z - 0.2) * 0.6;
      glow += ring;
    }

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = 0.5 + 1.7 * aSeed.y * aSeed.y * aSeed.y;
    gl_PointSize = uSize * uPR * size * (1.0 + glow * 1.6) * (${CAMERA.z.toFixed(1)} / -mv.z);
    float red = step(1.0 - uRed, aSeed.z);
    vColor = mix(vec3(1.0, 0.96, 0.94), vec3(1.0, 0.16, 0.24), max(red, glow * 0.8));
    vAlpha = (0.1 + 0.26 * aSeed.w * aSeed.w) * (1.0 + glow * 2.5) * (1.0 - 0.3 * burst);
  }
`;

const fragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, r) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

/** Final pass: colour fringes toward the edges, film grain, a vignette and a faint red haze. */
const FinishShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uFringe: { value: 0.008 }, uAspect: { value: 1 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uFringe;
    uniform float uAspect;
    varying vec2 vUv;
    void main() {
      vec2 c = vUv - 0.5;
      float d = dot(c, c);
      vec2 off = c * d * uFringe * 4.0;
      vec3 col = vec3(
        texture2D(tDiffuse, vUv + off).r,
        texture2D(tDiffuse, vUv).g,
        texture2D(tDiffuse, vUv - off).b
      );
      col += vec3(0.03, 0.0, 0.004) * smoothstep(0.7, 0.0, length(c * vec2(uAspect, 1.0)));
      float n = fract(sin(dot(gl_FragCoord.xy + fract(uTime) * 91.0, vec2(12.9898, 78.233))) * 43758.5453);
      col += (n - 0.5) * 0.03;
      col *= 1.0 - d * 1.1;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

interface Ball {
  mesh: Mesh;
  glow: Mesh;
  period: number;
  phase: number;
  height: number;
  x: number;
  z: number;
}

export class StageGL implements Stage {
  readonly kind = 'gl' as const;
  readonly count: number;
  private renderer: WebGLRenderer;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private finish: ShaderPass;
  private scene = new Scene();
  private camera = new PerspectiveCamera(CAMERA.fov, 1, 0.1, 50);
  private points: Points;
  private material: ShaderMaterial;
  private balls: Ball[] = [];
  private ballGroup = new Group();
  private ballRadius = 0.2;
  private disposables: { dispose(): void }[] = [];
  private aspect = 1;
  private shocks: { x: number; y: number; at: number }[] = [];
  private now = 0;
  private kick = 0;
  private pointerWorld = new Vector3();
  private look = new Vector3();

  static async create(opts: StageOptions) {
    const count = opts.light ? COUNT.light : COUNT.full;
    const targets = await buildTargets(count, opts.fontFamily);
    return new StageGL(opts, count, targets);
  }

  private constructor(
    private opts: StageOptions,
    count: number,
    targets: Float32Array[],
  ) {
    this.count = count;
    const renderer = new WebGLRenderer({ canvas: opts.canvas, antialias: false, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    this.renderer = renderer;
    this.camera.position.set(0, 0, CAMERA.z);

    // Particles.
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(targets[0], 3));
    targets.forEach((t, i) => {
      geo.setAttribute(`aT${i}`, new BufferAttribute(t, 3));
    });
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
    geo.setAttribute('aSeed', new BufferAttribute(seed, 4));
    this.material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uFrom: { value: 0 },
        uMix: { value: 0 },
        uScale: { value: new Array(6).fill(1) },
        uLift: { value: new Array(6).fill(0) },
        uSpin: { value: new Array(6).fill(0) },
        uTilt: { value: FORMS.map((f) => FORM_VIEW[f].tilt) },
        uPointer: { value: new Vector3(0, 0, 0) },
        uReach: { value: new Vector2(0.3, 0.42) },
        uShock: { value: Array.from({ length: SHOCKS }, () => new Vector4(0, 0, -1, 0)) },
        uPR: { value: 1 },
        uSize: { value: opts.light ? 2.3 : 1.9 },
        uRed: { value: 0.2 },
      },
    });
    this.points = new Points(geo, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
    this.disposables.push(geo, this.material);

    this.buildBalls(opts.light);

    // Post-processing: bloom, then the finishing pass, then tone mapping and colour space.
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new Vector2(256, 256), BLOOM, 0.55, 0.62);
    this.composer.addPass(this.bloom);
    this.finish = new ShaderPass(FinishShader);
    this.composer.addPass(this.finish);
    this.composer.addPass(new OutputPass());
  }

  /** Glossy balls: clearcoat spheres lit by a procedural room, each with a glow where it lands. */
  private buildBalls(light: boolean) {
    const pmrem = new PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    this.scene.environment = env;
    this.scene.environmentIntensity = 0.42;
    this.disposables.push(env, pmrem);
    const key = new DirectionalLight(0xffffff, 1.3);
    key.position.set(-2, 4, 5);
    this.scene.add(key);

    const sphere = new SphereGeometry(1, light ? 32 : 56, light ? 20 : 36);
    const red = new MeshPhysicalMaterial({
      color: new Color('#b0101f'),
      roughness: 0.16,
      metalness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    });
    const white = new MeshPhysicalMaterial({
      color: new Color('#c9c9d0'),
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    // A soft red disc for the light a ball throws on the floor.
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    if (ctx) {
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,70,90,1)');
      g.addColorStop(1, 'rgba(255,70,90,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
    }
    const glowTex = new CanvasTexture(c);
    const disc = new CircleGeometry(1, 24);
    this.disposables.push(sphere, red, white, glowTex, disc);

    const n = light ? 5 : 7;
    for (let i = 0; i < n; i++) {
      const mesh = new Mesh(sphere, i % 2 ? white : red);
      const glowMat = new MeshBasicMaterial({
        map: glowTex,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      });
      const glow = new Mesh(disc, glowMat);
      glow.rotation.x = -Math.PI / 2;
      this.disposables.push(glowMat);
      this.ballGroup.add(mesh, glow);
      this.balls.push({
        mesh,
        glow,
        period: 0.92 + 0.07 * ((i * 3) % 5),
        phase: (i * 0.37) % 1,
        height: 0.72 + 0.28 * (((i * 5) % 7) / 6),
        x: (i / (n - 1)) * 2 - 1,
        z: i % 2 ? -0.28 : 0.2,
      });
    }
    this.ballGroup.visible = false;
    this.scene.add(this.ballGroup);
  }

  resize(w: number, h: number, dpr: number) {
    this.aspect = w / h;
    // Cap the pixel ratio, and keep the buffers under ~5 megapixels on 4K and ultrawide screens.
    const pr = Math.min(dpr, this.opts.light ? 1.5 : 2, Math.sqrt(5e6 / (w * h)));
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(pr);
    this.composer.setSize(w, h);
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPR.value = pr * Math.min(1.25, Math.max(0.8, h / 900));
    this.finish.uniforms.uAspect.value = this.aspect;
    const fit = formFit(this.aspect);
    this.material.uniforms.uScale.value = FORMS.map((f) => fit[f].scale);
    this.material.uniforms.uLift.value = FORMS.map((f) => fit[f].y);
    const view = viewSize(this.aspect);
    // The pointer's reach follows the width of the view, so it is not huge on a phone.
    const reach = Math.min(1, Math.max(0.4, view.w / 4.5));
    this.material.uniforms.uReach.value.set(0.3 * reach * reach, 0.42 * reach);
    this.ballRadius = Math.min(view.w / (this.balls.length * 2.9), view.h * 0.07);
  }

  shock(px: number, py: number) {
    const view = viewSize(this.aspect);
    this.shocks.push({ x: (px * view.w) / 2, y: (-py * view.h) / 2, at: this.now });
    if (this.shocks.length > SHOCKS) this.shocks.shift();
    this.kick = 1;
  }

  frame(f: StageFrame) {
    this.now = f.time;
    const u = this.material.uniforms;
    const { i, f: mix } = formMix(f.u);
    u.uTime.value = f.time;
    u.uFrom.value = i;
    u.uMix.value = mix;
    u.uSpin.value = FORMS.map((name) => {
      const v = FORM_VIEW[name];
      return v.spin * f.time + v.sway * Math.sin(f.time * 0.45) + f.px * 0.25;
    });
    // More red while the pagoda and the bird are on screen.
    u.uRed.value = 0.16 + 0.3 * formWeight(f.u, 3) + 0.42 * formWeight(f.u, 4) + 0.2 * formWeight(f.u, 5);

    const view = viewSize(this.aspect);
    // The bird and the name stay legible: the pointer pushes them much less.
    const calm = 1 - 0.75 * (formWeight(f.u, 4) + formWeight(f.u, 5));
    this.pointerWorld.set((f.px * view.w) / 2, (-f.py * view.h) / 2, f.push * calm);
    u.uPointer.value.copy(this.pointerWorld);
    const shocks = u.uShock.value as Vector4[];
    for (let s = 0; s < SHOCKS; s++) {
      const sh = this.shocks[s];
      const age = sh ? f.time - sh.at : -1;
      shocks[s].set(sh?.x ?? 0, sh?.y ?? 0, age > 4 ? -1 : age, 1);
    }

    // The whole scene leans with the pointer.
    this.camera.position.set(f.px * 0.55, -f.py * 0.32, CAMERA.z);
    this.camera.lookAt(this.look);

    this.kick *= Math.exp(-f.dt * 1.8);
    this.updateBalls(f, view);

    this.bloom.strength = BLOOM + 0.35 * this.kick;
    this.finish.uniforms.uTime.value = f.time;
    this.finish.uniforms.uFringe.value = 0.008 + 0.03 * this.kick;
    this.composer.render();
  }

  private updateBalls(f: StageFrame, view: { w: number; h: number }) {
    const w = formWeight(f.u, 2);
    this.ballGroup.visible = w > 0.004;
    if (!this.ballGroup.visible) return;
    const fit = formFit(this.aspect).wave;
    const R = this.ballRadius;
    // The floor is the wave plane, seen with the wave's tilt.
    const tilt = FORM_VIEW.wave.tilt;
    const floor = -0.75 * fit.scale * Math.cos(tilt) + fit.y;
    const spread = Math.min(view.w * 0.4, fit.scale * 1.7);
    for (const b of this.balls) {
      const p = (((f.time / b.period + b.phase) % 1) + 1) % 1;
      const peak = view.h * 0.3 * b.height * (1 + 0.5 * this.kick);
      const lift = peak * 4 * p * (1 - p);
      // Squash at the bottom of the bounce, stretch while moving fast.
      const edge = Math.min(p, 1 - p);
      const squash = edge < 0.06 ? 0.28 * (1 - edge / 0.06) : 0;
      const stretch = squash > 0 ? 0 : 0.12 * Math.abs(1 - 2 * p);
      const sy = 1 - squash + stretch;
      const sx = 1 + squash * 0.55 - stretch * 0.4;
      // Balls fall in from above as the wave forms, and rise away as it leaves.
      const away = (1 - w) ** 2 * view.h * 1.3;
      b.mesh.position.set(b.x * spread, floor + lift + R * sy + away, b.z * fit.scale);
      b.mesh.scale.set(R * sx, R * sy, R * sx);
      const near = Math.max(0, 1 - lift / (peak * 0.6));
      b.glow.position.set(b.x * spread, floor + 0.01, b.z * fit.scale);
      b.glow.scale.setScalar(R * (1.2 + 1.6 * near));
      (b.glow.material as MeshBasicMaterial).opacity = near * 0.5 * w;
    }
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
    this.bloom.dispose();
    this.finish.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }
}
