'use client';

/**
 * The hero phone in three.js (react-three-fiber). Loaded by `hero.tsx` only after the headline and
 * the static phone have painted; it fades in exactly over the static phone (same camera and pose,
 * from `hero-pose.ts`) and then follows the scroll and, gently, the pointer.
 *
 * - The phone is modelled here from primitives (no downloaded mesh): a graphite metal frame with
 *   rounded corners, an edge-to-edge glass front, a 20:9 screen, a punch-hole camera, side keys
 *   and a camera island on the back. We found no redistributable model of a generic modern phone
 *   with a separate screen mesh (see `public/models/CREDITS.md`).
 * - The screen shows the app's real chat recording: the same <video> element the static phone
 *   plays, as a `VideoTexture`, so the hand-off keeps the frame. Its poster is shown until the
 *   video can play.
 * - Lighting: "Studio Small 09" from Poly Haven (CC0, 256 × 128, self-hosted) as the environment,
 *   plus soft rectangular light panels. The panel rig is adapted from sanidhyy/apple-clone
 *   (`src/components/Lights.jsx`; MIT License, Copyright (c) 2024 Sanidhya Kumar Verma): three
 *   large rect Lightformers and a narrow top spotlight. We added a 北大红 panel behind the phone,
 *   which gives the frame its red rim.
 * - The orbit: see `Orbit` below. Colours mirror the tokens in `app/global.css` (three.js needs
 *   them as values).
 *
 * Performance: one canvas, ~15 meshes, DPR ≤ 1.5, no shadows or post-processing; the loop runs
 * only while the hero is on screen and the tab is visible.
 */

import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_Z, FOV, PHONE, poseAt, VIEW_H } from './hero-pose';

export type BeadKind = 'campus' | 'core' | 'remote';

export interface PhoneSceneProps {
  progress: MotionValue<number>;
  /** one bead per plugin in the marketplace, in registry order */
  beads: BeadKind[];
  narrow: boolean;
  running: boolean;
  tone: 'dark' | 'light';
  /** id of the <video> element the static phone plays */
  videoId: string;
  poster?: string;
  onReady: () => void;
}

export default function PhoneScene(props: PhoneSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={props.running ? 'always' : 'never'}
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <Lights />
      <Phone {...props} />
    </Canvas>
  );
}

function Lights() {
  return (
    <>
      <Environment files="/models/studio_small_09_256.hdr" resolution={256} frames={2} environmentIntensity={0.9}>
        <Lightformer form="rect" intensity={6} position={[-1, 0, -10]} scale={10} color="#495057" />
        <Lightformer form="rect" intensity={5} position={[-10, 2, 1]} scale={10} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={5} position={[10, 0, 1]} scale={10} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={9} position={[3, 1, -6]} scale={[3, 10, 1]} color="#c42236" />
      </Environment>
      <spotLight position={[0, 15, 5]} angle={0.15} penumbra={1} decay={0.1} intensity={Math.PI * 2.4} />
      <directionalLight position={[4, 2, -4]} intensity={2.2} color="#ff5a6a" />
    </>
  );
}

/** A rounded rectangle in the XY plane, with UVs from 0 to 1 over its bounds. */
function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 16);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - x) / w;
    uv[i * 2 + 1] = (pos.getY(i) - y) / h;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
}

function useScreenTexture(videoId: string, poster: string | undefined, onFirst: () => void) {
  const [state] = useMemo(() => [{ tex: null as THREE.Texture | null }], []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#0b0b0d', toneMapped: false }), []);
  const invalidate = useThree((s) => s.invalidate);
  // biome-ignore lint/correctness/useExhaustiveDependencies: set up once per video element
  useEffect(() => {
    let disposed = false;
    const sw = PHONE.w - PHONE.bezel * 2;
    const sh = PHONE.h - PHONE.bezel * 2;
    const fit = (t: THREE.Texture, aspect: number) => {
      // object-fit: cover, centred
      const screen = sw / sh;
      if (aspect < screen) {
        t.repeat.set(1, aspect / screen);
        t.offset.set(0, (1 - aspect / screen) / 2);
      } else {
        t.repeat.set(screen / aspect, 1);
        t.offset.set((1 - screen / aspect) / 2, 0);
      }
      t.colorSpace = THREE.SRGBColorSpace;
    };
    const use = (t: THREE.Texture) => {
      if (disposed) return;
      state.tex?.dispose();
      state.tex = t;
      material.map = t;
      material.color.set('#ffffff');
      material.needsUpdate = true;
      invalidate();
      onFirst();
    };
    const video = document.getElementById(videoId) as HTMLVideoElement | null;
    const fromVideo = () => {
      if (!video || disposed) return;
      const t = new THREE.VideoTexture(video);
      fit(t, video.videoWidth / Math.max(1, video.videoHeight) || 0.45);
      use(t);
    };
    if (video && video.readyState >= 2) fromVideo();
    else {
      if (poster)
        new THREE.TextureLoader().load(poster, (t) => {
          if (state.tex) return; // the video won the race
          fit(t, t.image.width / Math.max(1, t.image.height));
          use(t);
        });
      else onFirst();
      video?.addEventListener('loadeddata', fromVideo, { once: true });
    }
    return () => {
      disposed = true;
      video?.removeEventListener('loadeddata', fromVideo);
      state.tex?.dispose();
      material.dispose();
    };
  }, [videoId, poster]);
  return material;
}

function Phone({ progress, narrow, videoId, poster, onReady, beads, tone }: PhoneSceneProps) {
  const group = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const shown = useRef(0);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0, weight: 0 });
  const readyCalled = useRef(false);
  const ready = () => {
    if (readyCalled.current) return;
    readyCalled.current = true;
    // two frames later the canvas holds the phone at the rest pose
    requestAnimationFrame(() => requestAnimationFrame(onReady));
  };
  const screen = useScreenTexture(videoId, poster, ready);

  const geo = useMemo(() => {
    const sw = PHONE.w - PHONE.bezel * 2;
    const sh = PHONE.h - PHONE.bezel * 2;
    return {
      glass: roundedRect(PHONE.w - 0.012, PHONE.h - 0.012, PHONE.radius - 0.006),
      screen: roundedRect(sw, sh, PHONE.screenRadius),
      hole: new THREE.CircleGeometry(0.019, 32),
      lens: new THREE.CylinderGeometry(0.085, 0.085, 0.03, 48),
      lensGlass: new THREE.CircleGeometry(0.06, 40),
    };
  }, []);
  useEffect(
    () => () => {
      for (const g of Object.values(geo)) g.dispose();
    },
    [geo],
  );

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const k = Math.min(1, dt * 9);
    shown.current += (progress.get() - shown.current) * k;
    const p = poseAt(shown.current, narrow, size.width / Math.max(1, size.height));
    const pt = pointer.current;
    pt.weight += (1 - pt.weight) * Math.min(1, dt * 1.2); // pointer influence fades in after hand-off
    pt.x += (pt.tx - pt.x) * Math.min(1, dt * 4);
    pt.y += (pt.ty - pt.y) * Math.min(1, dt * 4);
    g.position.set((p.x / 100) * VIEW_H, (-p.y / 100) * VIEW_H, 0);
    g.scale.setScalar(p.scale);
    g.rotation.set(p.rx + pt.y * 0.06 * pt.weight, p.ry + pt.x * 0.1 * pt.weight, 0);
  });

  const zFront = PHONE.d / 2;
  return (
    <group ref={group} position={[0, -10, 0]}>
      {/* frame */}
      <RoundedBox args={[PHONE.w, PHONE.h, PHONE.d]} radius={PHONE.radius} smoothness={8} bevelSegments={6}>
        <meshPhysicalMaterial
          color="#3b3b40"
          metalness={0.92}
          roughness={0.3}
          clearcoat={0.5}
          clearcoatRoughness={0.25}
        />
      </RoundedBox>
      {/* front glass */}
      <mesh geometry={geo.glass} position={[0, 0, zFront + 0.0008]}>
        <meshPhysicalMaterial color="#030304" roughness={0.04} metalness={0} clearcoat={1} clearcoatRoughness={0.03} />
      </mesh>
      {/* screen */}
      <mesh geometry={geo.screen} material={screen} position={[0, 0, zFront + 0.0016]} />
      {/* a faint reflection over the screen */}
      <mesh geometry={geo.glass} position={[0, 0, zFront + 0.0024]}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.07}
          roughness={0.05}
          metalness={1}
          depthWrite={false}
        />
      </mesh>
      {/* punch-hole camera */}
      <mesh geometry={geo.hole} position={[0, PHONE.h / 2 - PHONE.bezel - 0.045, zFront + 0.003]}>
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* side keys */}
      <RoundedBox args={[0.016, 0.24, 0.034]} radius={0.007} smoothness={3} position={[PHONE.w / 2 + 0.004, 0.42, 0]}>
        <meshStandardMaterial color="#45454b" metalness={0.9} roughness={0.32} />
      </RoundedBox>
      <RoundedBox args={[0.016, 0.13, 0.034]} radius={0.007} smoothness={3} position={[PHONE.w / 2 + 0.004, 0.1, 0]}>
        <meshStandardMaterial color="#45454b" metalness={0.9} roughness={0.32} />
      </RoundedBox>
      {/* back: camera island and two lenses */}
      <RoundedBox
        args={[0.44, 0.46, 0.036]}
        radius={0.1}
        smoothness={5}
        position={[-PHONE.w / 2 + 0.31, PHONE.h / 2 - 0.33, -zFront - 0.012]}
      >
        <meshPhysicalMaterial color="#1b1b1f" metalness={0.6} roughness={0.2} clearcoat={1} />
      </RoundedBox>
      {[0.1, -0.1].map((dy) => (
        <group
          key={dy}
          position={[-PHONE.w / 2 + 0.26, PHONE.h / 2 - 0.33 + dy, -zFront - 0.036]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <mesh geometry={geo.lens}>
            <meshStandardMaterial color="#4a4a50" metalness={1} roughness={0.25} />
          </mesh>
          <mesh geometry={geo.lensGlass} position={[0, -0.016, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial color="#06070c" roughness={0.02} clearcoat={1} metalness={0.2} />
          </mesh>
        </group>
      ))}
      <Orbit beads={beads} progress={progress} tone={tone} />
    </group>
  );
}

/* ---- The orbit ----------------------------------------------------------------------------
 * The logo's idea in 3D: an open orbit (the arc of the "P", 312°, gap where the stem would be)
 * circles the phone, and the agent travels it as a bead of 北大红 light that lights the frame as
 * it passes. As you scroll, one bead per plugin in the marketplace joins the orbit.
 */

const ORBIT_R = 1.32;
const ARC = (312 * Math.PI) / 180;
const ARC_START = Math.PI + (24 * Math.PI) / 180; // gap centred on the left, as in the mark
const BEAD_COLOR: Record<BeadKind, string> = { campus: '#ff5a6a', core: '#ba9570', remote: '#9fb3dc' };

function arcPoint(t: number, out = new THREE.Vector3()) {
  const a = ARC_START + t * ARC;
  return out.set(Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R);
}

function haloTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  if (g) {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.25, 'rgba(255,120,135,0.55)');
    grd.addColorStop(1, 'rgba(196,34,54,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Orbit({
  beads,
  progress,
  tone,
}: {
  beads: BeadKind[];
  progress: MotionValue<number>;
  tone: 'dark' | 'light';
}) {
  const bead = useRef<THREE.Group>(null);
  const plugins = useRef<THREE.Group>(null);
  const born = useRef(0);
  const shown = useRef(0);
  const SEG = 240;
  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= SEG; i++) pts.push(arcPoint(i / SEG));
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    g.setDrawRange(0, 0);
    const m = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.32 });
    return new THREE.Line(g, m);
  }, []);
  const halo = useMemo(haloTexture, []);
  useEffect(() => {
    const m = line.material as THREE.LineBasicMaterial;
    m.color.set(tone === 'dark' ? '#ffffff' : '#1d1d1f');
    m.opacity = tone === 'dark' ? 0.32 : 0.28;
  }, [line, tone]);
  const beadGeo = useMemo(() => new THREE.SphereGeometry(1, 24, 24), []);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
      halo.dispose();
      beadGeo.dispose();
    },
    [line, halo, beadGeo],
  );
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, dt) => {
    // the orbit draws itself once, after the hand-off
    born.current = Math.min(1, born.current + dt / 1.4);
    const e = 1 - (1 - born.current) ** 3;
    line.geometry.setDrawRange(0, Math.floor(e * (SEG + 1)));
    // the agent: one lap every ~14 s, appearing at the end of the drawn arc
    const lap = (clock.getElapsedTime() / 14) % 1;
    if (bead.current) {
      arcPoint(born.current < 1 ? e : lap, tmp);
      bead.current.position.copy(tmp);
      bead.current.scale.setScalar(e);
    }
    // plugins join as you scroll
    shown.current += (progress.get() - shown.current) * Math.min(1, dt * 6);
    const kids = plugins.current?.children ?? [];
    kids.forEach((k, i) => {
      const at = 0.06 + (0.6 * i) / Math.max(1, kids.length);
      const target = born.current >= 1 && shown.current > at ? 1 : 0;
      const s = k.scale.x + (target - k.scale.x) * Math.min(1, dt * 8);
      k.scale.setScalar(Math.max(0.0001, s));
    });
  });

  return (
    <group rotation={[0.42, 0, -0.32]}>
      <primitive object={line} />
      <group ref={bead} scale={0.0001}>
        <mesh geometry={beadGeo} scale={0.05}>
          <meshBasicMaterial color={tone === 'dark' ? '#ffffff' : '#c42236'} toneMapped={false} />
        </mesh>
        <sprite scale={tone === 'dark' ? 0.5 : 0.36}>
          <spriteMaterial
            map={halo}
            transparent
            opacity={tone === 'dark' ? 1 : 0.7}
            depthWrite={false}
            blending={tone === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </sprite>
        <pointLight color="#ff4d5e" intensity={2.4} distance={2.2} decay={2} />
      </group>
      <group ref={plugins}>
        {beads.map((kind, i) => {
          const pos = arcPoint((i + 0.5) / beads.length);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: one bead per slot on the orbit; the slot is the identity
            <group key={i} position={pos} scale={0.0001}>
              <mesh geometry={beadGeo} scale={0.026}>
                <meshStandardMaterial
                  color={BEAD_COLOR[kind]}
                  emissive={BEAD_COLOR[kind]}
                  emissiveIntensity={0.9}
                  roughness={0.3}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
