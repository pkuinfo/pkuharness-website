import Link from 'next/link';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { Section, SectionHeading } from './bits';
import { DeviceMedia, type MediaPair } from './showcase/device-media';

export type TabId = 'chat' | 'dashboard' | 'schedule' | 'settings';

/** The four tabs of the app, each with a real screen and a link to its manual page. */
export function AppTabs({ lang, media }: { lang: Lang; media: Record<TabId, MediaPair | undefined> }) {
  const m = t(lang).home;
  const ids: TabId[] = ['chat', 'dashboard', 'schedule', 'settings'];
  return (
    <Section labelledBy="tabs-title" className="border-fd-border border-t py-16 md:py-20">
      <SectionHeading id="tabs-title" title={m.tabs.title} size="md" />
      <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {ids.map((id) => {
          const item = m.tabs.items[id];
          const shot = media[id];
          return (
            <article key={id} aria-labelledby={`tab-${id}`} className="flex flex-col">
              {shot && (
                <DeviceMedia
                  media={shot}
                  sizes="(min-width: 1024px) 220px, (min-width: 640px) 40vw, 70vw"
                  labels={m.media}
                  caption={false}
                  className="mx-auto mb-6 w-full max-w-[220px]"
                />
              )}
              <h3 id={`tab-${id}`} className="font-semibold text-lg">
                {item.name}
              </h3>
              <p className="mt-2 text-pretty text-[15px] text-[var(--color-lp-ink-2)] leading-[1.65]">{item.body}</p>
              <Link
                href={localePath(lang, `/docs/manual/${id}`)}
                className="mt-3 text-fd-primary text-sm underline-offset-4 hover:underline"
              >
                {m.tabs.more}
              </Link>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
