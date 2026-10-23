'use client';

import { Line, OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/cn';
import type { LandingPlugin } from './registry';

export interface ConstellationRing {
  id: string;
  radius: number;
  tilt: [number, number, number];
  speed: number;
  color: string;
  plugins: LandingPlugin[];
  ghost?: boolean;
}

interface SceneProps {
  rings: ConstellationRing[];
  tone: 'dark' | 'light';
  active: string | null;
  animate: boolean;
  running: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

/** Fresnel-lit core: the harness itself, PKU red with a bright rim. */
const coreVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;
const coreFragment = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  float f = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
  vec3 deep = vec3(0.32, 0.0, 0.04);
  vec3 red = vec3(0.77, 0.13, 0.21);
  vec3 rim = vec3(1.0, 0.62, 0.66);
  float pulse = 0.5 + 0.5 * sin(uTime * 1.3);
  vec3 col = mix(deep, red, 0.55 + 0.25 * vNormal.y) + rim * f * (0.9 + 0.2 * pulse);
  gl_FragColor = vec4(col, 1.0);
}
`;

function Core({ animate }: { animate: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, dt) => {
    if (animate && mat.current) mat.current.uniforms.uTime.value += dt;
  });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.55, 64, 64]} />
        <shaderMaterial ref={mat} vertexShader={coreVertex} fragmentShader={coreFragment} uniforms={uniforms} />
      </mesh>
      <sprite scale={[3, 3, 1]}>
        <spriteMaterial
          map={glowTexture()}
          color="#c42236"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

let glow: THREE.Texture | null = null;
function glowTexture() {
  if (glow) return glow;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  if (g) {
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,0.9)');
    grd.addColorStop(0.25, 'rgba(255,255,255,0.35)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  }
  glow = new THREE.CanvasTexture(c);
  return glow;
}

const v = new THREE.Vector3();

/** Bead meshes and their DOM labels, keyed by plugin id; labels are projected once per frame. */
type LabelRegistry = Map<string, { mesh: THREE.Object3D | null; el: HTMLDivElement | null }>;

function entry(reg: LabelRegistry, id: string) {
  let e = reg.get(id);
  if (!e) {
    e = { mesh: null, el: null };
    reg.set(id, e);
  }
  return e;
}

function LabelSync({ registry, active }: { registry: RefObject<LabelRegistry>; active: string | null }) {
  useFrame(({ camera, size }) => {
    const camDist = camera.position.length();
    // small canvases show only the front-most labels
    const cut = size.width < 640 ? 0.75 : 0.3;
    for (const [id, { mesh, el }] of registry.current) {
      if (!mesh || !el) continue;
      mesh.getWorldPosition(v);
      // nearer beads read clearly, the far side of the orbit fades back
      const rel = v.distanceTo(camera.position) - camDist;
      const o = THREE.MathUtils.clamp(0.31 - rel * 0.45, 0, 1);
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height - 17;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      el.style.opacity = id === active ? '1' : o < cut ? '0' : o.toFixed(2);
      el.style.zIndex = String(Math.round((1 - v.z) * 1000));
    }
  });
  return null;
}

/** Pull the camera back on narrow (portrait) canvases so the outer orbit stays in frame. */
function CameraFit() {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useEffect(() => {
    const base = Math.hypot(3.9, 8.4);
    const dist = aspect < 1.25 ? base * Math.min(1.9, 1.25 / aspect) : base;
    camera.position.setLength(dist);
    camera.updateProjectionMatrix();
  }, [aspect, camera]);
  return null;
}

function Bead({
  plugin,
  angle,
  radius,
  color,
  active,
  ghost,
  registry,
  onHover,
  onSelect,
}: {
  plugin: LandingPlugin;
  angle: number;
  radius: number;
  color: string;
  active: boolean;
  ghost?: boolean;
  registry: RefObject<LabelRegistry>;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as const, [angle, radius]);
  const scale = useRef(1);

  useEffect(() => {
    const e = entry(registry.current, plugin.id);
    e.mesh = mesh.current;
    return () => {
      e.mesh = null;
    };
  }, [registry, plugin.id]);

  useFrame((_, dt) => {
    if (!mesh.current) return;
    const target = active ? 1.9 : 1;
    scale.current += (target - scale.current) * Math.min(1, dt * 12);
    mesh.current.scale.setScalar(scale.current);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(plugin.id);
    document.body.style.cursor = 'pointer';
  };
  const out = () => {
    onHover(null);
    document.body.style.cursor = '';
  };

  return (
    <group position={pos as unknown as [number, number, number]}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: three.js mesh, not a DOM element; the plugin list is exposed to assistive tech outside the canvas */}
      <mesh
        ref={mesh}
        onPointerOver={over}
        onPointerOut={out}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(plugin.id);
        }}
      >
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={ghost ? 0.35 : 1} />
        <mesh scale={2.6}>
          <sphereGeometry args={[0.085, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </mesh>
      <mesh scale={2.2} raycast={() => null}>
        <sphereGeometry args={[0.085, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.3 : 0.08} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Ring({
  ring,
  tone,
  active,
  animate,
  registry,
  onHover,
  onSelect,
}: {
  ring: ConstellationRing;
  tone: 'dark' | 'light';
  active: string | null;
  animate: boolean;
  registry: RefObject<LabelRegistry>;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const spin = useRef<THREE.Group>(null);
  const paused = useRef(false);
  paused.current = Boolean(active && ring.plugins.some((p) => p.id === active));
  useFrame((_, dt) => {
    if (spin.current && animate && !paused.current) spin.current.rotation.y += dt * ring.speed;
  });
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push([Math.cos(a) * ring.radius, 0, Math.sin(a) * ring.radius]);
    }
    return pts;
  }, [ring.radius]);
  const n = ring.plugins.length;
  return (
    <group rotation={ring.tilt}>
      <Line
        points={points}
        color={tone === 'dark' ? '#ffffff' : '#121214'}
        transparent
        opacity={tone === 'dark' ? 0.12 : 0.14}
        lineWidth={1}
        dashed={ring.ghost}
        dashSize={0.12}
        gapSize={0.12}
      />
      <group ref={spin}>
        {ring.plugins.map((p, i) => (
          <Bead
            key={p.id}
            plugin={p}
            angle={(i / n) * Math.PI * 2 + ring.radius}
            radius={ring.radius}
            color={ring.color}
            active={active === p.id}
            ghost={ring.ghost}
            registry={registry}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </group>
    </group>
  );
}

export default function ConstellationScene({ rings, tone, active, animate, running, onHover, onSelect }: SceneProps) {
  // Touch screens keep native scrolling over the canvas: no drag-to-orbit there, taps still pick.
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(window.matchMedia('(pointer: coarse)').matches), []);
  const registry = useRef<LabelRegistry>(new Map());
  const all = rings.flatMap((r) => r.plugins);
  return (
    <div className="absolute inset-0">
      <Canvas
        frameloop={running ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ position: [0, 3.9, 8.4], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onPointerMissed={() => onHover(null)}
        style={{ touchAction: 'pan-y' }}
      >
        <CameraFit />
        <LabelSync registry={registry} active={active} />
        <Core animate={animate} />
        {rings.map((r) => (
          <Ring
            key={r.id}
            ring={r}
            tone={tone}
            active={active}
            animate={animate}
            registry={registry}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
        {!touch && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.55}
            minPolarAngle={Math.PI * 0.22}
            maxPolarAngle={Math.PI * 0.62}
            enableDamping
          />
        )}
      </Canvas>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {all.map((p) => (
          <div
            key={p.id}
            ref={(el) => {
              entry(registry.current, p.id).el = el;
            }}
            className={cn(
              'absolute top-0 left-0 whitespace-nowrap rounded-full px-1.5 py-px font-medium text-[10.5px] opacity-0 transition-[background-color,color] duration-200 select-none will-change-transform',
              p.id === active
                ? 'bg-brand text-white'
                : tone === 'dark'
                  ? 'text-[rgba(244,244,245,0.92)]'
                  : 'text-[rgba(18,18,20,0.88)]',
            )}
          >
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}
