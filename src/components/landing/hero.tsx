import Link from 'next/link';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import type { Release } from '@/lib/releases';
import { button } from './bits';
import { DeviceMedia, type MediaPair } from './showcase/device-media';

/** First screen: what the app is, how to get it, and one real screen of it. */
export function Hero({ lang, latest, media }: { lang: Lang; latest?: Release; media?: MediaPair }) {
  const m = t(lang).home;
  const h = m.hero;
  const facts = [latest ? h.released(latest.tag) : null, h.android, h.license].filter(Boolean);
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-4 pt-12 pb-16 md:grid-cols-[1.1fr_1fr] md:px-8 md:pt-20 md:pb-20"
    >
      <div>
        <h1 id="hero-title" className="lp-display text-[2.75rem] leading-[1.05] md:text-[3.5rem]">
          {h.title}
        </h1>
        <p className="mt-4 text-pretty font-medium text-[19px] leading-[1.5]">{h.tagline}</p>
        <p className="mt-6 max-w-[34rem] text-pretty text-[17px] text-[var(--color-lp-ink-2)] leading-[1.7]">
          {h.lead}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={localePath(lang, '/download')} className={button.primary}>
            {h.download}
          </Link>
          <Link href={localePath(lang, '/docs/manual')} className={button.glass}>
            {h.manual}
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-fd-muted-foreground text-sm">
          {facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
      {media && (
        <DeviceMedia
          media={media}
          sizes="(min-width: 768px) 300px, 70vw"
          labels={m.media}
          caption={false}
          eager
          className="mx-auto w-full max-w-[300px]"
        />
      )}
    </section>
  );
}
