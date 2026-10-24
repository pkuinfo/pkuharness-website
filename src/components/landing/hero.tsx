import { ArrowDownToLine, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import type { Release } from '@/lib/releases';
import { github, repos } from '@/lib/shared';
import { button, GitHubIcon } from './bits';
import { HeroBackdrop } from './hero-backdrop';
import { HeroStage } from './hero-stage';
import type { MediaPair } from './showcase/device-media';

const delay = (s: number) => ({ '--lp-delay': `${s}s` }) as CSSProperties;

export function Hero({
  lang,
  latest,
  stage,
}: {
  lang: Lang;
  latest?: Release;
  stage: { center?: MediaPair; left?: MediaPair; right?: MediaPair };
}) {
  const m = t(lang);
  const h = m.home.hero;
  return (
    <section aria-labelledby="hero-title" className="relative isolate -mt-14 overflow-hidden pt-14 pb-12 md:pb-16">
      <HeroBackdrop />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 pt-12 text-center md:px-8 md:pt-20">
        <h1
          id="hero-title"
          className="lp-display lp-rise font-bold text-[2.6rem] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[5.25rem]"
        >
          {h.title[0]}
          <br />
          {h.title[1]}
        </h1>
        <p
          className="lp-rise mt-7 max-w-[36rem] text-pretty text-[17px] text-fd-muted-foreground leading-[1.75] md:text-xl md:leading-[1.7]"
          style={delay(0.08)}
        >
          {h.lead}
        </p>
        <div className="lp-rise mt-9 flex flex-wrap items-center justify-center gap-3" style={delay(0.16)}>
          <Link href={localePath(lang, '/download')} className={button.primary}>
            <ArrowDownToLine className="size-[18px]" aria-hidden="true" />
            {h.download}
          </Link>
          <Link href={localePath(lang, '/docs')} className={button.glass}>
            <BookOpen className="size-[18px]" aria-hidden="true" />
            {h.docs}
          </Link>
          <a href={github(repos.app)} className={cn(button.ghost, 'max-sm:hidden')}>
            <GitHubIcon className="size-[18px]" />
            {h.source}
          </a>
        </div>
        <ul
          className="lp-rise mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-fd-muted-foreground text-sm"
          style={delay(0.24)}
        >
          {latest && (
            <li>
              <a
                href={latest.htmlUrl}
                className="inline-flex items-center gap-2 rounded-full underline-offset-4 hover:text-fd-foreground hover:underline focus-visible:outline-2 focus-visible:outline-fd-ring"
              >
                <span className="relative flex size-2" aria-hidden="true">
                  <span className="absolute inset-0 animate-ping rounded-full bg-up opacity-60 [animation-iteration-count:3]" />
                  <span className="relative size-2 rounded-full bg-up" />
                </span>
                {h.released(latest.tag)}
              </a>
            </li>
          )}
          <li>{h.android}</li>
          <li>{h.license}</li>
        </ul>
      </div>
      {stage.center && <HeroStage center={stage.center} left={stage.left} right={stage.right} labels={m.home.media} />}
    </section>
  );
}
