/**
 * A light that travels around a container's border. Ported from 21st.dev: dillionverma/shine-border
 * (Magic UI). Changes: an overlay you drop inside any `relative` element (it inherits the radius)
 * instead of a wrapper with its own surface, brand colours by default, plain CSS keyframes, and a
 * still border under reduced motion.
 */

import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import './shine-border.css';

export function ShineBorder({
  width = 1,
  duration = 14,
  colors = ['var(--color-brand-bright)', 'var(--color-pku-amber)'],
  className,
}: {
  width?: number;
  duration?: number;
  colors?: string[];
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn('ui-shine-border', className)}
      style={
        {
          '--shine-width': `${width}px`,
          '--shine-duration': `${duration}s`,
          '--shine-colors': colors.join(','),
        } as CSSProperties
      }
    />
  );
}
