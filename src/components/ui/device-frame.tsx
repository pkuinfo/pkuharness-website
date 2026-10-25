/**
 * An Android phone around real screen captures (1080 × 2400, 9:20). Adapted from 21st.dev:
 * ruixen.ui/phone-scroll-hero (its `PhoneFrame` chassis: side keys, inset screen, camera that
 * stays black in both themes) and magicui/android (Android proportions, punch-hole camera).
 * Changes: sizes in container units so one frame works from 200 to 400 px wide, a 9:20 screen to
 * match the captures exactly (no cropping), a soft offset shadow instead of a glow, no theme
 * swap of the hardware: a phone is a dark object in a light room too. The graphite frame and black
 * glass match the hero's 3D phone (`landing/phone-scene.tsx`).
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function DeviceFrame({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn('relative [container-type:inline-size]', className)}>
      {/* side keys: volume, power */}
      <span
        aria-hidden="true"
        className="absolute top-[17%] -right-[0.9cqw] h-[11%] w-[1.4cqw] rounded-r-[1cqw] bg-[var(--color-device-key)]"
      />
      <span
        aria-hidden="true"
        className="absolute top-[31%] -right-[0.9cqw] h-[6%] w-[1.4cqw] rounded-r-[1cqw] bg-[var(--color-device-key)]"
      />
      <div className="relative rounded-[11.5cqw] bg-[image:var(--lp-device-metal)] p-[0.6cqw] shadow-[0_2px_4px_rgba(0,0,0,0.18),0_30px_60px_-20px_rgba(0,0,0,0.45)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.5),0_40px_80px_-24px_rgba(0,0,0,0.85)]">
        <div className="relative rounded-[11cqw] bg-[var(--color-device-glass)] p-[2.4cqw]">
          <div className="relative aspect-[9/20] overflow-hidden rounded-[9cqw] bg-neutral-900">
            {children}
            <span
              aria-hidden="true"
              className="absolute top-[1.35%] left-1/2 z-10 size-[3.6cqw] -translate-x-1/2 rounded-full bg-black ring-[0.4cqw] ring-white/5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
