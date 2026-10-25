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
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.035em] text-balance md:text-8xl">
            {m.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--color-lp-ink-2)] md:text-xl">{m.lede}</p>
          <p className="mt-3 text-sm text-fd-muted-foreground tabular-nums">
            <span className="me-2 inline-block size-1.5 translate-y-[-2px] rounded-full bg-up" aria-hidden="true" />
            {m.stats(stats.plugins, stats.repos, date)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link href={localePath(lang, '/marketplace/submit')} className="group lp-pill lp-pill-primary">
            {m.publish}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link href={localePath(lang, '/docs/marketplace')} className="lp-pill lp-pill-secondary">
            <BookOpen className="size-3.5" aria-hidden="true" />
            {m.rules}
          </Link>
        </div>
      </div>
    </header>
  );
}
