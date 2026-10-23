'use client';

/**
 * A number that springs to its value when it scrolls into view, then springs between later
 * values. Ported from 21st.dev: dillionverma/number-ticker (Magic UI). Changes: `motion/react`,
 * tabular figures, never an empty span before hydration, re-targets on
 * every `value` change, jumps straight to the value with reduced motion. Server HTML shows `from`.
 */

import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

export function NumberTicker({
  value,
  from = 0,
  delay = 0,
  decimalPlaces = 0,
  className,
}: {
  value: number;
  /** Where the first count starts. */
  from?: number;
  delay?: number;
  decimalPlaces?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(from);
  const spring = useSpring(motionValue, { damping: 40, stiffness: 140 });
  const inView = useInView(ref, { once: true, margin: '0px' });

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      spring.jump(value);
      return;
    }
    const t = setTimeout(() => motionValue.set(value), delay * 1000);
    return () => clearTimeout(t);
  }, [inView, reduce, value, delay, motionValue, spring]);

  useEffect(
    () =>
      spring.on('change', (latest) => {
        if (ref.current) ref.current.textContent = format(latest, decimalPlaces);
      }),
    [spring, decimalPlaces],
  );

  return (
    <span ref={ref} className={cn('inline-block tabular-nums', className)}>
      {format(from, decimalPlaces)}
    </span>
  );
}

function format(n: number, decimalPlaces: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(n.toFixed(decimalPlaces)));
}
