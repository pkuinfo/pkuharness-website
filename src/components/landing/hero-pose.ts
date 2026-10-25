/**
 * One source of truth for the hero phone: its size, the camera, and where it sits at every point
 * of the scroll sequence. The static frame (HTML/CSS, painted first) and the three.js phone (loaded
 * later) both read these numbers, so the 3D phone can fade in over the static one without a jump.
 *
 * Units: positions are in svh (percent of the viewport height) from the viewport centre, x to the
 * right and y down, as CSS does it. The 3D scene converts them to world units. Rotations are in
 * radians in three.js's convention (CSS flips the sign of X, see `poseToCss`).
 */

/** Vertical field of view of the hero camera, degrees. CSS uses the same focal length. */
export const FOV = 24;
/** Camera distance from the phone's plane, world units. */
export const CAMERA_Z = 10;
/** World height visible at z = 0. */
export const VIEW_H = 2 * CAMERA_Z * Math.tan((FOV * Math.PI) / 360);

/** The phone body, world units (a modern 20:9 Android phone). */
export const PHONE = {
  w: 1,
  h: 2.1,
  d: 0.088,
  radius: 0.115,
  /** screen inset from the body edge, on each side */
  bezel: 0.03,
  screenRadius: 0.09,
};
/** Rendered phone height at scale 1, as a fraction of the viewport height. */
export const PHONE_SVH = (PHONE.h / VIEW_H) * 100;

export interface Pose {
  /** svh from the viewport centre */
  x: number;
  y: number;
  scale: number;
  /** radians, three.js convention */
  rx: number;
  ry: number;
}

type Key = [at: number, pose: Pose];

/**
 * Rest pose = progress 0, as in the static first paint. Wide screens: the phone stands in the right
 * half, turned a little toward the headline on the left. Narrow screens: low in the frame under
 * the headline, leaning back.
 */
const WIDE: Key[] = [
  [0, { x: 22, y: 2, scale: 1.16, rx: -0.05, ry: -0.3 }],
  [0.38, { x: 0, y: 0, scale: 1.24, rx: 0, ry: 0 }],
  [0.72, { x: -19, y: 1, scale: 1.08, rx: 0, ry: 0.36 }],
  [1, { x: -19, y: 1, scale: 1.08, rx: 0, ry: 0.36 }],
];
const NARROW: Key[] = [
  [0, { x: 0, y: 32, scale: 0.95, rx: -0.3, ry: 0 }],
  [0.38, { x: 0, y: 0, scale: 1.12, rx: 0, ry: 0 }],
  [0.72, { x: 0, y: -19, scale: 0.72, rx: 0, ry: -0.22 }],
  [1, { x: 0, y: -19, scale: 0.72, rx: 0, ry: -0.22 }],
];

/** In WIDE, x is given in vw (it moves the phone beside the text); convert it to svh. */
function keys(narrow: boolean, aspect: number): Key[] {
  if (narrow) return NARROW;
  return WIDE.map(([at, p]) => [at, { ...p, x: p.x * aspect }]);
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2); // ease-in-out cubic
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function poseAt(progress: number, narrow: boolean, aspect: number): Pose {
  const k = keys(narrow, aspect);
  const p = Math.min(1, Math.max(0, progress));
  for (let i = 0; i < k.length - 1; i++) {
    const [a0, pa] = k[i];
    const [a1, pb] = k[i + 1];
    if (p <= a1) {
      const t = ease((p - a0) / (a1 - a0));
      return {
        x: mix(pa.x, pb.x, t),
        y: mix(pa.y, pb.y, t),
        scale: mix(pa.scale, pb.scale, t),
        rx: mix(pa.rx, pb.rx, t),
        ry: mix(pa.ry, pb.ry, t),
      };
    }
  }
  return k[k.length - 1][1];
}

/**
 * The same pose as a CSS transform for an element centred in the viewport, inside a container
 * with `perspective: var(--lp-hero-f)` (see `PERSPECTIVE_CSS`). CSS's y axis points down, so the
 * X rotation changes sign; Y rotation keeps it.
 */
export function poseToCss(p: Pose): string {
  return `translate3d(${p.x.toFixed(3)}svh, ${p.y.toFixed(3)}svh, 0) rotateX(${(-p.rx).toFixed(4)}rad) rotateY(${p.ry.toFixed(4)}rad) scale(${p.scale.toFixed(4)})`;
}

/** Focal length for CSS: half the viewport height over tan(fov / 2). */
export const PERSPECTIVE_CSS = `calc(50svh / ${Math.tan((FOV * Math.PI) / 360).toFixed(6)})`;

/** Rest poses for the first paint. Wide x depends on the aspect, so CSS gets it in vw (see below). */
export const REST_CSS = {
  wide: poseToCss(poseAt(0, false, 1)).replace(/^translate3d\(([-\d.]+)svh/, 'translate3d($1vw'),
  narrow: poseToCss(poseAt(0, true, 0.5)),
};
