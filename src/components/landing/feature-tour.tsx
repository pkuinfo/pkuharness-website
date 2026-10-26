'use client';

import { CalendarDays, LayoutDashboard, type LucideIcon, MessagesSquare, Settings } from 'lucide-react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { DeviceFrame } from '@/components/ui/device-frame';
import { useReducedMotionAfterMount } from '@/components/ui/use-reduced-motion-after-mount';
import { cn } from '@/lib/cn';
import type { MediaPair } from './showcase/device-media';
import type { ShowcaseMedia } from './showcase/media';

export type TabId = 'chat' | 'dashboard' | 'schedule' | 'settings';

export interface Chapter {
  id: TabId;
  name: string;
  title: string;
  body: string;
  examples: string[];
  media?: MediaPair;
}

/** The app's own tab icons. */
const ICONS: Record<TabId, LucideIcon> = {
  chat: MessagesSquare,
  dashboard: LayoutDashboard,
  schedule: CalendarDays,
  settings: Settings,
};

/** How long each tab stays before the tour moves on by itself, ms. */
const STEP_MS = 6500;

/**
 * The app's four tabs on one phone you can operate. Tap a tab in the list, tap the phone's own
 * tab bar (transparent buttons lie over the tab bar in the capture), or swipe the screen; the
 * real capture of that tab slides in. Until you touch it, the tour moves to the next tab every
 * few seconds, with a progress line under the active tab; it pauses while out of view or under
 * the pointer and stops for good once you choose a tab. Reduced motion: no auto-advance, no slide.
 *
 * Adapted from 21st.dev: 0xUrvish/feature-carousel (a list of features beside one picture that
 * changes with the active item) and the auto-advancing steps with a progress bar from
 * shadcnblocks feature108. Changes: the picture is a phone you can use, captures are real, the
 * progress is a CSS animation (`.lp-tour-progress`), and the active item expands to its text.
 */
export function FeatureTour({ chapters, labels }: { chapters: Chapter[]; labels: { examples: string; hint: string } }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [stopped, setStopped] = useState(false);
  const [hover, setHover] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.4 });
  const reduce = useReducedMotionAfterMount();
  const auto = !stopped && !reduce;
  const n = chapters.length;

  const go = (i: number, byUser = true) => {
    const next = (i + n) % n;
    if (next === active) return;
    setDir(next > active || (active === n - 1 && next === 0 && !byUser) ? 1 : -1);
    setActive(next);
    if (byUser) setStopped(true);
  };

  const c = chapters[active];
  const shot = c.media ? still(c.media) : undefined;

  return (
    <div
      ref={root}
      className="mt-14 grid items-start gap-10 md:mt-20 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16 lg:gap-24"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* the tabs */}
      <div className="order-2 md:order-1 md:pt-16">
        <div role="tablist" aria-orientation="vertical" className="flex flex-col">
          {chapters.map((ch, i) => {
            const Icon = ICONS[ch.id];
            const on = i === active;
            return (
              <div key={ch.id} className="relative border-fd-border border-b">
                {on && auto && (
                  <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
                    <span
                      key={active}
                      className="lp-tour-progress block h-full bg-fd-primary"
                      style={{
                        animationDuration: `${STEP_MS}ms`,
                        animationPlayState: inView && !hover ? 'running' : 'paused',
                      }}
                      onAnimationEnd={() => go(active + 1, false)}
                    />
                  </span>
                )}
                <button
                  type="button"
                  role="tab"
                  id={`tour-tab-${ch.id}`}
                  aria-selected={on}
                  aria-controls="tour-panel"
                  onClick={() => go(i)}
                  className={cn(
                    'group relative flex w-full items-center gap-3 py-4 text-start transition-colors focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2',
                    on ? 'text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
                  )}
                >
                  <Icon className={cn('size-[18px] shrink-0', on && 'text-fd-primary')} aria-hidden="true" />
                  <span className="font-medium text-[15px]">{ch.name}</span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id="tour-panel"
                      role="tabpanel"
                      aria-labelledby={`tour-tab-${ch.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5">
                        <h3 className="font-semibold text-[22px] leading-snug tracking-[-0.015em] md:text-[24px]">
                          {ch.title}
                        </h3>
                        <p className="mt-2 max-w-[34rem] text-pretty text-[15px] text-[var(--color-lp-ink-2)] leading-[1.65]">
                          {ch.body}
                        </p>
                        <p className="sr-only">{labels.examples}</p>
                        <ul className="mt-4 flex flex-col gap-2 text-[14px]">
                          {ch.examples.map((e) => (
                            <li key={e} className="flex gap-2.5">
                              <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-fd-primary" />
                              <span>{e}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* the phone */}
      <figure className="order-1 mx-auto w-[min(68vw,280px)] md:order-2 md:w-[300px]">
        <DeviceFrame>
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={c.id}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: reduce ? 0 : `${d * 100}%`, opacity: reduce ? 0 : 1 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: reduce ? 0 : `${d * -30}%`, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              drag={reduce ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) go(active + 1);
                else if (info.offset.x > 50) go(active - 1);
              }}
              className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
            >
              {shot ? (
                <Screen shot={shot} />
              ) : (
                <div className="grid size-full place-items-center bg-fd-card text-fd-muted-foreground">
                  {(() => {
                    const Icon = ICONS[c.id];
                    return <Icon className="size-10" aria-hidden="true" />;
                  })()}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {/* the capture's own tab bar, made tappable */}
          <div className="absolute inset-x-0 bottom-0 z-10 grid h-[8.5%] grid-cols-4">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                type="button"
                tabIndex={-1}
                aria-label={ch.name}
                onClick={() => go(i)}
                className="cursor-pointer"
              />
            ))}
          </div>
        </DeviceFrame>
        <figcaption className="mt-4 text-balance text-center text-fd-muted-foreground text-xs">
          {labels.hint}
        </figcaption>
      </figure>
    </div>
  );
}

/** The tab's still capture in both themes (a recording shows its poster frame). */
function still({ dark, light }: MediaPair) {
  const pic = (m?: ShowcaseMedia) => (m ? { src: m.kind === 'video' ? m.poster : m.src, alt: m.caption } : undefined);
  return { dark: pic(dark), light: pic(light) };
}

function Screen({ shot }: { shot: NonNullable<ReturnType<typeof still>> }) {
  const { dark, light } = shot;
  return (
    <>
      {dark?.src && (
        <Image
          src={dark.src}
          alt={dark.alt}
          width={1080}
          height={2400}
          sizes="300px"
          draggable={false}
          className={cn('pointer-events-none size-full object-cover', light?.src && 'hidden dark:block')}
        />
      )}
      {light?.src && (
        <Image
          src={light.src}
          alt={light.alt}
          width={1080}
          height={2400}
          sizes="300px"
          draggable={false}
          className="pointer-events-none size-full object-cover dark:hidden"
        />
      )}
    </>
  );
}
