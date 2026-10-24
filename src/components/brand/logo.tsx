/**
 * The PKU Harness mark: a "P" whose bowl is an open orbit, with the agent as a bright bead on it.
 * Geometry mirrors `pku-harness/src/theme/brand.ts` (viewBox 0 0 120 120). Never redraw by hand.
 *
 * Rendered as an <img> with an SVG data URI: layouts render the same server element more than once
 * (e.g. the docs sidebar and the mobile header), and inline SVGs would then share gradient ids, so
 * the visible copy pointed at gradients inside a hidden one and lost its colours.
 */
const stem = { x: 33, y: 23.5, width: 15, height: 72, rx: 4.5 };
const orbit = { cx: 62, cy: 53, r: 23, stroke: 13, startDeg: -156, endDeg: 156 };
const agent = { deg: -38, r: 8.5 };

const rad = (d: number) => (d * Math.PI) / 180;
export function orbitPoint(deg: number) {
  return { x: orbit.cx + orbit.r * Math.cos(rad(deg)), y: orbit.cy + orbit.r * Math.sin(rad(deg)) };
}
const a = orbitPoint(orbit.startDeg);
const b = orbitPoint(orbit.endDeg);
export const orbitD = `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${orbit.r} ${orbit.r} 0 1 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
const dot = orbitPoint(agent.deg);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
<defs>
<linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C42236"/><stop offset=".5" stop-color="#8B0012"/><stop offset="1" stop-color="#52000A"/></linearGradient>
<radialGradient id="h" cx="26" cy="14" r="78" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".24"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFE1E4"/></linearGradient>
<mask id="g" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120"><rect width="120" height="120" fill="#fff"/><circle cx="${dot.x.toFixed(2)}" cy="${dot.y.toFixed(2)}" r="${agent.r + 2.2}" fill="#000"/></mask>
</defs>
<rect width="120" height="120" rx="28" fill="url(#t)"/><rect width="120" height="120" rx="28" fill="url(#h)"/>
<g mask="url(#g)"><rect x="${stem.x}" y="${stem.y}" width="${stem.width}" height="${stem.height}" rx="${stem.rx}" fill="url(#i)"/><path d="${orbitD}" fill="none" stroke="url(#i)" stroke-width="${orbit.stroke}"/></g>
<circle cx="${dot.x.toFixed(2)}" cy="${dot.y.toFixed(2)}" r="${agent.r}" fill="#fff"/>
</svg>`;
const src = `data:image/svg+xml,${encodeURIComponent(svg)}`;

export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  // biome-ignore lint/performance/noImgElement: a tiny inline SVG data URI; next/image adds nothing here
  return <img src={src} width={size} height={size} alt="" aria-hidden="true" className={className} />;
}
