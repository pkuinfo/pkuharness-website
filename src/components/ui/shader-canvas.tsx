'use client';

/**
 * A full-bleed fragment-shader canvas on raw WebGL (one triangle, no three.js).
 *
 * Ported from 21st.dev: isaiahbjork/shader-aurora-veil ("WebsiteShaderCanvas"), adapted:
 * - the fragment body is a prop (we pass the PKU aurora from `landing/hero-aurora.tsx`);
 * - frames are capped (`fps`) and the loop stops when the canvas is off-screen, the tab is
 *   hidden, or the visitor prefers reduced motion (then one still frame is drawn);
 * - a CSS `fallback` background shows before the first frame and if WebGL is unavailable.
 */

import { useReducedMotion } from 'motion/react';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface ShaderCanvasProps {
  /** GLSL that defines `vec3 shaderColor(vec2 uv, vec2 p, float t, vec2 pointer, float intensity, float isLight)`. */
  fragment: string;
  className?: string;
  tone?: 'dark' | 'light';
  intensity?: number;
  /** Seconds offset so the still frame (reduced motion) is a good-looking one. */
  stillTime?: number;
  fps?: number;
  maxPixelRatio?: number;
  maxCanvasPixels?: number;
  /** CSS background painted behind the canvas (and instead of it without WebGL). */
  fallback?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const vertexShaderSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentHeader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_intensity;
uniform float u_isLight;

float saturate(float value) { return clamp(value, 0.0, 1.0); }

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = rotate2d(0.72) * p * 2.03 + 4.17;
    amplitude *= 0.5;
  }
  return value;
}
`;

const fragmentFooter = `
void main() {
  vec2 uv = gl_FragCoord.xy / max(u_resolution.xy, vec2(1.0));
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / max(min(u_resolution.x, u_resolution.y), 1.0);
  vec2 pointer = u_pointer * 2.0 - 1.0;
  pointer.x *= u_resolution.x / max(u_resolution.y, 1.0);
  vec3 color = shaderColor(uv, p, u_time, pointer, u_intensity, u_isLight);
  gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
}
`;

export function ShaderCanvas({
  fragment,
  className,
  tone = 'dark',
  intensity = 1,
  stillTime = 24,
  fps = 30,
  maxPixelRatio = 1,
  maxCanvasPixels = 900_000,
  fallback,
  style,
  children,
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [epoch, setEpoch] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `epoch` re-runs the effect after a lost context is restored
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const el = canvas;
    const animate = !reduceMotion;
    let disposed = false;
    let onScreen = true;
    let frame = 0;
    let last = 0;
    const startedAt = performance.now();
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;

    const onLost = (e: Event) => {
      e.preventDefault();
      setReady(false);
      stop();
    };
    const onRestored = () => setEpoch((v) => v + 1);
    el.addEventListener('webglcontextlost', onLost);
    el.addEventListener('webglcontextrestored', onRestored);

    gl = el.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    });
    if (!gl) return cleanup;
    program = createProgram(gl, vertexShaderSource, `${fragmentHeader}\n${fragment}\n${fragmentFooter}`);
    buffer = gl.createBuffer();
    if (!program || !buffer) return cleanup;

    const position = gl.getAttribLocation(program, 'a_position');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uPointer = gl.getUniformLocation(program, 'u_pointer');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');
    const uIsLight = gl.getUniformLocation(program, 'u_isLight');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL call, not a React hook
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resize = () => {
      if (!gl) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
      let w = Math.max(1, Math.floor(rect.width * ratio));
      let h = Math.max(1, Math.floor(rect.height * ratio));
      if (w * h > maxCanvasPixels) {
        const s = Math.sqrt(maxCanvasPixels / (w * h));
        w = Math.max(1, Math.floor(w * s));
        h = Math.max(1, Math.floor(h * s));
      }
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
      }
      gl.viewport(0, 0, w, h);
    };

    let first = true;
    const render = (now: number) => {
      if (!gl || !program || disposed) return;
      resize();
      const t = animate ? stillTime + (now - startedAt) / 1000 : stillTime;
      gl.uniform2f(uResolution, el.width, el.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uPointer, pointerRef.current.x, pointerRef.current.y);
      gl.uniform1f(uIntensity, intensity);
      gl.uniform1f(uIsLight, tone === 'light' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (first) {
        first = false;
        setReady(true);
      }
    };

    const interval = 1000 / fps;
    const tick = (now: number) => {
      frame = 0;
      if (disposed || !onScreen || document.hidden) return;
      if (now - last >= interval) {
        last = now;
        render(now);
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!animate || frame || disposed) return;
      frame = requestAnimationFrame(tick);
    };
    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }

    const resizeObserver = new ResizeObserver(() => render(performance.now()));
    resizeObserver.observe(el);
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = Boolean(entry?.isIntersecting);
        if (onScreen) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(el);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointerRef.current = {
        x: Math.min(1, Math.max(0, (e.clientX - r.left) / Math.max(1, r.width))),
        y: 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / Math.max(1, r.height))),
      };
    };
    if (animate) window.addEventListener('pointermove', onPointer, { passive: true });

    render(performance.now());
    start();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      resizeObserver.disconnect();
      io.disconnect();
      cleanup();
    };

    function cleanup() {
      disposed = true;
      stop();
      el.removeEventListener('webglcontextlost', onLost);
      el.removeEventListener('webglcontextrestored', onRestored);
      if (gl) {
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
      }
    }
  }, [fragment, tone, intensity, stillTime, fps, maxPixelRatio, maxCanvasPixels, reduceMotion, epoch]);

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ background: fallback, ...style }}>
      <canvas
        ref={canvasRef}
        className={cn(
          'pointer-events-none absolute inset-0 size-full transition-opacity duration-1000',
          ready ? 'opacity-100' : 'opacity-0',
        )}
      />
      {children}
    </div>
  );
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== 'production') console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
