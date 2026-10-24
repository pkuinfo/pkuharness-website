'use client';

import { useEffect, useState } from 'react';
import { ShaderCanvas } from '@/components/ui/shader-canvas';
import { useThemeTone } from './use-theme-tone';

/**
 * The hero's light: ribbons of aurora drifting over a dim field of PKU colours (北大红, navy,
 * bronze, a little amber).
 *
 * The ribbons are ported from 21st.dev: minhxthanh/animated-shader-background ("AnoAI", the most
 * downloaded aurora shader there): N light streaks, each a warped 1/length() falloff with an fbm
 * tail, tone-mapped with tanh. Changes: runs on our raw-WebGL `ShaderCanvas` instead of three.js;
 * the per-streak rainbow is replaced by the PKU palette; time runs ~3× slower; the ribbons lean
 * away from the pointer; fewer streaks on small screens; a light-theme mapping (the ribbons tint
 * warm paper instead of glowing on black); the old Lissajous field stays underneath as the base.
 */
const fragment = (streaks: number) => /* glsl */ `
#define STREAKS ${streaks.toFixed(1)}

float fbm3(vec2 x) {
  float v = 0.0;
  float a = 0.3;
  mat2 r = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 3; i++) {
    v += a * noise(x) * noise(x);
    x = r * x * 2.0 + vec2(100.0);
    a *= 0.4;
  }
  return v;
}

vec3 tanh3(vec3 x) {
  vec3 e = exp(-2.0 * clamp(x, 0.0, 12.0));
  return (1.0 - e) / (1.0 + e);
}

vec3 pku(float k) {
  vec3 red = vec3(0.86, 0.07, 0.16);
  vec3 navy = vec3(0.14, 0.34, 0.72);
  vec3 bronze = vec3(0.80, 0.52, 0.30);
  vec3 amber = vec3(0.98, 0.66, 0.22);
  vec3 c = mix(red, navy, smoothstep(0.30, 0.55, k));
  c = mix(c, bronze, smoothstep(0.62, 0.80, k));
  return mix(c, amber, smoothstep(0.90, 1.0, k) * 0.6);
}

vec3 shaderColor(vec2 uv, vec2 p, float t, vec2 pointer, float intensity, float isLight) {
  // --- base field (three slow lights) -------------------------------------------------------
  float s = t * 0.045;
  vec2 b = p + pointer * 0.035;
  vec2 c1 = vec2(0.55 + 0.38 * sin(s * 2.1), 0.32 + 0.20 * cos(s * 1.7));
  vec2 c2 = vec2(-0.85 + 0.30 * cos(s * 1.3), 0.05 + 0.28 * sin(s * 1.9));
  vec2 c3 = vec2(0.15 + 0.50 * sin(s * 1.1 + 1.0), -0.75 + 0.16 * cos(s * 2.3));
  float l1 = exp(-dot(b - c1, b - c1) * 1.5);
  float l2 = exp(-dot(b - c2, b - c2) * 1.7);
  float l3 = exp(-dot(b - c3, b - c3) * 2.2);

  // --- ribbons (AnoAI) ----------------------------------------------------------------------
  float T = t * 0.32;
  vec2 q = (p * 0.5 + vec2(0.0, -0.08) - pointer * 0.03) * mat2(6.0, -4.0, 4.0, 6.0);
  float f = 2.0 + fbm3(q + vec2(T * 5.0, 0.0)) * 0.5;
  vec3 acc = vec3(0.0);
  for (float i = 0.0; i < STREAKS; i++) {
    vec2 v = q + cos(i * i + (T + q.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5;
    float tail = fbm3(v + vec2(T * 0.5, i)) * 0.3 * (1.0 - i / STREAKS);
    vec3 col = pku(fract(i * 0.173 + 0.11));
    float w = exp(sin(i * i + T * 0.8)) / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
    acc += col * w * (1.0 + tail * 0.8) * smoothstep(0.0, 1.0, i / STREAKS) * 0.6;
  }
  vec3 ribbons = tanh3(pow(acc / (STREAKS * 2.4), vec3(1.6))) * 1.05;

  // keep the headline's area calm: ribbons fade towards the top centre
  float calm = smoothstep(0.15, 0.95, length((uv - vec2(0.5, 0.78)) * vec2(1.3, 2.4)));
  ribbons *= mix(0.35, 1.0, calm) * intensity;

  vec3 red = vec3(0.62, 0.02, 0.09);
  vec3 navy = vec3(0.07, 0.24, 0.46);
  vec3 bronze = vec3(0.54, 0.37, 0.26);
  vec3 dark = vec3(0.020, 0.022, 0.028);
  dark += red * l1 * 0.42 + navy * l2 * 0.5 + bronze * l3 * 0.3;
  dark += ribbons;

  vec3 paper = vec3(0.985, 0.975, 0.97);
  vec3 light = paper;
  light = mix(light, vec3(0.93, 0.70, 0.73), l1 * 0.45);
  light = mix(light, vec3(0.74, 0.81, 0.92), l2 * 0.38);
  light = mix(light, vec3(0.92, 0.84, 0.74), l3 * 0.4);
  vec3 tint = ribbons / max(max(ribbons.r, max(ribbons.g, ribbons.b)), 0.001);
  float amt = clamp(max(ribbons.r, max(ribbons.g, ribbons.b)), 0.0, 1.0);
  light = mix(light, mix(paper, tint * 0.85, 0.55), amt * 0.6);

  vec3 color = mix(dark, light, isLight);
  float vig = smoothstep(1.9, 0.4, length(p * vec2(0.8, 1.0)));
  color = mix(color * mix(0.55, 0.96, isLight), color, vig);
  color += (hash21(gl_FragCoord.xy + fract(t)) - 0.5) * 0.012;
  return color;
}
`;

const SMALL = fragment(14);
const LARGE = fragment(26);
const CALM = fragment(10);

/**
 * `calm`: the inner pages' header light (marketplace, plugin pages, download): fewer, dimmer
 * ribbons at 30 fps and a smaller canvas, so it sits behind text without competing with it.
 */
export default function HeroAurora({ className, calm = false }: { className?: string; calm?: boolean }) {
  const tone = useThemeTone();
  // Fewer ribbons and pixels on phones; decided once after mount (no resize recompiles).
  const [small, setSmall] = useState<boolean | null>(null);
  useEffect(() => setSmall(window.matchMedia('(max-width: 767px)').matches), []);
  if (small === null) return null;
  return (
    <ShaderCanvas
      fragment={calm ? CALM : small ? SMALL : LARGE}
      tone={tone}
      className={className}
      intensity={calm ? 0.55 : 1}
      fps={small || calm ? 30 : 45}
      maxPixelRatio={calm ? 1 : 1.5}
      maxCanvasPixels={calm ? 360_000 : small ? 260_000 : 820_000}
      stillTime={38}
    />
  );
}
