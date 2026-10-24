'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { DeviceMedia, type MediaPair } from './showcase/device-media';

/**
 * The hero's devices. The middle phone (a real recording) starts tilted back under the headline
 * and straightens as you scroll; the two stills beside it swing in from behind. The scroll
 * choreography is adapted from 21st.dev: ruixen.ui/phone-scroll-hero (tilt on X, scale up,
 * climb). Changes: driven by motion's `useScroll` on the stage, flanking devices with counter
 * motion, no fixed section height, and a still stage under reduced motion.
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
  // Server HTML is the animated start state; switch to the still stage only after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = mounted && Boolean(reduce);

  return (
    <div ref={ref} className="relative mx-auto mt-12 w-full max-w-[1100px] [perspective:1400px] md:mt-16">
      <div className="lp-device-in relative flex items-start justify-center">
        {left && (
          <motion.div
            style={still ? { y: 56, rotate: -4 } : { y: sideY, x: sideX, rotate: sideRotateNeg }}
            className="absolute top-0 left-[6%] hidden w-[230px] origin-bottom-right lg:block xl:left-[14%]"
          >
            <DeviceMedia media={left} sizes="230px" labels={labels} caption={false} />
          </motion.div>
        )}
        {right && (
          <motion.div
            style={still ? { y: 56, rotate: 4 } : { y: sideY, x: sideXNeg, rotate: sideRotate }}
            className="absolute top-0 right-[6%] hidden w-[230px] origin-bottom-left lg:block xl:right-[14%]"
          >
            <DeviceMedia media={right} sizes="230px" labels={labels} caption={false} />
          </motion.div>
        )}
        <motion.div
          style={still ? undefined : { rotateX, scale, transformOrigin: '50% 0%' }}
          className="relative z-10 w-[min(72vw,300px)] md:w-[300px]"
        >
          <DeviceMedia media={center} sizes="(min-width: 768px) 300px, 72vw" labels={labels} glow eager />
        </motion.div>
      </div>
    </div>
  );
}
