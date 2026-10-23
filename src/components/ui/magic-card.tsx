'use client';

/**
 * A panel with a soft light that follows the pointer. Ported from 21st.dev:
 * dillionverma/magic-card (Magic UI). Changes: `motion/react`, glass surface tokens instead of
 * neutral fills, accepts any element props, and the light is a CSS variable so it never
 * re-renders React.
 */

import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import { type HTMLAttributes, type PointerEvent, useCallback } from 'react';
import { cn } from '@/lib/cn';

export interface MagicCardProps extends HTMLAttributes<HTMLDivElement> {
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 260,
  gradientColor = 'color-mix(in oklab, var(--color-brand-bright) 22%, transparent)',
  gradientOpacity = 1,
  ...props
}: MagicCardProps) {
  const x = useMotionValue(-gradientSize);
  const y = useMotionValue(-gradientSize);
  const background = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${x}px ${y}px, ${gradientColor}, transparent 100%)`;

  const onMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
    },
    [x, y],
  );
  const onLeave = useCallback(() => {
    x.set(-gradientSize);
    y.set(-gradientSize);
  }, [x, y, gradientSize]);

  return (
    <div
      {...props}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('group relative overflow-hidden', className)}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background, opacity: gradientOpacity }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
