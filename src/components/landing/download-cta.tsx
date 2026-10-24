import { ArrowDownToLine } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { BorderBeam } from '@/components/ui/border-beam';
import { htmlLang, type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { getReleases, pickLatest } from '@/lib/releases';
import { github, repos } from '@/lib/shared';
import { button, GitHubIcon, Section } from './bits';

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
    <Section labelledBy="cta-title" className="py-16 md:py-20">
      <div className="relative isolate overflow-hidden rounded-[28px] border border-fd-border px-6 py-14 text-center md:px-12 md:py-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(196,34,54,0.16),transparent_70%),radial-gradient(40%_60%_at_0%_100%,rgba(71,92,135,0.12),transparent_70%),radial-gradient(40%_60%_at_100%_100%,rgba(186,149,112,0.14),transparent_70%)] dark:bg-[radial-gradient(60%_80%_at_50%_0%,rgba(139,0,18,0.45),transparent_70%),radial-gradient(40%_60%_at_0%_100%,rgba(14,52,99,0.4),transparent_70%),radial-gradient(40%_60%_at_100%_100%,rgba(137,94,67,0.3),transparent_70%)]"
        />
        <BorderBeam size={260} duration={14} />
        <Logo size={72} className="mx-auto drop-shadow-[0_18px_40px_rgba(139,0,18,0.45)]" />
        <h2 id="cta-title" className="lp-display mt-8 font-bold text-4xl md:text-6xl">
          {m.title}
        </h2>
        <p className="mx-auto mt-5 max-w-md text-pretty text-fd-muted-foreground leading-[1.75]">
          {latest ? m.latest(latest.tag, formatDay(latest.publishedAt, lang)) : m.none}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href={localePath(lang, '/download')} className={button.primary}>
            <ArrowDownToLine className="size-[18px]" aria-hidden="true" />
            {latest ? m.download(latest.tag) : m.downloadPage}
          </Link>
          <a href={github(repos.app)} className={button.glass}>
            <GitHubIcon className="size-[18px]" />
            {m.github}
          </a>
        </div>
      </div>
    </Section>
  );
}
