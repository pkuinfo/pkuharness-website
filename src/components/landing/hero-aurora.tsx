'use client';

import { ShaderCanvas } from '@/components/ui/shader-canvas';
import { useThemeTone } from './use-theme-tone';

/**
 * The app's <Aurora>, as a fragment shader: three dim lights in PKU colours (北大红, navy,
 * bronze) drifting on slow Lissajous paths through a softly warped field, with a faint amber
 * veil. Dark: lights on near-black. Light: the same lights as tints on warm paper.
 */
const AURORA = /* glsl */ `
vec3 shaderColor(vec2 uv, vec2 p, float t, vec2 pointer, float intensity, float isLight) {
  float s = t * 0.045;
  vec2 q = p + pointer * 0.035;
  vec2 warp = vec2(fbm(q * 0.8 + vec2(s * 1.3, -s)), fbm(q * 0.8 + vec2(-s, s * 1.1) + 3.1));
  q += (warp - 0.5) * 0.6;

  vec2 c1 = vec2(0.55 + 0.38 * sin(s * 2.1), 0.32 + 0.20 * cos(s * 1.7));
  vec2 c2 = vec2(-0.85 + 0.30 * cos(s * 1.3), 0.05 + 0.28 * sin(s * 1.9));
  vec2 c3 = vec2(0.15 + 0.50 * sin(s * 1.1 + 1.0), -0.75 + 0.16 * cos(s * 2.3));
  float l1 = exp(-dot(q - c1, q - c1) * 1.5);
  float l2 = exp(-dot(q - c2, q - c2) * 1.7);
  float l3 = exp(-dot(q - c3, q - c3) * 2.2);

  vec3 red = vec3(0.62, 0.02, 0.09);
  vec3 navy = vec3(0.07, 0.24, 0.46);
  vec3 bronze = vec3(0.54, 0.37, 0.26);
  vec3 amber = vec3(0.94, 0.67, 0.24);

  float veil = smoothstep(0.55, 0.0, abs(q.y - 0.15 + 0.22 * sin(q.x * 1.3 + s * 2.6)));
  veil *= smoothstep(-1.6, 0.4, q.x) * 0.5;

  vec3 dark = vec3(0.022, 0.024, 0.03);
  dark += red * l1 * 0.85 + navy * l2 * 0.75 + bronze * l3 * 0.42 + amber * veil * 0.035;

  vec3 paper = vec3(0.985, 0.975, 0.97);
  vec3 light = paper;
  light = mix(light, vec3(0.93, 0.70, 0.73), l1 * 0.55);
  light = mix(light, vec3(0.74, 0.81, 0.92), l2 * 0.45);
  light = mix(light, vec3(0.92, 0.84, 0.74), l3 * 0.5);
  light = mix(light, vec3(0.99, 0.90, 0.75), veil * 0.18);

  vec3 color = mix(dark, light, isLight) * (0.9 + intensity * 0.1);
  float vig = smoothstep(1.9, 0.4, length(p * vec2(0.8, 1.0)));
  color = mix(color * mix(0.55, 0.96, isLight), color, vig);
  color += (hash21(gl_FragCoord.xy + fract(t)) - 0.5) * 0.012;
  return color;
}
`;

export default function HeroAurora({ className }: { className?: string }) {
  const tone = useThemeTone();
  return <ShaderCanvas fragment={AURORA} tone={tone} className={className} />;
}
