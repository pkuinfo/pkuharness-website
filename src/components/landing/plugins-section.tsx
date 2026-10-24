import { Link2, Scale, ScanSearch } from 'lucide-react';
import { type Lang, localePath } from '@/lib/i18n';
import { pluginDescription } from '@/lib/marketplace/labels';
import type { MarketplacePlugin } from '@/lib/marketplace/types';
import { t } from '@/lib/messages';
import { Section, SectionHeading } from './bits';
import { PluginOrbit } from './plugin-orbit';
import type { OrbitPlugin } from './plugin-orbit-scene';
import { CORE_PLUGIN_IDS, type LandingPlugin } from './registry';
import { DeviceMedia, type MediaPair } from './showcase/device-media';
import { SpotlightList } from './spotlight-list';

const ICONS = [Link2, ScanSearch, Scale];

export function PluginsSection({
  lang,
  plugins,
  media,
  market = [],
}: {
  lang: Lang;
  plugins: LandingPlugin[];
  media?: MediaPair;
  /** Marketplace index entries, for links and English descriptions (may be empty). */
  market?: MarketplacePlugin[];
}) {
  const m = t(lang).home;
  const p = m.plugins;

  const official = new Map(
    market.filter((x) => x.slug.startsWith('pkuinfo/pku-harness-plugins/')).map((x) => [x.id, x] as const),
  );
  const hrefs: Record<string, string> = {};
  const orbit: OrbitPlugin[] = plugins.map((pl) => {
    const entry = official.get(pl.id);
    if (entry) hrefs[pl.id] = localePath(lang, `/marketplace/${entry.slug}`);
    const desc = entry ? pluginDescription(entry, lang) : undefined;
    return {
      ...pl,
      description: desc && desc.lang === lang ? desc.text : pl.description,
      group: pl.kind === 'remote' ? 'remote' : CORE_PLUGIN_IDS.has(pl.id) ? 'core' : 'campus',
    };
  });

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
            <SpotlightList
              className="mt-10 max-w-[36rem]"
              items={p.points.map((pt, i) => ({
                key: pt.title,
                title: pt.title,
                body: pt.body,
                icon: ICONS[i] ?? Link2,
              }))}
            />
          </div>
          {media && (
            <div className="mx-auto w-[min(68vw,280px)] md:w-full lg:w-[280px]">
              <DeviceMedia media={media} sizes="280px" labels={m.media} glow />
            </div>
          )}
        </div>

        <div className="mt-16 md:mt-20">
          <PluginOrbit
            plugins={orbit}
            hrefs={hrefs}
            browseHref={localePath(lang, '/marketplace')}
            initial="classrooms"
            labels={{ ...p.orbit, browse: p.browse }}
          />
        </div>
      </Section>
    </section>
  );
}
