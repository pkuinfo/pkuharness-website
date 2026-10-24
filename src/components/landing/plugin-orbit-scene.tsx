'use client';

/**
 * The plugin orbit, in three.js (react-three-fiber). Loaded only near the viewport by
 * `plugin-orbit.tsx`; never rendered on the server.
 *
 * - Centre: the PKU Harness mark built in 3D from the brand geometry (`components/brand/logo.tsx`,
 *   viewBox 120): a red tile, the white stem and the open orbit, and the agent as a lit bead.
 * - Rings: every plugin in the marketplace registry is a bead on a ring. Inner ring: features of
 *   the app itself; outer ring: campus services; a third, steeper ring: remote (MCP) plugins.
 * - Ground: a field of dots in slow waves, ported from 21st.dev: efferd/dotted-surface (40 × 60
 *   points, two sine waves). Changes: the wave runs in the vertex shader instead of rewriting the
 *   buffer on the CPU every frame, dots fade with distance, theme colours from our tokens.
 * - Interaction: adapted from 21st.dev: jatin-yadav05/radial-orbital-timeline (nodes on an orbit
 *   that rotates on its own; choosing a node stops the rotation, highlights it and opens its
 *   details). Here the details live in the DOM panel beside the canvas, and a beam runs from the
 *   mark to the chosen plugin. Drag turns the whole system; vertical drags are left to the page.
 *
 * Performance: one canvas, ~40 meshes, DPR ≤ 1.5, the loop stops when the canvas is off-screen or
 * the tab is hidden, and runs on demand only under reduced motion.
 */

import { Html, RoundedBox } from '@react-three/drei';
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { LandingPlugin } from './registry';

export type OrbitGroup = 'core' | 'campus' | 'remote';
export interface OrbitPlugin extends LandingPlugin {
  group: OrbitGroup;
}

export interface OrbitSceneProps {
  plugins: OrbitPlugin[];
  activeId: string | null;
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
  tone: 'dark' | 'light';
  running: boolean;
  reduce: boolean;
  /** Drag offsets from the DOM wrapper (radians), read every frame. */
  drag: React.RefObject<{ yaw: number; pitch: number; kick?: () => void }>;
}

const RINGS: Record<OrbitGroup, { radius: number; tilt: [number, number, number]; speed: number }> = {
  core: { radius: 2.35, tilt: [0.32, 0, -0.1], speed: 0.07 },
  campus: { radius: 3.55, tilt: [0.22, 0, 0.12], speed: -0.045 },
  remote: { radius: 4.15, tilt: [0.62, 0, 0.42], speed: 0.03 },
};

const PALETTE = {
  dark: {
    core: '#ba9570',
    campus: '#ff5a6a',
    remote: '#9fb3dc',
    ring: '#ffffff',
    ringOpacity: 0.13,
    dots: '#c8c8c8',
    fog: '#0a0a0a',
    mark: '#ffffff',
  },
  light: {
    core: '#895e43',
    campus: '#c42236',
    remote: '#475c87',
    ring: '#0a0a0a',
    ringOpacity: 0.16,
    dots: '#52525b',
    fog: '#ffffff',
    mark: '#ffffff',
  },
};

export default function PluginOrbitScene(props: OrbitSceneProps) {
  const { running, reduce, tone } = props;
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={running ? (reduce ? 'demand' : 'always') : 'never'}
      camera={{ position: [0, 2.3, 10.2], fov: 38, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'pan-y' }}
    >
      <fog attach="fog" args={[PALETTE[tone].fog, 9, 17]} />
      <ambientLight intensity={tone === 'dark' ? 0.5 : 0.9} />
      <directionalLight position={[4, 6, 8]} intensity={tone === 'dark' ? 1.6 : 1.8} />
      <pointLight position={[0, 0.4, 2.2]} color="#ff5a6a" intensity={6} distance={7} />
      <CameraFit />
      <System {...props} />
      <DottedGround tone={tone} reduce={reduce} />
    </Canvas>
  );
}

function System({ plugins, activeId, hoverId, onHover, onPick, tone, reduce, drag }: OrbitSceneProps) {
  const root = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const byGroup = useMemo(() => {
    const g: Record<OrbitGroup, OrbitPlugin[]> = { core: [], campus: [], remote: [] };
    for (const p of plugins) g[p.group].push(p);
    return g;
  }, [plugins]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: on-demand mode needs a new frame whenever these change
  useEffect(() => {
    invalidate();
  }, [activeId, hoverId, tone, invalidate]);
  // on-demand rendering (reduced motion): the wrapper asks for a frame while dragging
  useEffect(() => {
    if (drag.current) drag.current.kick = invalidate;
  }, [drag, invalidate]);

  useFrame((_, dt) => {
    const r = root.current;
    const d = drag.current;
    if (!r || !d) return;
    // The rings follow the drag; the mark stays facing you (it only sways on its own).
    const k = reduce ? 1 : Math.min(1, dt * 6);
    r.rotation.y += (d.yaw - r.rotation.y) * k;
    r.rotation.x += (d.pitch - r.rotation.x) * k;
  });

  return (
    <>
      <Mark reduce={reduce} />
      <group ref={root}>
        {(Object.keys(byGroup) as OrbitGroup[]).map((g) =>
          byGroup[g].length ? (
            <Ring
              key={g}
              group={g}
              plugins={byGroup[g]}
              activeId={activeId}
              hoverId={hoverId}
              onHover={onHover}
              onPick={onPick}
              tone={tone}
              reduce={reduce}
              yaw={root}
            />
          ) : null,
        )}
      </group>
    </>
  );
}

/** Narrow canvases (phones) step the camera back so the outer ring stays in frame. */
function CameraFit() {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useEffect(() => {
    const k = Math.max(1, 1.55 / aspect);
    camera.position.set(0, 2.3 * k, 10.2 * k);
    camera.lookAt(0, 0, 0);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = 9 * k;
      scene.fog.far = 17 * k;
    }
  }, [camera, scene, aspect]);
  return null;
}

/* ---- The mark ---------------------------------------------------------------------------- */

const S = 2.1 / 120; // brand units → scene units (tile is 2.1 wide)
const at = (x: number, y: number) => [(x - 60) * S, (60 - y) * S] as const;
const ORBIT = { cx: 62, cy: 53, r: 23, stroke: 13, start: -156, end: 156 };
const BEAD_DEG = -38;

function Mark({ reduce }: { reduce: boolean }) {
  const g = useRef<THREE.Group>(null);
  const [stemX, stemY] = at(33 + 7.5, 23.5 + 36);
  const [ox, oy] = at(ORBIT.cx, ORBIT.cy);
  const rad = (BEAD_DEG * Math.PI) / 180;
  const [bx, by] = at(ORBIT.cx + ORBIT.r * Math.cos(rad), ORBIT.cy + ORBIT.r * Math.sin(rad));
  const arc = ((ORBIT.end - ORBIT.start) * Math.PI) / 180;
  useFrame(({ clock }) => {
    if (!g.current || reduce) return;
    const t = clock.getElapsedTime();
    g.current.position.y = Math.sin(t * 0.8) * 0.06;
    g.current.rotation.y = Math.sin(t * 0.35) * 0.22;
  });
  return (
    <group ref={g}>
      <RoundedBox args={[2.1, 2.1, 0.42]} radius={0.42} smoothness={6}>
        <meshPhysicalMaterial color="#8b0012" roughness={0.32} metalness={0.1} clearcoat={1} clearcoatRoughness={0.2} />
      </RoundedBox>
      <group position={[0, 0, 0.25]}>
        <RoundedBox args={[15 * S, 72 * S, 0.12]} radius={0.04} smoothness={3} position={[stemX, stemY, 0]}>
          <meshStandardMaterial color="#fff4f5" roughness={0.4} />
        </RoundedBox>
        <mesh position={[ox, oy, 0]} rotation={[0, 0, (-ORBIT.end * Math.PI) / 180]}>
          <torusGeometry args={[ORBIT.r * S, (ORBIT.stroke / 2) * S, 16, 64, arc]} />
          <meshStandardMaterial color="#fff4f5" roughness={0.4} />
        </mesh>
        <mesh position={[bx, by, 0.1]}>
          <sphereGeometry args={[8.5 * S, 32, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ff8a96" emissiveIntensity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/* ---- Rings and plugin beads -------------------------------------------------------------- */

function Ring({
  group,
  plugins,
  activeId,
  hoverId,
  onHover,
  onPick,
  tone,
  reduce,
  yaw,
}: {
  group: OrbitGroup;
  plugins: OrbitPlugin[];
  activeId: string | null;
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
  tone: 'dark' | 'light';
  reduce: boolean;
  yaw: React.RefObject<THREE.Group | null>;
}) {
  const spin = useRef<THREE.Group>(null);
  const { radius, tilt, speed } = RINGS[group];
  const colors = PALETTE[tone];
  const loop = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);
  useEffect(() => () => loop.dispose(), [loop]);

  const paused = activeId !== null;
  const angleOf = (i: number) => (i / plugins.length) * Math.PI * 2 + (group === 'campus' ? 0.2 : 0);
  const activeIndex = plugins.findIndex((p) => p.id === activeId);
  useFrame((_, dt) => {
    const sp = spin.current;
    if (!sp) return;
    if (activeIndex >= 0) {
      // turn the ring so the chosen bead comes round to the front (radial-orbital-timeline's
      // centerViewOnNode): its angle minus the spin and the drag yaw should be +90°
      const target = angleOf(activeIndex) - (yaw.current?.rotation.y ?? 0) - Math.PI / 2;
      let diff = (target - sp.rotation.y) % (Math.PI * 2);
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      sp.rotation.y += reduce ? diff : diff * Math.min(1, dt * 3);
    } else if (!reduce && !paused) sp.rotation.y += dt * speed;
  });

  return (
    <group rotation={tilt}>
      <lineLoop geometry={loop}>
        <lineBasicMaterial color={colors.ring} transparent opacity={colors.ringOpacity} />
      </lineLoop>
      <group ref={spin}>
        {plugins.map((p, i) => {
          const a = angleOf(i);
          return (
            <Bead
              key={p.id}
              plugin={p}
              position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}
              color={colors[group]}
              active={activeId === p.id}
              hovered={hoverId === p.id}
              dim={activeId !== null && activeId !== p.id}
              onHover={onHover}
              onPick={onPick}
              tone={tone}
              reduce={reduce}
            />
          );
        })}
      </group>
    </group>
  );
}

const beadGeometry = new THREE.IcosahedronGeometry(1, 3);
const haloGeometry = new THREE.SphereGeometry(1, 16, 16);

function Bead({
  plugin,
  position,
  color,
  active,
  hovered,
  dim,
  onHover,
  onPick,
  tone,
  reduce,
}: {
  plugin: OrbitPlugin;
  position: [number, number, number];
  color: string;
  active: boolean;
  hovered: boolean;
  dim: boolean;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
  tone: 'dark' | 'light';
  reduce: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const base = plugin.group === 'campus' ? 0.12 : plugin.group === 'core' ? 0.1 : 0.13;
  const target = active ? 1.45 : hovered ? 1.35 : 1;
  const beam = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 }));
  }, []);
  useEffect(
    () => () => {
      beam.geometry.dispose();
      (beam.material as THREE.Material).dispose();
    },
    [beam],
  );
  useEffect(() => {
    (beam.material as THREE.LineBasicMaterial).color.set(color);
  }, [beam, color]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const inv = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }, dt) => {
    const m = mesh.current;
    if (!m) return;
    const s = reduce ? base * target : m.scale.x + (base * target - m.scale.x) * Math.min(1, dt * 10);
    m.scale.setScalar(s);
    if (halo.current) {
      const pulse = active && !reduce ? 1 + Math.sin(clock.getElapsedTime() * 3) * 0.15 : 1;
      halo.current.scale.setScalar(s * 2.2 * pulse);
    }
    // beam from the mark (world origin) to this bead, in the bead's parent space
    if (active && m.parent) {
      inv.copy(m.parent.matrixWorld).invert();
      tmp.set(0, 0, 0).applyMatrix4(inv);
      const pos = beam.geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, tmp.x, tmp.y, tmp.z);
      pos.setXYZ(1, position[0], position[1], position[2]);
      pos.needsUpdate = true;
    }
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
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a three.js mesh, not a DOM element; the DOM buttons beside the canvas are the accessible controls */}
      <mesh
        ref={mesh}
        position={position}
        geometry={beadGeometry}
        scale={base}
        onPointerOver={over}
        onPointerOut={out}
        onClick={(e) => {
          e.stopPropagation();
          onPick(plugin.id);
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active || hovered ? 1.4 : tone === 'dark' ? 0.55 : 0.25}
          roughness={0.35}
          transparent
          opacity={dim ? 0.35 : 1}
        />
      </mesh>
      <mesh ref={halo} position={position} geometry={haloGeometry} scale={base * 2.6} raycast={() => null}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.16 : hovered ? 0.12 : dim ? 0.03 : 0.07}
          depthWrite={false}
          blending={tone === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>
      {active && <primitive object={beam} />}
      {(active || hovered) && (
        <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <span className="lp-orbit-label">{plugin.name}</span>
        </Html>
      )}
    </>
  );
}

/* ---- Dotted ground (efferd/dotted-surface, in a shader) ---------------------------------- */

function DottedGround({ tone, reduce }: { tone: 'dark' | 'light'; reduce: boolean }) {
  const AMOUNTX = 40;
  const AMOUNTY = 60;
  const SEP = 0.42;
  const geo = useMemo(() => {
    const pos = new Float32Array(AMOUNTX * AMOUNTY * 3);
    const idx = new Float32Array(AMOUNTX * AMOUNTY * 2);
    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++)
      for (let iy = 0; iy < AMOUNTY; iy++) {
        pos[i * 3] = ix * SEP - (AMOUNTX * SEP) / 2;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = iy * SEP - (AMOUNTY * SEP) / 2;
        idx[i * 2] = ix;
        idx[i * 2 + 1] = iy;
        i++;
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('grid', new THREE.BufferAttribute(idx, 2));
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color() },
          uOpacity: { value: 0.5 },
          uPixel: { value: 1 },
        },
        vertexShader: /* glsl */ `
          attribute vec2 grid;
          uniform float uTime;
          uniform float uPixel;
          varying float vFade;
          void main() {
            vec3 p = position;
            p.y = sin((grid.x + uTime) * 0.3) * 0.16 + sin((grid.y + uTime) * 0.5) * 0.16;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float d = -mv.z;
            vFade = smoothstep(17.0, 7.0, d) * smoothstep(1.5, 4.0, d);
            gl_PointSize = uPixel * 2.6 * (8.0 / d);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying float vFade;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            if (dot(c, c) > 0.25) discard;
            gl_FragColor = vec4(uColor, uOpacity * vFade);
          }
        `,
      }),
    [],
  );
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  const dpr = useThree((s) => s.viewport.dpr);
  useEffect(() => {
    mat.uniforms.uColor.value.set(PALETTE[tone].dots);
    mat.uniforms.uOpacity.value = tone === 'dark' ? 0.45 : 0.4;
    mat.uniforms.uPixel.value = dpr;
  }, [mat, tone, dpr]);
  useFrame((_, dt) => {
    if (!reduce) mat.uniforms.uTime.value += dt * 3;
  });
  return <points geometry={geo} material={mat} position={[0, -2.7, -1]} />;
}
