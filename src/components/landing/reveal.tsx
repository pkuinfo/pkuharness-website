import type { CSSProperties, ReactNode } from 'react';

/**
 * Page-load entrance (CSS only, so it runs before hydration): fade + 14px rise with the strong
 * ease-out, staggered by `delay`. Reduced motion: the global rule collapses it to nothing.
 */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <div className="lp-rise" style={{ '--lp-delay': `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}
