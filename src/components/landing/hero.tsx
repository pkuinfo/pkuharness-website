import { preload } from 'react-dom';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import type { Release } from '@/lib/releases';
import { github, repos } from '@/lib/shared';
import { HeroSequence } from './hero-sequence';
import type { BeadKind } from './phone-scene';
import type { MediaPair } from './showcase/device-media';

/**
 * Plays the long intro once per browser session; later visits in the same session get a short
 * one. Runs before the hero is parsed, so the first paint already has the right state.
 */
const INTRO_SCRIPT = `try{var d=document.documentElement,k='lp-intro';d.dataset.lpIntro=sessionStorage.getItem(k)?'quick':'full';sessionStorage.setItem(k,'1')}catch(e){}`;

export function Hero({
  lang,
  latest,
  media,
  beads,
}: {
  lang: Lang;
  latest?: Release;
  media?: MediaPair;
  beads: BeadKind[];
}) {
  const m = t(lang);
  const h = m.home.hero;
  // The recording's poster is the first screen's largest image: fetch it with the HTML. Both
  // themes, since the theme is only known in the browser.
  for (const x of [media?.dark, media?.light]) {
    const poster = x?.kind === 'video' ? x.poster : x?.src;
    if (poster) preload(poster, { as: 'image', fetchPriority: 'high' });
  }
  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed inline script, no user input */}
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <HeroSequence
        lang={lang}
        title={h.title.join(' ')}
        lead={h.lead}
        download={{ href: localePath(lang, '/download'), label: h.download }}
        docs={{ href: localePath(lang, '/docs'), label: h.docs }}
        source={{ href: github(repos.app), label: h.source }}
        meta={[latest ? { href: latest.htmlUrl, label: h.released(latest.tag) } : null, h.android, h.license]}
        media={media}
        labels={m.home.media}
        beads={beads}
      />
    </>
  );
}
