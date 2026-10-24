import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';

/** Browse page header: what the marketplace is, how big it is, and the two ways out. */
export function MarketplaceHero({
  lang,
  stats,
}: {
  lang: Lang;
  stats: { plugins: number; repos: number; generatedAt: string };
}) {
  const m = t(lang).marketplace.browse;
  const date = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', {
    month: lang === 'zh' ? 'long' : 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  }).format(new Date(stats.generatedAt));
  return (
    <header className="relative pt-14 md:pt-20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl">{m.title}</h1>
          <p className="mt-4 text-[15px] leading-7 text-fd-muted-foreground md:text-base md:leading-7">{m.lede}</p>
          <p className="mt-3 text-sm text-fd-muted-foreground tabular-nums">
            <span className="me-2 inline-block size-1.5 translate-y-[-2px] rounded-full bg-up" aria-hidden="true" />
            {m.stats(stats.plugins, stats.repos, date)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={localePath(lang, '/marketplace/submit')}
            className="group inline-flex h-10 items-center gap-1.5 rounded-lg bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring active:scale-[0.98]"
          >
            {m.publish}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            href={localePath(lang, '/docs/marketplace')}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-fd-border px-4 text-sm transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
          >
            <BookOpen className="size-3.5" aria-hidden="true" />
            {m.rules}
          </Link>
        </div>
      </div>
    </header>
  );
}
