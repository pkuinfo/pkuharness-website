import { FolderOpen, RefreshCw, Star, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/cn';
import { type Lang, localePath } from '@/lib/i18n';
import type { MarketplacePlugin, MarketplaceSource } from '@/lib/marketplace/types';
import { t } from '@/lib/messages';
import { GitHubIcon } from './badges';
import { PluginCard } from './plugin-card';

/** /marketplace/<owner> and /marketplace/<owner>/<repo>: every plugin found there. */
export function RepoPage({
  owner,
  repo,
  plugins,
  source,
  lang,
}: {
  owner: string;
  repo?: string;
  plugins: MarketplacePlugin[];
  source?: MarketplaceSource;
  lang: Lang;
}) {
  const m = t(lang).marketplace;
  const r = m.repo;
  const name = source?.repo ?? (repo ? `${owner}/${repo}` : owner);
  const repos = [...new Set(plugins.map((p) => p.repo))];
  const crumbs: [string, string | null][] = [
    [m.root, localePath(lang, '/marketplace')],
    ...(repo
      ? ([
          [owner, localePath(lang, `/marketplace/${owner}`)],
          [repo, null],
        ] as [string, string | null][])
      : ([[owner, null]] as [string, string | null][])),
  ];
  const btn =
    'inline-flex h-9 items-center gap-1.5 rounded-lg border border-fd-border px-3 text-sm transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-ring';
  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-10 pb-24 md:px-8">
      <nav aria-label={m.breadcrumb}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fd-muted-foreground">
          {crumbs.map(([label, href], i) => (
            <li key={label + String(i)} className="inline-flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="opacity-40">
                  /
                </span>
              )}
              {href ? (
                <Link href={href} className={cn('hover:text-fd-foreground', i > 0 && 'font-mono text-xs')}>
                  {label}
                </Link>
              ) : (
                <span aria-current="page" className="font-mono text-xs text-fd-foreground">
                  {label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="mt-8 flex flex-col gap-6 border-b border-fd-border pb-8 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-fd-muted-foreground">{repo ? r.repository : r.publisher}</p>
          <h1 className="mt-1 flex items-center gap-3 font-mono text-2xl font-semibold tracking-tight break-all md:text-3xl">
            <GitHubIcon className="size-6 shrink-0 text-fd-muted-foreground" />
            {name}
          </h1>
          {source?.description && <p className="mt-3 max-w-2xl text-fd-muted-foreground">{source.description}</p>}
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fd-muted-foreground tabular-nums">
            <span>{r.plugins(plugins.length)}</span>
            {!repo && <span>{r.repos(repos.length)}</span>}
            {source?.stars !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5" aria-hidden="true" />
                {source.stars}
                <span className="sr-only">{m.stars}</span>
              </span>
            )}
            {source?.branch && <span>{r.branch(source.branch)}</span>}
            {source?.addedAt && source.repo !== 'pkuinfo/pku-harness-plugins' && <span>{r.added(source.addedAt)}</span>}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a href={`https://github.com/${name}`} target="_blank" rel="noreferrer" className={btn}>
            <GitHubIcon className="size-3.5" />
            GitHub
          </a>
          {repo && (
            <Link href={`${localePath(lang, '/marketplace/submit')}?repo=${encodeURIComponent(name)}`} className={btn}>
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {r.rescan}
            </Link>
          )}
        </div>
      </header>

      {source?.error && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-pku-amber/30 bg-pku-amber/5 p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-pku-gold dark:text-pku-amber" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-medium">{r.lastError}</p>
            <pre className="mt-2 font-mono text-xs leading-5 whitespace-pre-wrap text-fd-muted-foreground">
              {source.error}
            </pre>
          </div>
        </div>
      )}

      {plugins.length ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plugins.map((p) => (
            <li key={p.slug}>
              <PluginCard plugin={p} lang={lang} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState className="mt-10" icon={<FolderOpen />} title={r.empty} />
      )}
    </div>
  );
}
