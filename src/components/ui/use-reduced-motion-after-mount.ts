'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

/**
 * `useReducedMotion()`, but `false` during hydration: the server cannot know the preference, so
 * the first client render must match the server HTML (the animated start state). The reduced
 * variant takes over right after mount.
 */
export function useReducedMotionAfterMount(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && Boolean(reduce);
}
