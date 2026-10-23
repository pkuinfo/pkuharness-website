import { RefreshCw, Star, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import type { MarketplacePlugin, MarketplaceSource } from '@/lib/marketplace/types';
import { GitHubIcon } from './badges';
import { PluginCard } from './plugin-card';

/** /marketplace/<owner> and /marketplace/<owner>/<repo>: every plugin found there. */
export function RepoPage({
  owner,
  repo,
  plugins,
  source,
}: {
  owner: string;
  repo?: string;
  plugins: MarketplacePlugin[];
  source?: MarketplaceSource;
}) {
  const name = source?.repo ?? (repo ? `${owner}/${repo}` : owner);
  const ghUrl = `https://github.com/${name}`;
  const repos = [...new Set(plugins.map((p) => p.repo))];
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-24 md:px-6">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-fd-muted-foreground"
      >
        <Link href="/marketplace" className="hover:text-fd-foreground">
          marketplace
        </Link>
        <span className="opacity-50">/</span>
        {repo ? (
          <>
            <Link href={`/marketplace/${owner}`} className="hover:text-fd-foreground">
              {owner}
            </Link>
            <span className="opacity-50">/</span>
            <span className="text-fd-foreground">{repo}</span>
          </>
        ) : (
          <span className="text-fd-foreground">{owner}</span>
        )}
      </nav>

      <header className="mt-8 flex flex-col gap-6 border-b border-fd-border pb-8 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-wider text-fd-muted-foreground">
            {repo ? 'REPOSITORY' : 'PUBLISHER'}
          </p>
          <h1 className="mt-2 flex items-center gap-3 font-mono text-2xl font-semibold tracking-tight break-all md:text-3xl">
            <GitHubIcon className="size-6 shrink-0 text-fd-muted-foreground" />
            {name}
          </h1>
          {source?.description && <p className="mt-3 max-w-2xl text-fd-muted-foreground">{source.description}</p>}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-fd-muted-foreground">
            <span>
              <span className="text-fd-foreground">{plugins.length}</span> plugin{plugins.length === 1 ? '' : 's'}
            </span>
            {!repo && (
              <span>
                <span className="text-fd-foreground">{repos.length}</span> repos
              </span>
            )}
            {source?.stars !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3" />
                <span className="text-fd-foreground">{source.stars}</span>
              </span>
            )}
            {source?.branch && <span>branch {source.branch}</span>}
            {source?.addedAt && source.repo !== 'pkuinfo/pku-harness-plugins' && <span>added {source.addedAt}</span>}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <a
            href={ghUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-3 py-2 text-sm transition-colors hover:bg-fd-accent"
          >
            <GitHubIcon className="size-3.5" /> GitHub
          </a>
          {repo && (
            <Link
              href={`/marketplace/submit?repo=${encodeURIComponent(name)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-3 py-2 text-sm transition-colors hover:bg-fd-accent"
            >
              <RefreshCw className="size-3.5" /> 重新检查
            </Link>
          )}
        </div>
      </header>

      {source?.error && (
        <div className="mt-6 flex gap-3 rounded-xl border border-pku-amber/30 bg-pku-amber/5 p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-pku-amber" />
          <div className="min-w-0">
            <p className="font-medium">上次扫描有问题，部分插件没有上架</p>
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
              <PluginCard plugin={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-xl border border-dashed border-fd-border px-6 py-14 text-center text-fd-muted-foreground">
          这个仓库目前没有可上架的插件。
        </p>
      )}
    </div>
  );
}
