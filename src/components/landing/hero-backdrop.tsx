'use client';

import dynamic from 'next/dynamic';
import { AURORA_FALLBACK } from './aurora-fallback';

/** Static aurora painted on the server; the WebGL one loads after hydration and fades in on top. */
function StaticAurora() {
  return (
    <>
      <div className="absolute inset-0 dark:hidden" style={{ background: AURORA_FALLBACK.light }} />
      <div className="absolute inset-0 hidden dark:block" style={{ background: AURORA_FALLBACK.dark }} />
    </>
  );
}

const HeroAurora = dynamic(() => import('./hero-aurora'), { ssr: false, loading: () => null });

export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <StaticAurora />
      <HeroAurora className="absolute inset-0" />
      {/* hand-off into the page canvas */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-fd-background" />
    </div>
  );
}
