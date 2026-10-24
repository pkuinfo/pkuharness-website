import { CalendarDays, LayoutDashboard, type LucideIcon, MessagesSquare, Settings } from 'lucide-react';
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

/**
 * The four tabs, in the app's order. A tab with a public capture gets a full row: text beside
 * the real screen, sides alternating. Consecutive tabs without one (their screens show personal
 * data) share a compact row of panels with what you'd say to them. No mock-ups.
 */
export function FeatureTour({
  chapters,
  labels,
}: {
  chapters: Chapter[];
  labels: { play: string; pause: string; examples: string };
}) {
  // Group runs of capture-less chapters so they sit side by side.
  const groups: (Chapter | Chapter[])[] = [];
  for (const c of chapters) {
    const last = groups.at(-1);
    if (c.media) groups.push(c);
    else if (Array.isArray(last)) last.push(c);
    else groups.push([c]);
  }
  let rows = 0;
  return (
    <div className="mt-12 flex flex-col gap-16 md:mt-16 md:gap-20">
      {groups.map((g) =>
        Array.isArray(g) ? (
          <ul
            key={g.map((c) => c.id).join()}
            className={cn('grid grid-cols-1 gap-4', g.length > 1 && 'md:grid-cols-2')}
          >
            {g.map((c) => (
              <li key={c.id} id={`tour-${c.id}`} className="lp-glass scroll-mt-24 rounded-[20px] p-6 md:p-8">
                <ChapterText chapter={c} labels={labels} compact />
              </li>
            ))}
          </ul>
        ) : (
          <MediaRow key={g.id} chapter={g} labels={labels} flip={rows++ % 2 === 1} />
        ),
      )}
    </div>
  );
}

function MediaRow({
  chapter,
  labels,
  flip,
}: {
  chapter: Chapter;
  labels: { play: string; pause: string; examples: string };
  flip: boolean;
}) {
  return (
    <article
      id={`tour-${chapter.id}`}
      className={cn(
        'grid scroll-mt-24 grid-cols-1 items-center gap-12 md:gap-14 lg:gap-24',
        flip
          ? 'md:grid-cols-[minmax(0,270px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]'
          : 'md:grid-cols-[minmax(0,1fr)_minmax(0,270px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]',
      )}
    >
      <div className={cn(flip && 'md:order-2')}>
        <ChapterText chapter={chapter} labels={labels} />
      </div>
      <div className={cn('mx-auto w-[min(68vw,280px)] md:w-full', flip && 'md:order-1')}>
        {chapter.media && (
          <DeviceMedia
            media={chapter.media}
            sizes="(min-width: 768px) 280px, 68vw"
            labels={labels}
            glow
            frameClassName="lg:mx-6"
          />
        )}
      </div>
    </article>
  );
}

function ChapterText({
  chapter,
  labels,
  compact = false,
}: {
  chapter: Chapter;
  labels: { examples: string };
  compact?: boolean;
}) {
  const Icon = ICONS[chapter.id];
  return (
    <div className="max-w-[34rem]">
      <p className="flex items-center gap-2.5 font-medium text-fd-primary">
        <Icon className="size-5" aria-hidden="true" />
        {chapter.name}
      </p>
      <h3
        className={cn(
          'lp-display mt-4 text-balance font-semibold leading-[1.22]',
          compact ? 'text-2xl md:text-[1.75rem]' : 'text-[1.75rem] md:text-4xl',
        )}
      >
        {chapter.title}
      </h3>
      <p className={cn('mt-4 text-pretty text-fd-muted-foreground leading-[1.75]', !compact && 'text-lg')}>
        {chapter.body}
      </p>
      <p className="sr-only">{labels.examples}</p>
      <ul className={cn('flex flex-col items-start gap-2', compact ? 'mt-6' : 'mt-7')}>
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
