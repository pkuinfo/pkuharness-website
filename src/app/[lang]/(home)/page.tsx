import type { Metadata } from 'next';
import { AppTabs, type TabId } from '@/components/landing/app-tabs';
import { Developers } from '@/components/landing/developers';
import { DownloadCta } from '@/components/landing/download-cta';
import { Hero } from '@/components/landing/hero';
import { HomeFaq } from '@/components/landing/home-faq';
import { Privacy } from '@/components/landing/privacy';
import { getLocalizedPlugins } from '@/components/landing/registry';
import { Services } from '@/components/landing/services';
import { getShowcase, pick } from '@/components/landing/showcase/media';
import { toLang } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { getReleases, pickLatest } from '@/lib/releases';

export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const m = t(toLang((await params).lang)).home.meta;
  return { title: { absolute: m.title }, description: m.description };
}

/** Which captures (manifest `feature`) illustrate each tab, best first. */
const TAB_FEATURES: Record<TabId, string[]> = {
  chat: ['chat'],
  dashboard: ['dashboard'],
  schedule: ['schedule', 'timetable', 'todo'],
  settings: ['settings', 'permissions'],
};

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const lang = toLang((await params).lang);
  const [plugins, media, { releases }] = await Promise.all([
    getLocalizedPlugins(lang),
    getShowcase(lang),
    getReleases(),
  ]);
  const hero = pick(media, lang, ['chat'], { preferVideo: true });
  const tabs = {
    chat: pick(media, lang, TAB_FEATURES.chat, { exclude: hero ? [hero.dark.src] : [] }),
    dashboard: pick(media, lang, TAB_FEATURES.dashboard),
    schedule: pick(media, lang, TAB_FEATURES.schedule),
    settings: pick(media, lang, TAB_FEATURES.settings),
  };
  return (
    <div className="lp-home flex flex-col">
      <Hero lang={lang} latest={pickLatest(releases)} media={hero} />
      <AppTabs lang={lang} media={tabs} />
      <Services lang={lang} plugins={plugins} />
      <Privacy lang={lang} />
      <Developers lang={lang} />
      <HomeFaq lang={lang} />
      <DownloadCta lang={lang} />
    </div>
  );
}
