import '@/components/intro/intro.css';
import type { Metadata } from 'next';
import { IntroMotion } from '@/components/intro/intro-motion';
import { localePath, toLang } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { homePath } from '@/lib/shared';

/**
 * The site root (`/`, `/en`): an interactive WebGL particle piece that ends with a link to the home
 * page at `/home`, which does the explaining. With reduced motion or without JavaScript it is a
 * still frame: the logo, the name and the link.
 */
export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const m = t(lang).intro.meta;
  return {
    title: { absolute: m.title },
    description: m.description,
    alternates: { canonical: localePath(lang, '/'), languages: { 'zh-CN': '/', en: '/en' } },
  };
}

export default async function IntroPage({ params }: PageProps<'/[lang]'>) {
  const lang = toLang((await params).lang);
  const m = t(lang).intro;
  const home = localePath(lang, homePath);
  return (
    <main lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      <IntroMotion m={m} homeHref={home} otherLangHref={localePath(lang === 'zh' ? 'en' : 'zh', '/')} />
      <noscript>
        {/* Without JavaScript: the still frame. */}
        <style>{`.ih-stage,.ih-art,.ih-end,.ih-hint,.ih-hud,.ih-track-scroll,.ih-progress{display:none!important}.ih-still{display:flex!important}`}</style>
      </noscript>
    </main>
  );
}
