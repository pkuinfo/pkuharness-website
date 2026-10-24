import type { Metadata } from 'next';
import { Section, SectionHeading } from '@/components/landing/bits';
import { Developers } from '@/components/landing/developers';
import { DownloadCta } from '@/components/landing/download-cta';
import { type Chapter, FeatureTour } from '@/components/landing/feature-tour';
import { Hero } from '@/components/landing/hero';
import { HomeFaq } from '@/components/landing/home-faq';
import { PluginsSection } from '@/components/landing/plugins-section';
import { getLocalizedPlugins } from '@/components/landing/registry';
import { getShowcase, pick } from '@/components/landing/showcase/media';
import { Trust } from '@/components/landing/trust';
import { toLang } from '@/lib/i18n';
import { getMarketplaceIndex } from '@/lib/marketplace';
import { t } from '@/lib/messages';
import { getReleases, pickLatest } from '@/lib/releases';
import '@/components/landing/landing.css';

export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const m = t(toLang((await params).lang)).home.meta;
  return { title: { absolute: m.title }, description: m.description };
}

/** Which captures (manifest `feature`) illustrate each tab, best first. */
const TAB_FEATURES: Record<Chapter['id'], string[]> = {
  chat: ['chat'],
  dashboard: ['dashboard'],
  schedule: ['schedule', 'timetable', 'todo'],
  settings: ['settings', 'permissions'],
};

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const lang = toLang((await params).lang);
  const m = t(lang).home;
  const [plugins, media, { releases }, market] = await Promise.all([
    getLocalizedPlugins(lang),
    getShowcase(lang),
    getReleases(),
    getMarketplaceIndex()
      .then((i) => i.plugins)
      .catch(() => []),
  ]);
  const latest = pickLatest(releases);

  const heroCenter = pick(media, lang, ['chat'], { preferVideo: true });
  const stage = {
    center: heroCenter,
    left: pick(media, lang, ['plugins']),
    right: pick(media, lang, ['install', 'permissions']),
  };
  const chapters: Chapter[] = (['chat', 'dashboard', 'schedule', 'settings'] as const).map((id) => ({
    id,
    ...m.tour.chapters[id],
    // the hero already plays the chat recording, so the tour shows the still
    media: pick(media, lang, TAB_FEATURES[id], { exclude: heroCenter ? [heroCenter.dark.src] : [] }),
  }));
  const install = pick(media, lang, ['install'], { preferVideo: true });

  return (
    <div className="lp-home flex flex-col overflow-x-clip">
      <Hero lang={lang} latest={latest} stage={stage} />

      <Section labelledBy="tour-title" id="tour" className="pt-16 pb-4 md:pt-24">
        <SectionHeading id="tour-title" title={m.tour.title}>
          <p>{m.tour.lead}</p>
        </SectionHeading>
        <FeatureTour
          chapters={chapters}
          labels={{ ...m.media, examples: m.tour.examplesLabel, tabBar: m.tour.tabBar }}
        />
      </Section>

      <PluginsSection lang={lang} plugins={plugins} media={install} market={market} />
      <Trust lang={lang} />
      <Developers lang={lang} />
      <HomeFaq lang={lang} />
      <DownloadCta lang={lang} />
    </div>
  );
}
