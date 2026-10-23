/**
 * Infinite horizontal/vertical scroller. Ported from 21st.dev: dillionverma/marquee (Magic UI).
 * Changes: keyframes live in `landing/landing.css` (`lp-marquee`), copies after the first are
 * hidden from assistive tech, and the motion stops under reduced motion (global rule).
 */

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
  children?: ReactNode;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
  children,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'group flex overflow-hidden [--duration:40s] [--gap:1rem] [gap:var(--gap)]',
        vertical ? 'flex-col' : 'flex-row',
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static copies of the same children
          key={i}
          aria-hidden={i > 0 ? true : undefined}
          className={cn(
            'flex shrink-0 justify-around [gap:var(--gap)]',
            vertical ? 'lp-marquee-y flex-col' : 'lp-marquee-x flex-row',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]',
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
