import { CalendarDays, LayoutDashboard, type LucideIcon, MessagesSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from './reveal';
import { ScrollDevice } from './scroll-device';
import type { MediaPair } from './showcase/device-media';

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

/**
 * The four tabs as four full-width moments, one after another: a large heading, a short
 * paragraph, what you could say to the assistant, and the tab's real capture in a large phone
 * that settles into place as you scroll. Sides alternate. No mock-ups: a tab without a public
 * capture shows text only.
 */
export function FeatureTour({
  chapters,
  labels,
}: {
  chapters: Chapter[];
  labels: { play: string; pause: string; examples: string };
}) {
  return (
    <div className="flex flex-col">
      {chapters.map((c, i) => {
        const flip = i % 2 === 1;
        const Icon = ICONS[c.id];
        return (
          <article
            key={c.id}
            id={`tour-${c.id}`}
            className="grid scroll-mt-16 grid-cols-1 items-center gap-14 py-14 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12 md:py-20 lg:gap-20"
          >
            <Reveal className={cn('max-w-[38rem]', flip && 'md:order-2')}>
              <p className="lp-eyebrow flex items-center gap-2">
                <Icon className="size-5 text-fd-primary" aria-hidden="true" />
                {c.name}
              </p>
              <h3 className="lp-display mt-4 text-balance text-[2.5rem] leading-[1.08] md:text-[3rem] lg:text-[3.5rem]">
                {c.title}
              </h3>
              <p className="mt-6 text-pretty text-[19px] text-[var(--color-lp-ink-2)] leading-[1.55] md:text-[21px]">
                {c.body}
              </p>
              <p className="sr-only">{labels.examples}</p>
              <ul className="mt-8 flex flex-col gap-2.5 text-[17px] text-fd-foreground/90">
                {c.examples.map((e) => (
                  <li key={e} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-fd-primary" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            {c.media && (
              <div className={cn('mx-auto w-[min(72vw,320px)] md:w-[min(30vw,360px)]', flip && 'md:order-1')}>
                <ScrollDevice
                  media={c.media}
                  labels={labels}
                  side={flip ? 'left' : 'right'}
                  sizes="(min-width: 768px) 360px, 72vw"
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
