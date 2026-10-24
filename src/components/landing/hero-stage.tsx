'use client';

import {
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { DeviceMedia, type MediaPair } from './showcase/device-media';

/**
 * The hero's devices. The middle phone (a real recording) starts tilted back under the headline
 * and straightens as you scroll; the two stills beside it swing in from behind. The scroll
 * choreography is adapted from 21st.dev: ruixen.ui/phone-scroll-hero (tilt on X, scale up,
 * climb). Changes: driven by motion's `useScroll` on the stage, flanking devices with counter
 * motion, no fixed section height, and a still stage under reduced motion.
 *
 * Entrance: the middle phone rises first, the side phones follow from further back. With a fine
 * pointer, the three phones shift a few pixels against the pointer at different depths (side
 * phones more than the middle one), so the stage reads as three objects in space.
 */
export function HeroStage({
  center,
  left,
  right,
  labels,
}: {
  center: MediaPair;
  left?: MediaPair;
  right?: MediaPair;
  labels: { play: string; pause: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.15'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const sideY = useTransform(scrollYProgress, [0, 1], [120, 56]);
  const sideRotate = useTransform(scrollYProgress, [0, 1], [9, 4]);
  const sideRotateNeg = useTransform(sideRotate, (v) => -v);
  const sideX = useTransform(scrollYProgress, [0, 1], [-48, 0]);
  const sideXNeg = useTransform(sideX, (v) => -v);

  // Pointer parallax: -1..1 from the viewport centre, springy.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });

  // Server HTML is the animated start state; switch to the still stage only after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = mounted && Boolean(reduce);

  useEffect(() => {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce, px, py]);

  return (
    <div ref={ref} className="relative mx-auto mt-12 w-full max-w-[1100px] [perspective:1400px] md:mt-16">
      <div className="relative flex items-start justify-center">
        {left && (
          <Depth x={sx} y={sy} depth={-14} className="absolute top-0 left-[6%] hidden lg:block xl:left-[14%]">
            <div className="lp-device-in" style={{ '--lp-delay': '0.62s' } as CSSProperties}>
              <motion.div
                style={still ? { y: 56, rotate: -4 } : { y: sideY, x: sideX, rotate: sideRotateNeg }}
                className="w-[230px] origin-bottom-right"
              >
                <DeviceMedia media={left} sizes="230px" labels={labels} caption={false} />
              </motion.div>
            </div>
          </Depth>
        )}
        {right && (
          <Depth x={sx} y={sy} depth={-14} className="absolute top-0 right-[6%] hidden lg:block xl:right-[14%]">
            <div className="lp-device-in" style={{ '--lp-delay': '0.72s' } as CSSProperties}>
              <motion.div
                style={still ? { y: 56, rotate: 4 } : { y: sideY, x: sideXNeg, rotate: sideRotate }}
                className="w-[230px] origin-bottom-left"
              >
                <DeviceMedia media={right} sizes="230px" labels={labels} caption={false} />
              </motion.div>
            </div>
          </Depth>
        )}
        <Depth x={sx} y={sy} depth={-6} className="relative z-10">
          <div className="lp-device-in">
            <motion.div
              style={still ? undefined : { rotateX, scale, transformOrigin: '50% 0%' }}
              className="relative w-[min(72vw,300px)] md:w-[300px]"
            >
              <DeviceMedia media={center} sizes="(min-width: 768px) 300px, 72vw" labels={labels} glow eager />
            </motion.div>
          </div>
        </Depth>
      </div>
    </div>
  );
}

/** Shifts its child by `depth` px per unit of pointer offset. */
function Depth({
  x,
  y,
  depth,
  className,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  depth: number;
  className?: string;
  children: ReactNode;
}) {
  const tx = useTransform(x, (v) => v * depth);
  const ty = useTransform(y, (v) => v * depth * 0.6);
  return (
    <motion.div style={{ x: tx, y: ty }} className={className}>
      {children}
    </motion.div>
  );
}
