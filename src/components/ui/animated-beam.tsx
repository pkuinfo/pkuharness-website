'use client';

/**
 * A curved SVG beam between two elements with a light pulse travelling along it.
 *
 * Ported from 21st.dev: dillionverma/animated-beam (Magic UI). Changes: `motion/react`,
 * deterministic default duration (no Math.random during render), brand colours, the pulse
 * stops (only the static path remains) with reduced motion, `vertical` beams and `edges`.
 */

import { motion, useReducedMotion } from 'motion/react';
import { type RefObject, useEffect, useId, useState } from 'react';
import { cn } from '@/lib/cn';

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  /** Pulse travels top→bottom instead of left→right. */
  vertical?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  /** Attach to the facing edges (right→left, or bottom→top when vertical) instead of the centres. */
  edges?: boolean;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  vertical = false,
  duration = 5,
  delay = 0,
  pathColor = 'currentColor',
  pathWidth = 1.5,
  pathOpacity = 0.14,
  gradientStartColor = '#ff5a6a',
  gradientStopColor = '#efaa3c',
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  edges = false,
}: AnimatedBeamProps) {
  const id = useId().replace(/:/g, '');
  const reduce = useReducedMotion();
  const [pathD, setPathD] = useState('');
  const [box, setBox] = useState({ width: 0, height: 0 });

  const axis = vertical ? 'y' : 'x';
  const travel = reverse ? ['90%', '-10%'] : ['10%', '110%'];
  const travel2 = reverse ? ['100%', '0%'] : ['0%', '100%'];

  useEffect(() => {
    const update = () => {
      const c = containerRef.current;
      const a = fromRef.current;
      const b = toRef.current;
      if (!c || !a || !b) return;
      const cr = c.getBoundingClientRect();
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      setBox({ width: cr.width, height: cr.height });
      let sx = ra.left - cr.left + ra.width / 2;
      let sy = ra.top - cr.top + ra.height / 2;
      let ex = rb.left - cr.left + rb.width / 2;
      let ey = rb.top - cr.top + rb.height / 2;
      if (edges && vertical) {
        sy = ra.bottom - cr.top;
        ey = rb.top - cr.top;
      } else if (edges) {
        sx = ra.right - cr.left;
        ex = rb.left - cr.left;
      }
      sx += startXOffset;
      sy += startYOffset;
      ex += endXOffset;
      ey += endYOffset;
      const d = vertical
        ? `M ${sx},${sy} Q ${sx - curvature},${(sy + ey) / 2} ${ex},${ey}`
        : `M ${sx},${sy} Q ${(sx + ex) / 2},${sy - curvature} ${ex},${ey}`;
      setPathD(d);
    };
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    update();
    return () => ro.disconnect();
  }, [containerRef, fromRef, toRef, curvature, vertical, edges, startXOffset, startYOffset, endXOffset, endYOffset]);

  return (
    <svg
      fill="none"
      width={box.width}
      height={box.height}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn('pointer-events-none absolute top-0 left-0 transform-gpu', className)}
      viewBox={`0 0 ${box.width} ${box.height}`}
    >
      <path d={pathD} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      {!reduce && <path d={pathD} strokeWidth={pathWidth + 0.5} stroke={`url(#beam-${id})`} strokeLinecap="round" />}
      <defs>
        <motion.linearGradient
          id={`beam-${id}`}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: '0%', x2: '0%', y1: '0%', y2: '0%' }}
          animate={
            axis === 'x'
              ? { x1: travel, x2: travel2, y1: ['0%', '0%'], y2: ['0%', '0%'] }
              : { y1: travel, y2: travel2, x1: ['0%', '0%'], x2: ['0%', '0%'] }
          }
          transition={{ delay, duration, ease: [0.16, 1, 0.3, 1], repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.6 }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}
