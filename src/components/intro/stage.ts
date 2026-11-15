/**
 * The drawing surface of the root page: the WebGL particle stage (stage-gl.ts) or, when WebGL is
 * unavailable, a small 2D canvas version of the same shapes (stage-2d.ts). Both are loaded on
 * demand, so three.js only downloads on the root page and only when it can run.
 */
export interface StageFrame {
  /** Scroll progress through the shapes, 0 … FORMS.length − 1 (already smoothed). */
  u: number;
  /** Seconds since the stage started, and since the last frame. */
  time: number;
  dt: number;
  /** Pointer in -1…1 (x right, y down) and how strongly it pushes (0 when idle). */
  px: number;
  py: number;
  push: number;
}

export interface Stage {
  readonly kind: 'gl' | '2d';
  /** Number of particles drawn. */
  readonly count: number;
  resize(w: number, h: number, dpr: number): void;
  frame(f: StageFrame): void;
  /** A shockwave from a click or tap, at a pointer position in -1…1. */
  shock(px: number, py: number): void;
  dispose(): void;
}

export interface StageOptions {
  canvas: HTMLCanvasElement;
  /** Phones: fewer particles, lower pixel ratio, cheaper bloom. */
  light: boolean;
  fontFamily: string;
}

export async function createStage(opts: StageOptions): Promise<Stage> {
  try {
    // Probe first, so browsers without WebGL 2 never download three.js.
    if (!document.createElement('canvas').getContext('webgl2')) throw new Error('no WebGL 2');
    const { StageGL } = await import('./stage-gl');
    return await StageGL.create(opts);
  } catch {
    const { Stage2D } = await import('./stage-2d');
    return await Stage2D.create(opts);
  }
}
