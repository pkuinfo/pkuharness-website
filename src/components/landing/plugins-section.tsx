import { ArrowUpRight, Link2, Scale, ScanSearch } from 'lucide-react';
import Link from 'next/link';
import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/cn';
import { type Lang, localePath } from '@/lib/i18n';
import { pluginDescription } from '@/lib/marketplace/labels';
import type { MarketplacePlugin } from '@/lib/marketplace/types';
import { t } from '@/lib/messages';
import { Section, SectionHeading } from './bits';
import { pluginIcon } from './plugin-icon';
import { CORE_PLUGIN_IDS, type LandingPlugin } from './registry';
import { Reveal } from './reveal';
import { ScrollDevice } from './scroll-device';
import type { MediaPair } from './showcase/device-media';

const ICONS = [Link2, ScanSearch, Scale];
type Group = 'campus' | 'core' | 'remote';
const ORDER: Group[] = ['campus', 'core', 'remote'];
/** The same bead colours as the hero's orbit (phone-scene.tsx). */
const BEAD: Record<Group, string> = {
  campus: 'bg-brand-bright dark:bg-fd-primary',
  core: 'bg-pku-gold dark:bg-pku-sand',
  remote: 'bg-pku-slate dark:bg-info-fg',
};

/**
 * What a plugin is (three short points beside the real install recording), then every plugin in
 * the marketplace as one large wall of tiles, grouped by what it connects to; each group is
 * marked with its bead colour from the hero's orbit. Tiles fade in row by
 * row as the wall scrolls into view; each links to its marketplace page.
 */
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
  const tiles = plugins.map((pl) => {
    const entry = official.get(pl.id);
    const desc = entry ? pluginDescription(entry, lang) : undefined;
    return {
      ...pl,
      href: entry ? localePath(lang, `/marketplace/${entry.slug}`) : undefined,
      description: desc && desc.lang === lang ? desc.text : pl.description,
      group: (pl.kind === 'remote' ? 'remote' : CORE_PLUGIN_IDS.has(pl.id) ? 'core' : 'campus') as Group,
    };
  });

  return (
    <section aria-labelledby="plugins-title" className="relative py-24 md:py-36">
      <Section>
        <SectionHeading id="plugins-title" title={p.title} align="center">
          <p>{p.lead}</p>
        </SectionHeading>

        <div
          className={cn(
            'mt-20 grid grid-cols-1 items-center gap-16 md:mt-28',
            media && 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-24',
          )}
        >
          {media && (
            <div className="mx-auto w-[min(72vw,320px)] md:w-[min(30vw,340px)]">
              <ScrollDevice media={media} labels={m.media} side="left" sizes="(min-width: 768px) 340px, 72vw" />
            </div>
          )}
          <ul className="flex max-w-[30rem] flex-col gap-10">
            {p.points.map((pt, i) => {
              const Icon = ICONS[i] ?? Link2;
              return (
                <Reveal as="li" key={pt.title} delay={i * 90}>
                  <Icon className="size-6 text-fd-primary" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold text-[21px] tracking-[-0.016em]">{pt.title}</h3>
                  <p className="mt-2 text-pretty text-[17px] text-[var(--color-lp-ink-2)] leading-[1.6]">{pt.body}</p>
                </Reveal>
              );
            })}
          </ul>
        </div>

        {/* the wall */}
        <div className="mt-28 md:mt-40">
          <Reveal className="flex flex-col items-center text-center">
            <p className="lp-display text-[5rem] leading-none tabular-nums md:text-[8rem]">
              <NumberTicker value={plugins.length} />
            </p>
            <p className="mt-3 text-[19px] text-[var(--color-lp-ink-2)] md:text-[21px]">{p.wall.countLabel}</p>
          </Reveal>
          <div className="mt-14 flex flex-col gap-12">
            {ORDER.map((g) => {
              const items = tiles.filter((x) => x.group === g);
              if (!items.length) return null;
              return (
                <div key={g}>
                  <h3 className="lp-eyebrow flex items-center justify-center gap-2.5">
                    <span aria-hidden="true" className={cn('size-2 rounded-full', BEAD[g])} />
                    {p.wall.groups[g]}
                  </h3>
                  <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {items.map((x, i) => {
                      const Icon = pluginIcon(x.icon);
                      const inner = (
                        <>
                          <Icon
                            className="size-[18px] shrink-0 text-fd-foreground/55 transition-colors duration-300 group-hover:text-fd-primary"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 font-medium text-[15px] leading-snug">{x.name}</span>
                        </>
                      );
                      const cls =
                        'group flex h-full items-center gap-3 rounded-[14px] bg-fd-foreground/[0.04] px-4 py-3.5 transition-[background-color,transform] duration-300 ease-out dark:bg-fd-foreground/[0.06]';
                      return (
                        <Reveal as="li" key={x.id} delay={(i % 6) * 50}>
                          {x.href ? (
                            <Link
                              href={x.href}
                              title={x.description || undefined}
                              className={cn(
                                cls,
                                'hover:-translate-y-0.5 hover:bg-fd-foreground/[0.07] focus-visible:outline-2 focus-visible:outline-fd-ring dark:hover:bg-fd-foreground/[0.1]',
                              )}
                            >
                              {inner}
                            </Link>
                          ) : (
                            <div title={x.description || undefined} className={cls}>
                              {inner}
                            </div>
                          )}
                        </Reveal>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="mt-12 text-center">
            <Link href={localePath(lang, '/marketplace')} className="lp-text-link">
              {p.browse}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </Section>
    </section>
  );
}
