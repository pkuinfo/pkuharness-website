'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useReducedMotionAfterMount } from '@/components/ui/use-reduced-motion-after-mount';
import { DeviceMedia, type MediaPair } from './showcase/device-media';

/**
 * A large phone that settles into place as its section scrolls in: it rises, straightens from a
 * slight tilt and grows to full size, tied to the scroll position (transform and opacity only).
 * Same idea as the hero's container-scroll mapping, per section. Still under reduced motion.
 */
export function ScrollDevice({
  media,
  labels,
  side = 'right',
  sizes,
}: {
  media: MediaPair;
  labels: { play: string; pause: string };
  side?: 'left' | 'right';
  sizes: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionAfterMount();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const y = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [side === 'right' ? -14 : 14, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  return (
    <div ref={ref} className="[perspective:1400px]">
      <motion.div style={reduce ? undefined : { y, scale, rotateY, rotateX, opacity }}>
        <DeviceMedia media={media} sizes={sizes} labels={labels} />
      </motion.div>
    </div>
  );
}
