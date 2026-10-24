'use client';

/**
 * A border that lights up on the side nearest the pointer, the light sliding round the edge as the
 * pointer moves. Ported from 21st.dev: manuarora700/glowing-effect (Aceternity UI). Changes:
 * - one shared `pointermove`/`scroll` listener for every instance on the page (the original adds
 *   two listeners per card, which adds up on the marketplace grid);
 * - the conic gradient uses the PKU palette (北大红, amber, sand, slate) from our tokens;
 * - off for touch-only devices and under reduced motion (then nothing is rendered);
 * - the static hairline is left to the host element's own border.
 */

import { animate, useReducedMotion } from 'motion/react';
import { type CSSProperties, memo, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

type Listener = (p: { x: number; y: number } | null) => void;
const listeners = new Set<Listener>();
let last: { x: number; y: number } | null = null;
let raf = 0;

function flush(p: { x: number; y: number } | null) {
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    raf = 0;
    for (const l of listeners) l(p);
  });
}
const onPointer = (e: PointerEvent) => {
  last = { x: e.clientX, y: e.clientY };
  flush(last);
};
const onScroll = () => flush(last);

function subscribe(l: Listener) {
  if (listeners.size === 0) {
    document.body.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  listeners.add(l);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) {
      document.body.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
    }
  };
}

export const GlowingEffect = memo(function GlowingEffect({
  spread = 36,
  proximity = 48,
  inactiveZone = 0.6,
  borderWidth = 1.5,
  movementDuration = 1.6,
  className,
}: {
  spread?: number;
  proximity?: number;
  inactiveZone?: number;
  borderWidth?: number;
  movementDuration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  useEffect(() => setFine(window.matchMedia('(hover: hover) and (pointer: fine)').matches), []);
  const enabled = fine && !reduce;

  useEffect(() => {
    if (!enabled) return;
    return subscribe((p) => {
      const el = ref.current;
      if (!el || !p) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      if (Math.hypot(p.x - cx, p.y - cy) < 0.5 * Math.min(width, height) * inactiveZone) {
        el.style.setProperty('--active', '0');
        return;
      }
      const active =
        p.x > left - proximity &&
        p.x < left + width + proximity &&
        p.y > top - proximity &&
        p.y < top + height + proximity;
      el.style.setProperty('--active', active ? '1' : '0');
      if (!active) return;
      const current = Number.parseFloat(el.style.getPropertyValue('--start')) || 0;
      const target = (180 * Math.atan2(p.y - cy, p.x - cx)) / Math.PI + 90;
      const diff = ((target - current + 180) % 360) - 180;
      animate(current, current + diff, {
        duration: movementDuration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => el.style.setProperty('--start', String(v)),
      });
    });
  }, [enabled, inactiveZone, proximity, movementDuration]);

  if (!enabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={
        {
          '--spread': spread,
          '--start': '0',
          '--active': '0',
          '--glow-border': `${borderWidth}px`,
          '--glow-gradient': `radial-gradient(circle, var(--color-brand-bright) 10%, transparent 20%),
            radial-gradient(circle at 40% 40%, var(--color-pku-amber) 5%, transparent 15%),
            radial-gradient(circle at 60% 60%, var(--color-pku-sand) 10%, transparent 20%),
            radial-gradient(circle at 40% 60%, var(--color-pku-slate) 10%, transparent 20%),
            repeating-conic-gradient(from 236.84deg at 50% 50%, var(--color-brand-bright) 0%, var(--color-pku-amber) 5%, var(--color-pku-sand) 10%, var(--color-pku-slate) 15%, var(--color-brand-bright) 20%)`,
        } as CSSProperties
      }
      className={cn('pointer-events-none absolute inset-0 rounded-[inherit]', className)}
    >
      <div
        className={cn(
          'rounded-[inherit]',
          'after:absolute after:inset-[calc(-1*var(--glow-border))] after:rounded-[inherit] after:content-[""]',
          'after:[border:var(--glow-border)_solid_transparent]',
          'after:[background:var(--glow-gradient)] after:[background-attachment:fixed]',
          'after:opacity-[var(--active)] after:transition-opacity after:duration-300',
          'after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]',
          'after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]',
        )}
      />
    </div>
  );
});
