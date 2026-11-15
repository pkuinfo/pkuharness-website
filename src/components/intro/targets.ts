/**
 * The shapes the particles take, as point clouds: a sphere, a spiral galaxy, a wave plane, 博雅塔
 * (the pagoda by the Unnamed Lake, built here from octagons, no photo), the bird mark sampled from
 * public/brand/mark-white.svg, and the "PKU harness" wordmark sampled from rendered text.
 * Each shape is roughly unit size (see FORMS); the stage scales it to the viewport. Shared by the
 * WebGL stage and the 2D fallback.
 */

export const FORMS = ['sphere', 'galaxy', 'wave', 'pagoda', 'bird', 'wordmark'] as const;
export type Form = (typeof FORMS)[number];

/** Small seeded generator, so the shapes are the same on every visit. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gauss = (r: () => number) => (r() + r() + r() + r() - 2) / 2;

/** Radius 1: most points on the shell, some inside, so it reads as a volume. */
function sphere(n: number) {
  const r = rng(11);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1;
    const a = r() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const rad = r() < 0.72 ? 1 : Math.cbrt(r()) * 0.96;
    out.set([Math.cos(a) * s * rad, u * rad, Math.sin(a) * s * rad], i * 3);
  }
  return out;
}

/** A three-armed spiral in the xz plane, radius about 1.3, with a bright core. */
function galaxy(n: number) {
  const r = rng(23);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    if (r() < 0.16) {
      const u = r() * 2 - 1;
      const a = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const rad = r() ** 2 * 0.3;
      out.set([Math.cos(a) * s * rad, u * rad * 0.6, Math.sin(a) * s * rad], i * 3);
      continue;
    }
    const rad = 0.12 + r() ** 0.7 * 1.2;
    const arm = Math.floor(r() * 3);
    const theta = (arm * Math.PI * 2) / 3 + rad * 3.4 + gauss(r) * 0.55 * (1.35 - rad);
    out.set([Math.cos(theta) * rad, gauss(r) * 0.07 * (1.5 - rad), Math.sin(theta) * rad], i * 3);
  }
  return out;
}

/** A jittered grid, x in ±2 and z in ±1.3, at y = -0.75; the shader makes it ripple. */
function wave(n: number) {
  const r = rng(37);
  const out = new Float32Array(n * 3);
  const cols = Math.ceil(Math.sqrt(n * 1.55));
  const rows = Math.ceil(n / cols);
  for (let i = 0; i < n; i++) {
    const cx = (i % cols) / (cols - 1);
    const cz = Math.floor(i / cols) / Math.max(1, rows - 1);
    out.set([(cx * 2 - 1) * 2 + (r() - 0.5) * 0.02, -0.75, (cz * 2 - 1) * 1.3 + (r() - 0.5) * 0.02], i * 3);
  }
  return out;
}

/**
 * 博雅塔: an octagonal, thirteen-storey, dense-eave brick pagoda. Height 2 (y from -1 to 1): a
 * platform, a tall first storey, twelve short tapering storeys each with a flared eave, a roof
 * cone and a spire.
 */
function pagoda(n: number) {
  const r = rng(53);
  const out = new Float32Array(n * 3);
  /** A point on an octagon of circumradius `rad` (flat faces, not a circle). */
  const oct = (rad: number, y: number, i: number) => {
    const k = Math.floor(r() * 8);
    const t = r();
    const a0 = (k * Math.PI) / 4 + Math.PI / 8;
    const a1 = a0 + Math.PI / 4;
    out.set(
      [(Math.cos(a0) * (1 - t) + Math.cos(a1) * t) * rad, y, (Math.sin(a0) * (1 - t) + Math.sin(a1) * t) * rad],
      i * 3,
    );
  };
  const tiers = 12;
  const bodyTop = 0.62;
  const firstTop = -0.6;
  for (let i = 0; i < n; i++) {
    const pick = r();
    if (pick < 0.06) {
      // Platform: the rim and the top surface.
      oct(0.44 * (r() < 0.5 ? 1 : Math.sqrt(r())), -1 + r() * 0.08, i);
    } else if (pick < 0.2) {
      // First storey.
      oct(0.3, -0.92 + r() * (firstTop + 0.92), i);
    } else if (pick < 0.88) {
      const k = Math.floor(r() * tiers);
      // Storeys get shorter and narrower toward the top.
      const y0 = firstTop + (bodyTop - firstTop) * (1 - (1 - k / tiers) ** 1.25);
      const y1 = firstTop + (bodyTop - firstTop) * (1 - (1 - (k + 1) / tiers) ** 1.25);
      const rad = 0.3 - 0.115 * (k / tiers);
      if (r() < 0.55) {
        oct(rad, y0 + r() * (y1 - y0) * 0.72, i);
      } else {
        // Eave: flares out under the next storey and droops slightly at the edge.
        const t = r();
        oct(rad * (1 + 0.34 * t), y0 + (y1 - y0) * (0.78 + 0.16 * (1 - t * t)), i);
      }
    } else if (pick < 0.95) {
      // Roof cone.
      const t = r();
      oct(0.2 * (1 - t) + 0.025, bodyTop + t * 0.13, i);
    } else {
      // Spire: a thin mast with three rings and a tip.
      const t = r();
      const y = 0.75 + t * 0.25;
      const ring = Math.max(0, 1 - Math.abs(((t * 4) % 1) - 0.5) * 6) * (t < 0.8 ? 0.035 : 0);
      const a = r() * Math.PI * 2;
      const rad = 0.008 + ring;
      out.set([Math.cos(a) * rad, y, Math.sin(a) * rad], i * 3);
    }
  }
  return out;
}

/** Points inside the opaque pixels of a canvas, in a box of width 2 centred on the origin. */
function fromCanvas(canvas: HTMLCanvasElement, n: number, depth: number, seed: number) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2d canvas unavailable');
  const { width: W, height: H } = canvas;
  const data = ctx.getImageData(0, 0, W, H).data;
  const inside: number[] = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 128) inside.push(x, y);
  const r = rng(seed);
  const out = new Float32Array(n * 3);
  const count = inside.length / 2;
  if (!count) return out;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(r() * count);
    out.set(
      [((inside[k * 2] + r()) / W) * 2 - 1, -(((inside[k * 2 + 1] + r()) / W) * 2 - H / W), (r() - 0.5) * depth],
      i * 3,
    );
  }
  return out;
}

async function bird(n: number) {
  const img = new Image();
  img.decoding = 'async';
  img.src = '/brand/mark-white.svg';
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 360;
  canvas.getContext('2d')?.drawImage(img, 0, 0, 360, 360);
  return fromCanvas(canvas, n, 0.08, 71);
}

async function wordmark(n: number, fontFamily: string) {
  try {
    await document.fonts.load(`650 100px ${fontFamily}`, 'PKU harness');
  } catch {
    // Falls back to whatever sans-serif is available.
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = `650 210px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    // Fit the text to the canvas width, whatever the font's metrics.
    const w = ctx.measureText('PKU harness').width;
    ctx.setTransform(Math.min(1, 1340 / w), 0, 0, Math.min(1, 1340 / w), 700, 150);
    ctx.fillText('PKU harness', 0, 8);
  }
  return fromCanvas(canvas, n, 0.05, 83);
}

/** All six shapes for `n` particles, in FORMS order. */
export async function buildTargets(n: number, fontFamily: string): Promise<Float32Array[]> {
  const safe = <T>(p: Promise<T>, fallback: T) => p.catch(() => fallback);
  const [b, w] = await Promise.all([safe(bird(n), sphere(n)), safe(wordmark(n, fontFamily), sphere(n))]);
  return [sphere(n), galaxy(n), wave(n), pagoda(n), b, w];
}

/** Per-shape view: spin speed about the vertical axis (rad/s) and tilt toward the viewer (rad). */
export const FORM_VIEW: Record<Form, { spin: number; tilt: number; sway: number }> = {
  sphere: { spin: 0.16, tilt: 0.28, sway: 0 },
  galaxy: { spin: 0.1, tilt: 1.02, sway: 0 },
  wave: { spin: 0, tilt: 0.42, sway: 0.12 },
  pagoda: { spin: 0, tilt: 0.06, sway: 0.5 },
  bird: { spin: 0, tilt: 0, sway: 0.22 },
  wordmark: { spin: 0, tilt: 0, sway: 0.1 },
};

/** Visible world size at the particles' plane for a 35° camera 6 units away. */
export const CAMERA = { fov: 35, z: 6 } as const;
export function viewSize(aspect: number) {
  const h = 2 * Math.tan((CAMERA.fov * Math.PI) / 360) * CAMERA.z;
  return { w: h * aspect, h };
}

/** How big each shape is drawn, and how far it is lifted, for a viewport of this aspect. */
export function formFit(aspect: number): Record<Form, { scale: number; y: number }> {
  const { w, h } = viewSize(aspect);
  return {
    sphere: { scale: Math.min(w * 0.36, h * 0.3), y: 0 },
    galaxy: { scale: Math.min(w * 0.4, h * 0.36), y: 0 },
    wave: { scale: Math.min((w * 0.62) / 2, h * 0.42), y: -h * 0.02 },
    pagoda: { scale: h * 0.33, y: -h * 0.01 },
    bird: { scale: Math.min(w * 0.34, h * 0.25), y: h * 0.03 },
    wordmark: { scale: Math.min(w * 0.43, h * 0.75), y: h * 0.06 },
  };
}

/**
 * Scroll progress `u` (0 … FORMS.length − 1) to the pair of shapes on screen and the mix between
 * them. Each shape holds for a while around its integer, so stopping anywhere near it shows it whole.
 */
export function formMix(u: number) {
  const i = Math.min(FORMS.length - 2, Math.max(0, Math.floor(u)));
  const f = Math.min(1, Math.max(0, (u - i - 0.18) / 0.64));
  return { i, f };
}

/** How present shape `k` is at progress `u` (1 on its hold, 0 one shape away). */
export function formWeight(u: number, k: number) {
  const { i, f } = formMix(u);
  if (k === i) return 1 - f;
  if (k === i + 1) return f;
  return 0;
}
