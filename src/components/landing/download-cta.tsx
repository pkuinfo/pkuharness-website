import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { htmlLang, type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { getReleases, pickLatest } from '@/lib/releases';
import { github, repos } from '@/lib/shared';
import { GitHubIcon, Section } from './bits';
import { Reveal } from './reveal';

function formatDay(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(htmlLang[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(iso));
}

/** Closing call to action with the latest release. `lang` defaults to Chinese. */
export async function DownloadCta({ lang = 'zh' }: { lang?: Lang } = {}) {
  const m = t(lang).home.cta;
  const latest = pickLatest((await getReleases()).releases);
  return (
    <Section labelledBy="cta-title" className="py-28 text-center md:py-40">
      <Reveal>
        <Logo size={64} className="mx-auto" />
        <h2 id="cta-title" className="lp-display mt-8 text-[3rem] leading-[1.02] md:text-[6rem]">
          {m.title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-[19px] text-[var(--color-lp-ink-2)] leading-[1.55] md:text-[21px]">
          {latest ? m.latest(latest.tag, formatDay(latest.publishedAt, lang)) : m.none}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href={localePath(lang, '/download')} className="lp-pill lp-pill-primary">
            {latest ? m.download(latest.tag) : m.downloadPage}
          </Link>
          <a href={github(repos.app)} className="lp-text-link">
            <GitHubIcon className="me-1 size-4" />
            {m.github}
            <ChevronRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
