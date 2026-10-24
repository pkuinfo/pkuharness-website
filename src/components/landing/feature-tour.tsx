'use client';

import { CalendarDays, LayoutDashboard, type LucideIcon, MessagesSquare, Settings } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useRef, useState } from 'react';
import { useReducedMotionAfterMount } from '@/components/ui/use-reduced-motion-after-mount';
import { cn } from '@/lib/cn';
import { DeviceMedia, type MediaPair } from './showcase/device-media';

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

interface Labels {
  play: string;
  pause: string;
  examples: string;
  tabBar: string;
}

/**
 * The four tabs, in the app's order, told as one scroll.
 *
 * Wide screens: the chapters scroll on the left while one phone stays pinned on the right and
 * changes to the real capture of the chapter in the middle of the viewport; under it, a copy of
 * the app's tab bar shows where you are and jumps to a chapter. Adapted from 21st.dev:
 * manuarora700/sticky-scroll-reveal (Aceternity UI): `useScroll` progress picks the active card,
 * inactive text dims. Changes: page scroll instead of an inner scroll box, the sticky panel is a
 * phone whose screens cross-fade with a little depth, the tab bar, and no colour washes.
 *
 * Narrow screens: each chapter shows its own capture under the text, as before. No mock-ups:
 * a chapter without a public capture shows text only.
 */
export function FeatureTour({ chapters, labels }: { chapters: Chapter[]; labels: Labels }) {
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotionAfterMount();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start center', 'end center'] });
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = Math.min(chapters.length - 1, Math.max(0, Math.floor(p * chapters.length)));
    setActive((prev) => (prev === i ? prev : i));
  });

  const jump = (i: number) => {
    const el = document.getElementById(`tour-${chapters[i].id}`);
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  };

  return (
    <div className="mt-12 md:mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-16 xl:gap-24">
      <ol ref={listRef} className="flex flex-col gap-16 md:gap-20 lg:gap-0">
        {chapters.map((c, i) => (
          <li
            key={c.id}
            id={`tour-${c.id}`}
            data-active={i === active}
            className="scroll-mt-24 transition-opacity duration-500 ease-out lg:flex lg:min-h-[76vh] lg:items-center lg:opacity-30 lg:data-[active=true]:opacity-100"
          >
            <div className="w-full">
              <ChapterText chapter={c} labels={labels} />
              {c.media && (
                <div className="mx-auto mt-12 w-[min(68vw,280px)] lg:hidden">
                  <DeviceMedia media={c.media} sizes="68vw" labels={labels} glow />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="relative hidden lg:block">
        <div className="sticky top-[max(5rem,calc(50vh-22rem))] flex flex-col items-center">
          <div className="relative w-full max-w-[min(280px,calc((100vh-12rem)*0.43))] [perspective:1200px]">
            {chapters.map((c, i) => {
              const on = i === active;
              const offset = i < active ? -1 : 1;
              return (
                <motion.div
                  key={c.id}
                  aria-hidden={!on}
                  inert={!on}
                  initial={false}
                  animate={
                    reduce
                      ? { opacity: on ? 1 : 0 }
                      : {
                          opacity: on ? 1 : 0,
                          y: on ? 0 : offset * 28,
                          rotateX: on ? 0 : offset * -8,
                          scale: on ? 1 : 0.94,
                          filter: on ? 'blur(0px)' : 'blur(6px)',
                        }
                  }
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className={cn(i === 0 ? 'relative' : 'absolute inset-x-0 top-0', !on && 'pointer-events-none')}
                >
                  {c.media ? (
                    <DeviceMedia media={c.media} sizes="280px" labels={labels} glow caption={false} />
                  ) : (
                    <div className="aspect-[9/20] rounded-[36px] border border-fd-border border-dashed" />
                  )}
                </motion.div>
              );
            })}
          </div>
          <TabBar chapters={chapters} active={active} onPick={jump} label={labels.tabBar} />
          <p className="mt-4 min-h-[3lh] max-w-[30ch] text-pretty text-center text-fd-muted-foreground text-sm leading-relaxed">
            {chapters[active].media?.dark.caption}
          </p>
        </div>
      </div>
    </div>
  );
}

function TabBar({
  chapters,
  active,
  onPick,
  label,
}: {
  chapters: Chapter[];
  active: number;
  onPick: (i: number) => void;
  label: string;
}) {
  return (
    <nav aria-label={label} className="lp-glass mt-7 rounded-[18px] p-1">
      <ul className="flex">
        {chapters.map((c, i) => {
          const Icon = ICONS[c.id];
          const on = i === active;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(i)}
                aria-current={on ? 'step' : undefined}
                className={cn(
                  'relative flex w-[4.25rem] flex-col items-center gap-1 rounded-[14px] px-2 py-2 text-[11px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-fd-ring',
                  on ? 'text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {on && (
                  <motion.span
                    layoutId="lp-tour-tab"
                    className="absolute inset-0 -z-10 rounded-[14px] bg-brand/12 dark:bg-brand/35"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                <Icon className={cn('size-[18px]', on && 'text-fd-primary')} aria-hidden="true" />
                {c.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ChapterText({ chapter, labels }: { chapter: Chapter; labels: { examples: string } }) {
  const Icon = ICONS[chapter.id];
  return (
    <div className="max-w-[34rem]">
      <p className="flex items-center gap-2.5 font-medium text-fd-primary">
        <Icon className="size-5" aria-hidden="true" />
        {chapter.name}
      </p>
      <h3 className="lp-display mt-4 text-balance font-semibold text-[1.75rem] leading-[1.22] md:text-4xl">
        {chapter.title}
      </h3>
      <p className="mt-4 text-pretty text-fd-muted-foreground text-lg leading-[1.75]">{chapter.body}</p>
      <p className="sr-only">{labels.examples}</p>
      <ul className="mt-7 flex flex-col items-start gap-2">
        {chapter.examples.map((e) => (
          <li
            key={e}
            className="rounded-[14px] rounded-br-[4px] bg-brand/10 px-4 py-2.5 text-[15px] text-fd-foreground leading-snug dark:bg-brand/30"
          >
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}
