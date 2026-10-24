/**
 * A primary call to action with a spark running around its edge. Ported from 21st.dev:
 * dillionverma/shimmer-button (Magic UI). Changes: renders a Next `<Link>` (or `<a>` for external
 * URLs) instead of a `<button>`, since our CTAs navigate; 北大红 fill and a warm spark; our
 * radius, height and focus ring; the inner highlight also lifts on keyboard focus; the spark stops
 * under reduced motion (global rule) and the button still reads as a solid red button.
 */

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function ShimmerLink({
  href,
  children,
  className,
  shimmerColor = '#ffd9a8',
  shimmerDuration = '3.2s',
  background = 'linear-gradient(180deg, #a3001a 0%, var(--color-brand) 55%, #6e000f 100%)',
}: {
  href: string;
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerDuration?: string;
  background?: string;
}) {
  const style = {
    '--spread': '90deg',
    '--shimmer-color': shimmerColor,
    '--radius': '10px',
    '--speed': shimmerDuration,
    '--cut': '1px',
    '--bg': background,
  } as CSSProperties;
  const cls = cn(
    'group relative z-0 inline-flex h-12 cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[var(--radius)] border border-white/15 px-5 font-semibold text-white [background:var(--bg)]',
    'shadow-[0_10px_30px_-10px_rgba(139,0,18,0.85)] transition-transform duration-150 ease-out active:scale-[0.97]',
    'focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2',
    className,
  );
  const inner = (
    <>
      {/* spark container */}
      <span aria-hidden="true" className="absolute inset-0 -z-30 overflow-visible blur-[2px] [container-type:size]">
        <span className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          <span className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </span>
      </span>
      {children}
      {/* highlight */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-[var(--radius)] shadow-[inset_0_-8px_10px_#ffffff1f] transition-shadow duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_12px_#ffffff40] group-focus-visible:shadow-[inset_0_-6px_12px_#ffffff40] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
      />
      {/* backdrop */}
      <span
        aria-hidden="true"
        className="absolute inset-[var(--cut)] -z-20 rounded-[var(--radius)] [background:var(--bg)]"
      />
    </>
  );
  if (/^https?:/.test(href))
    return (
      <a href={href} className={cls} style={style}>
        {inner}
      </a>
    );
  return (
    <Link href={href} className={cls} style={style}>
      {inner}
    </Link>
  );
}
