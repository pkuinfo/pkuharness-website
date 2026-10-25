'use client';

import { type CSSProperties, type ElementType, type ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Fades and lifts its content once when it scrolls into view (CSS `.lp-reveal`, 900 ms,
 * Apple's decelerate curve). `delay` staggers siblings. Content is in the HTML from the start and
 * visible without JavaScript or with reduced motion.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('lp-reveal');
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={cn(className)} style={{ '--d': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
