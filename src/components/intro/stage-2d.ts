import type { Stage, StageFrame, StageOptions } from './stage';
import { buildTargets, CAMERA, FORM_VIEW, FORMS, formFit, formMix, formWeight, viewSize } from './targets';

/**
 * The stage without WebGL: the same shapes and the same scroll, with a couple of thousand points
 * projected and drawn on a 2D canvas. No bloom and no 3D balls (flat shaded discs bounce instead).
 */

const COUNT = 2200;

export class Stage2D implements Stage {
  readonly kind = '2d' as const;
  readonly count = COUNT;
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private w = 1;
  private h = 1;
  private dpr = 1;
  private seed = new Float32Array(COUNT * 2);
  private shocks: { x: number; y: number; at: number }[] = [];
  private now = 0;

  static async create(opts: StageOptions) {
    return new Stage2D(opts, await buildTargets(COUNT, opts.fontFamily));
  }

  private constructor(
    opts: StageOptions,
    private targets: Float32Array[],
  ) {
    let canvas = opts.canvas;
    let ctx = canvas.getContext('2d');
    if (!ctx) {
      // The canvas already holds a failed WebGL context: draw on a fresh one in its place.
      const fresh = document.createElement('canvas');
      fresh.className = canvas.className;
      canvas.replaceWith(fresh);
      canvas = fresh;
      ctx = canvas.getContext('2d');
    }
    if (!ctx) throw new Error('2d canvas unavailable');
    this.canvas = canvas;
    this.ctx = ctx;
    for (let i = 0; i < this.seed.length; i++) this.seed[i] = Math.random();
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w;
    this.h = h;
    this.dpr = Math.min(dpr, 2);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
  }

  shock(px: number, py: number) {
    const view = viewSize(this.w / this.h);
    this.shocks.push({ x: (px * view.w) / 2, y: (-py * view.h) / 2, at: this.now });
    if (this.shocks.length > 3) this.shocks.shift();
  }

  /** One shape's point `k`, spun, tilted, scaled and lifted, written into `out`. */
  private place(form: number, k: number, time: number, px: number, fit: ReturnType<typeof formFit>, out: number[]) {
    const name = FORMS[form];
    const t = this.targets[form];
    const v = FORM_VIEW[name];
    let x = t[k * 3];
    let y = t[k * 3 + 1];
    let z = t[k * 3 + 2];
    if (form === 2) y += Math.sin(x * 2.3 + time * 1.3) * Math.cos(z * 2.7 + time * 0.9) * 0.11;
    const a = v.spin * time + v.sway * Math.sin(time * 0.45) + px * 0.25;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    [x, z] = [x * ca + z * sa, -x * sa + z * ca];
    const ct = Math.cos(v.tilt);
    const st = Math.sin(v.tilt);
    [y, z] = [y * ct - z * st, y * st + z * ct];
    const f = fit[name];
    out[0] = x * f.scale;
    out[1] = y * f.scale + f.y;
    out[2] = z * f.scale;
  }

  frame(f: StageFrame) {
    this.now = f.time;
    const { ctx, w, h, dpr } = this;
    const aspect = w / h;
    const view = viewSize(aspect);
    const fit = formFit(aspect);
    const { i, f: mix } = formMix(f.u);
    const unit = h / view.h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const ptrX = (f.px * view.w) / 2;
    const ptrY = (-f.py * view.h) / 2;
    const red = 0.16 + 0.3 * formWeight(f.u, 3) + 0.42 * formWeight(f.u, 4) + 0.2 * formWeight(f.u, 5);
    const calm = 1 - 0.75 * (formWeight(f.u, 4) + formWeight(f.u, 5));
    const a = [0, 0, 0];
    const b = [0, 0, 0];
    for (let k = 0; k < COUNT; k++) {
      const s0 = this.seed[k * 2];
      const s1 = this.seed[k * 2 + 1];
      const x = Math.min(1, Math.max(0, mix * 1.5 - s0 * 0.5));
      const e = x - 1;
      const m = 1 + 2.2 * e * e * e + 1.2 * e * e;
      const burst = Math.sin(Math.PI * x);
      this.place(i, k, f.time, f.px, fit, a);
      this.place(i + 1, k, f.time, f.px, fit, b);
      let X = a[0] + (b[0] - a[0]) * m + Math.sin(a[1] * 1.7 + f.time * 0.4 + s1 * 6) * (0.02 + 0.2 * burst);
      let Y = a[1] + (b[1] - a[1]) * m + Math.cos(a[0] * 1.5 + f.time * 0.3 + s0 * 6) * (0.02 + 0.2 * burst);
      const Z = a[2] + (b[2] - a[2]) * m;
      let glow = 0;
      const dx = X - ptrX;
      const dy = Y - ptrY;
      const push = f.push * calm * Math.exp(-(dx * dx + dy * dy) / 0.3);
      const dl = Math.hypot(dx, dy) + 1e-4;
      X += (dx / dl) * push * 0.42;
      Y += (dy / dl) * push * 0.42;
      glow += push * 0.6;
      for (const sh of this.shocks) {
        const age = f.time - sh.at;
        if (age > 4) continue;
        const sx = X - sh.x;
        const sy = Y - sh.y;
        const r = Math.hypot(sx, sy) + 1e-4;
        const ring = Math.exp(-(((r - age * 2.4) / 0.22) ** 2)) * Math.exp(-age * 1.5);
        X += (sx / r) * ring * 0.4;
        Y += (sy / r) * ring * 0.4;
        glow += ring;
      }
      const persp = CAMERA.z / (CAMERA.z - Z);
      const sxp = w / 2 + X * unit * persp;
      const syp = h / 2 - Y * unit * persp;
      const size = (1 + 2 * s1 * s1) * persp * (1 + glow);
      ctx.fillStyle = s0 > 1 - red || glow > 0.4 ? 'rgb(255,70,90)' : 'rgb(255,245,240)';
      ctx.globalAlpha = Math.min(1, (0.35 + 0.5 * s1) * (1 + glow));
      ctx.fillRect(sxp - size / 2, syp - size / 2, size, size);
    }
    this.drawBalls(f, view, fit, unit);
    ctx.globalAlpha = 1;
  }

  private drawBalls(f: StageFrame, view: { w: number; h: number }, fit: ReturnType<typeof formFit>, unit: number) {
    const wgt = formWeight(f.u, 2);
    if (wgt < 0.004) return;
    const { ctx, w, h } = this;
    const n = w < 700 ? 5 : 7;
    const R = Math.min(view.w / (n * 2.9), view.h * 0.07);
    const floor = -0.75 * fit.wave.scale * Math.cos(FORM_VIEW.wave.tilt) + fit.wave.y;
    const spread = Math.min(view.w * 0.4, fit.wave.scale * 1.7);
    ctx.globalCompositeOperation = 'source-over';
    for (let k = 0; k < n; k++) {
      const period = 0.92 + 0.07 * ((k * 3) % 5);
      const p = (f.time / period + ((k * 0.37) % 1)) % 1;
      const peak = view.h * 0.3 * (0.72 + 0.28 * (((k * 5) % 7) / 6));
      const lift = peak * 4 * p * (1 - p);
      const edge = Math.min(p, 1 - p);
      const squash = edge < 0.06 ? 0.28 * (1 - edge / 0.06) : 0;
      const sy = 1 - squash;
      const sx = 1 + squash * 0.55;
      const x = w / 2 + ((k / (n - 1)) * 2 - 1) * spread * unit;
      const y = h / 2 - (floor + lift + R * sy + (1 - wgt) ** 2 * view.h * 1.3) * unit;
      const r = R * unit;
      const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.1);
      if (k % 2) {
        g.addColorStop(0, '#ffffff');
        g.addColorStop(1, '#8e8e96');
      } else {
        g.addColorStop(0, '#ff6a78');
        g.addColorStop(0.5, '#8b0012');
        g.addColorStop(1, '#3a0008');
      }
      ctx.globalAlpha = Math.min(1, wgt * 3);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r * sx, r * sy, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  dispose() {}
}
