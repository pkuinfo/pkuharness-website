/**
 * A short light that runs around its parent's border. Ported from 21st.dev:
 * dillionverma/border-beam (Magic UI). Changes: keyframes in `landing/landing.css`
 * (`lp-border-beam`), PKU colours by default; still under reduced motion (global rule).
 * The parent needs `position: relative` and a border radius.
 */

import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export function BorderBeam({
  className,
  size = 220,
  duration = 12,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = '#ff5a6a',
  colorTo = '#efaa3c',
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      style={
        {
          '--size': size,
          '--duration': `${duration}s`,
          '--anchor': anchor,
          '--border-width': borderWidth,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          '--delay': `-${delay}s`,
        } as CSSProperties
      }
      className={cn('lp-border-beam pointer-events-none absolute inset-0 rounded-[inherit]', className)}
    />
  );
}
