import { ArrowUpRight, Link2, Scale, ScanSearch } from 'lucide-react';
import Link from 'next/link';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { Section, SectionHeading } from './bits';
import { PluginMarquee } from './plugin-marquee';
import type { LandingPlugin } from './registry';
import { DeviceMedia, type MediaPair } from './showcase/device-media';

const ICONS = [Link2, ScanSearch, Scale];

export function PluginsSection({ lang, plugins, media }: { lang: Lang; plugins: LandingPlugin[]; media?: MediaPair }) {
  const m = t(lang).home;
  const p = m.plugins;
  return (
    <section aria-labelledby="plugins-title" className="relative py-16 md:py-24">
      <Section>
        <div
          className={
            media
              ? 'grid grid-cols-1 items-center gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,250px)] md:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-20'
              : ''
          }
        >
          <div>
            <SectionHeading id="plugins-title" title={p.title}>
              <p>{p.lead}</p>
            </SectionHeading>
            <ul className="mt-10 max-w-[36rem] divide-y divide-fd-border border-fd-border border-y">
              {p.points.map((pt, i) => {
                const Icon = ICONS[i] ?? Link2;
                return (
                  <li key={pt.title} className="grid grid-cols-[auto_1fr] gap-x-4 py-5">
                    <Icon className="mt-1 size-5 text-fd-primary" aria-hidden="true" />
                    <h3 className="font-semibold text-lg">{pt.title}</h3>
                    <p className="col-start-2 mt-1.5 text-pretty text-fd-muted-foreground leading-[1.75]">{pt.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
          {media && (
            <div className="mx-auto w-[min(68vw,280px)] md:w-full lg:w-[280px]">
              <DeviceMedia media={media} sizes="280px" labels={m.media} glow />
            </div>
          )}
        </div>
      </Section>

      <div className="mt-14 md:mt-16">
        <div className="mx-auto mb-6 flex max-w-[1200px] flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-4 md:px-8">
          <p className="font-medium text-fd-muted-foreground">{p.count(plugins.length)}</p>
          <Link
            href={localePath(lang, '/marketplace')}
            className="group inline-flex items-center gap-1 font-medium text-fd-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-fd-ring"
          >
            {p.browse}
            <ArrowUpRight
              className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
        <PluginMarquee plugins={plugins} remoteLabel={p.remote} />
      </div>
    </section>
  );
}
