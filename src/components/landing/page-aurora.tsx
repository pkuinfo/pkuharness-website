'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/cn';
import { AURORA_FALLBACK } from './aurora-fallback';

const HeroAurora = dynamic(() => import('./hero-aurora'), { ssr: false, loading: () => null });

/**
 * The home page's aurora, calmer, behind an inner page's header (marketplace, plugin pages,
 * download). A static gradient paints first; the shader loads after hydration and fades in. The
 * bottom edge fades into the page, so the header has no visible box.
 */
export function PageAurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)] dark:opacity-90',
        className,
      )}
    >
      <div className="absolute inset-0 opacity-60 dark:hidden" style={{ background: AURORA_FALLBACK.light }} />
      <div className="absolute inset-0 hidden opacity-80 dark:block" style={{ background: AURORA_FALLBACK.dark }} />
      <HeroAurora calm className="absolute inset-0 opacity-70 dark:opacity-80" />
    </div>
  );
}
