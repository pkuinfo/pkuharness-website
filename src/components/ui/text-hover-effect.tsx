'use client';

/**
 * Oversized outlined wordmark whose outline is drawn once when it scrolls into view, and lit in
 * PKU colours under the pointer. Ported from 21st.dev: mdafsarx/hover-footer (its
 * `TextHoverEffect`, from Aceternity UI). Changes: the light follows the pointer by moving the
 * mask's gradient directly instead of through React state (no re-render per mouse move), the outline draws on scroll into
 * view (not on mount, which happened off-screen), a faint fill keeps it readable as a sign-off,
 * the gradient uses our tokens, unique ids per instance, and under reduced motion the outline is
 * simply there.
 */

import { motion, useInView } from 'motion/react';
import { type PointerEvent, useId, useRef } from 'react';
import { useReducedMotionAfterMount } from '@/components/ui/use-reduced-motion-after-mount';
import { cn } from '@/lib/cn';

export function TextHoverEffect({ text, className }: { text: string; className?: string }) {
  const id = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const maskRef = useRef<SVGRadialGradientElement>(null);
  const inView = useInView(svgRef, { once: true, amount: 0.4 });
  const reduce = useReducedMotionAfterMount();

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const mask = maskRef.current;
    if (!svg || !mask) return;
    const r = svg.getBoundingClientRect();
    mask.setAttribute('cx', `${((e.clientX - r.left) / r.width) * 100}%`);
    mask.setAttribute('cy', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const common = {
    x: '50%',
    y: '54%',
    textAnchor: 'middle' as const,
    dominantBaseline: 'middle' as const,
    className: 'font-bold [font-size:200px] [letter-spacing:-0.04em]',
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1200 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      onPointerMove={onMove}
      className={cn('group select-none', className)}
    >
      <defs>
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0">
          <stop offset="0%" stopColor="var(--color-pku-amber)" />
          <stop offset="35%" stopColor="var(--color-brand-bright)" />
          <stop offset="65%" stopColor="var(--color-pku-sand)" />
          <stop offset="100%" stopColor="var(--color-pku-slate)" />
        </linearGradient>
        <radialGradient ref={maskRef} id={`${id}-r`} gradientUnits="userSpaceOnUse" r="22%" cx="50%" cy="50%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id={`${id}-m`}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}-r)`} />
        </mask>
      </defs>
      <text {...common} fill="currentColor" fillOpacity="0.045" stroke="none">
        {text}
      </text>
      <motion.text
        {...common}
        fill="transparent"
        stroke="currentColor"
        strokeOpacity="0.14"
        strokeWidth="1"
        initial={{ strokeDashoffset: 1400, strokeDasharray: 1400 }}
        animate={inView || reduce ? { strokeDashoffset: 0, strokeDasharray: 1400 } : undefined}
        transition={reduce ? { duration: 0 } : { duration: 3.2, ease: [0.45, 0, 0.55, 1] }}
      >
        {text}
      </motion.text>
      <text
        {...common}
        fill="transparent"
        stroke={`url(#${id}-g)`}
        strokeWidth="1.6"
        mask={`url(#${id}-m)`}
        className={cn(common.className, 'opacity-0 transition-opacity duration-300 group-hover:opacity-100')}
      >
        {text}
      </text>
    </svg>
  );
}
