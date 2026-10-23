import { useId } from 'react';

/**
 * The PKU Harness mark: a "P" whose bowl is an open orbit, with the agent as a bright bead on it.
 * Geometry mirrors `pku-harness/src/theme/brand.ts` (viewBox 0 0 120 120). Never redraw by hand.
 */
const stem = { x: 33, y: 23.5, width: 15, height: 72, rx: 4.5 };
const orbit = {
  cx: 62,
  cy: 53,
  r: 23,
  stroke: 13,
  startDeg: -156,
  endDeg: 156,
};
const agent = { deg: -38, r: 8.5 };

const rad = (d: number) => (d * Math.PI) / 180;
export function orbitPoint(deg: number) {
  return {
    x: orbit.cx + orbit.r * Math.cos(rad(deg)),
    y: orbit.cy + orbit.r * Math.sin(rad(deg)),
  };
}
const a = orbitPoint(orbit.startDeg);
const b = orbitPoint(orbit.endDeg);
export const orbitD = `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${orbit.r} ${orbit.r} 0 1 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
const dot = orbitPoint(agent.deg);

export function Logo({ size = 28, tile = true, className }: { size?: number; tile?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '');
  const ink = tile ? `url(#ink-${id})` : 'currentColor';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`tile-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C42236" />
          <stop offset="0.5" stopColor="#8B0012" />
          <stop offset="1" stopColor="#52000A" />
        </linearGradient>
        <radialGradient id={`hl-${id}`} cx="26" cy="14" r="78" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.24" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`ink-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE1E4" />
        </linearGradient>
        <mask id={`gap-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          <rect width="120" height="120" fill="#fff" />
          <circle cx={dot.x} cy={dot.y} r={agent.r + 2.2} fill="#000" />
        </mask>
      </defs>
      {tile && (
        <>
          <rect width="120" height="120" rx="28" fill={`url(#tile-${id})`} />
          <rect width="120" height="120" rx="28" fill={`url(#hl-${id})`} />
        </>
      )}
      <g mask={`url(#gap-${id})`}>
        <rect {...stem} fill={ink} />
        <path d={orbitD} fill="none" stroke={ink} strokeWidth={orbit.stroke} />
      </g>
      <circle cx={dot.x} cy={dot.y} r={agent.r} fill={tile ? '#fff' : 'var(--color-brand, #C42236)'} />
    </svg>
  );
}
