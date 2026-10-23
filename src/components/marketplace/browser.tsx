'use client';

import { ArrowRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ALL_CAPABILITIES, CAMPUS_SERVICE, CAPABILITY, visibleTags } from '@/lib/marketplace/labels';
import type { Capability, MarketplacePlugin } from '@/lib/marketplace/types';
import { PluginCard } from './plugin-card';

type Tab = 'all' | 'official' | 'community';
type Sort = 'official' | 'stars' | 'newest' | 'name';
type Kind = 'any' | 'builtin' | 'remote' | 'declarative';

const TABS: { id: Tab; zh: string; en: string }[] = [
  { id: 'all', zh: '全部', en: 'All' },
  { id: 'official', zh: '官方', en: 'Official' },
  { id: 'community', zh: '社区', en: 'Community' },
];
const SORTS: { id: Sort; label: string }[] = [
  { id: 'official', label: '官方优先' },
  { id: 'stars', label: 'Stars' },
  { id: 'newest', label: '最新收录' },
  { id: 'name', label: '名称' },
];
const ease = [0.23, 1, 0.32, 1] as const;

function matches(p: MarketplacePlugin, q: string) {
  if (!q) return true;
  const hay = [
    p.name,
    p.nameEn,
    p.description,
    p.descriptionEn,
    p.id,
    p.slug,
    p.handle,
    p.author,
    ...p.tags,
    ...p.scopes,
    ...(p.campus ?? []),
    ...(p.tools ?? []).map((t) => t.title ?? t.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w));
}

function compare(sort: Sort) {
  const byName = (a: MarketplacePlugin, b: MarketplacePlugin) => a.name.localeCompare(b.name, 'zh-CN');
  return (a: MarketplacePlugin, b: MarketplacePlugin) => {
    switch (sort) {
      case 'stars':
        return (b.stars ?? -1) - (a.stars ?? -1) || byName(a, b);
      case 'newest':
        return (b.addedAt ?? '').localeCompare(a.addedAt ?? '') || byName(a, b);
      case 'name':
        return byName(a, b);
      default:
        return (
          Number(b.official) - Number(a.official) ||
          Number(b.verified) - Number(a.verified) ||
          (b.stars ?? 0) - (a.stars ?? 0)
        );
    }
  };
}

function readUrl() {
  const sp = new URLSearchParams(window.location.search);
  const tab = sp.get('tab');
  const sort = sp.get('sort');
  const kind = sp.get('kind');
  return {
    q: sp.get('q') ?? '',
    tab: (TABS.some((t) => t.id === tab) ? tab : 'all') as Tab,
    sort: (SORTS.some((s) => s.id === sort) ? sort : 'official') as Sort,
    kind: (kind === 'builtin' || kind === 'remote' || kind === 'declarative' ? kind : 'any') as Kind,
    campus: sp.get('campus'),
    caps: (sp.get('requires')?.split(',') ?? []).filter((c): c is Capability => c in CAPABILITY),
    tag: sp.get('tag'),
  };
}

export function MarketplaceBrowser({ plugins }: { plugins: MarketplacePlugin[] }) {
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('official');
  const [kind, setKind] = useState<Kind>('any');
  const [caps, setCaps] = useState<Capability[]>([]);
  const [tag, setTag] = useState<string | null>(null);
  const [campus, setCampus] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const q = useDeferredValue(query.trim());
  const input = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = readUrl();
    setQuery(s.q);
    setTab(s.tab);
    setSort(s.sort);
    setKind(s.kind);
    setCaps(s.caps);
    setTag(s.tag);
    setCampus(s.campus);
    if (s.caps.length || s.tag || s.campus || s.kind !== 'any') setFiltersOpen(true);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (tab !== 'all') sp.set('tab', tab);
    if (sort !== 'official') sp.set('sort', sort);
    if (kind !== 'any') sp.set('kind', kind);
    if (caps.length) sp.set('requires', caps.join(','));
    if (tag) sp.set('tag', tag);
    if (campus) sp.set('campus', campus);
    const s = sp.toString();
    window.history.replaceState(null, '', s ? `?${s}` : window.location.pathname);
  }, [ready, q, tab, sort, kind, caps, tag, campus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const counts = useMemo(
    () => ({
      all: plugins.length,
      official: plugins.filter((p) => p.official).length,
      community: plugins.filter((p) => !p.official).length,
    }),
    [plugins],
  );
  const tags = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of plugins) for (const t of visibleTags(p)) m.set(t, (m.get(t) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [plugins]);
  const campusServices = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of plugins) for (const c of p.campus ?? []) m.set(c, (m.get(c) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [plugins]);
  const usedCaps = useMemo(
    () => ALL_CAPABILITIES.filter((c) => plugins.some((p) => p.requires.includes(c))),
    [plugins],
  );

  const shown = useMemo(
    () =>
      plugins
        .filter((p) => (tab === 'all' ? true : tab === 'official' ? p.official : !p.official))
        .filter((p) => kind === 'any' || p.kind === kind)
        .filter((p) => caps.every((c) => p.requires.includes(c)))
        .filter((p) => !tag || p.tags.includes(tag))
        .filter((p) => !campus || (p.campus ?? []).includes(campus))
        .filter((p) => matches(p, q))
        .sort(compare(sort)),
    [plugins, tab, kind, caps, tag, campus, q, sort],
  );

  const activeFilters = caps.length + (tag ? 1 : 0) + (campus ? 1 : 0) + (kind !== 'any' ? 1 : 0);
  const clearAll = () => {
    setQuery('');
    setCaps([]);
    setTag(null);
    setCampus(null);
    setKind('any');
  };
  const toggleCap = (c: Capability) => setCaps((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease }}>
      <div className="z-10 -mx-4 md:sticky md:top-14 border-b border-fd-border/70 bg-fd-background/80 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div
            role="tablist"
            aria-label="Plugin source"
            className="flex shrink-0 rounded-lg border border-fd-border bg-fd-card p-0.5"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative flex-1 rounded-md px-3 py-1.5 text-sm transition-colors md:flex-none',
                  tab === t.id ? 'text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="mk-tab"
                    className="absolute inset-0 rounded-md bg-fd-secondary ring-1 ring-fd-border"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                  />
                )}
                <span className="relative inline-flex items-center gap-1.5">
                  {t.zh}
                  <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">{counts[t.id]}</span>
                </span>
              </button>
            ))}
          </div>

          <label className="group relative flex min-w-0 flex-1 items-center">
            <span className="sr-only">Search plugins</span>
            <Search className="pointer-events-none absolute left-3 size-4 text-fd-muted-foreground transition-colors group-focus-within:text-fd-primary" />
            <input
              ref={input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
              placeholder="搜索插件、作者、标签…"
              className="h-9 w-full rounded-lg border border-fd-border bg-fd-card pr-16 pl-9 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-fd-muted-foreground/70 focus:border-fd-primary/50 focus:ring-3 focus:ring-fd-primary/15"
              type="search"
              spellCheck={false}
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 rounded p-1 text-fd-muted-foreground hover:text-fd-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2.5 hidden rounded border border-fd-border px-1.5 font-mono text-[11px] text-fd-muted-foreground sm:block">
                /
              </kbd>
            )}
          </label>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors',
                filtersOpen || activeFilters
                  ? 'border-fd-primary/40 text-fd-foreground'
                  : 'border-fd-border text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              筛选
              {activeFilters > 0 && (
                <span className="rounded bg-fd-primary px-1 font-mono text-[10px] text-fd-primary-foreground">
                  {activeFilters}
                </span>
              )}
            </button>
            <label className="relative">
              <span className="sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-9 appearance-none rounded-lg border border-fd-border bg-fd-card pr-7 pl-3 text-sm text-fd-foreground outline-none focus:border-fd-primary/50"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[10px] text-fd-muted-foreground">
                ▾
              </span>
            </label>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2.5 pt-3 text-sm">
                <FacetRow label="类型">
                  {(['any', 'declarative', 'builtin', 'remote'] as Kind[]).map((k) => (
                    <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
                      {{ any: '不限', declarative: '声明式', builtin: '内置', remote: '远程 MCP' }[k]}
                    </Chip>
                  ))}
                </FacetRow>
                <FacetRow label="需要">
                  {usedCaps.map((c) => (
                    <Chip key={c} active={caps.includes(c)} onClick={() => toggleCap(c)} title={CAPABILITY[c].explain}>
                      {CAPABILITY[c].zh}
                      <span className="font-mono text-[10px] opacity-60">{c}</span>
                    </Chip>
                  ))}
                </FacetRow>
                {campusServices.length > 0 && (
                  <FacetRow label="校园">
                    {campusServices.map(([c, n]) => (
                      <Chip key={c} active={campus === c} onClick={() => setCampus(campus === c ? null : c)}>
                        {CAMPUS_SERVICE[c]?.zh ?? c}
                        <span className="font-mono text-[10px] opacity-60">{n}</span>
                      </Chip>
                    ))}
                  </FacetRow>
                )}
                <FacetRow label="标签">
                  {tags.map(([t, n]) => (
                    <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                      #{t}
                      <span className="font-mono text-[10px] opacity-60">{n}</span>
                    </Chip>
                  ))}
                </FacetRow>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between py-4 font-mono text-xs text-fd-muted-foreground">
        <span aria-live="polite">
          {shown.length} / {counts[tab]} plugins
        </span>
        {(activeFilters > 0 || q) && (
          <button type="button" onClick={clearAll} className="hover:text-fd-foreground">
            清除筛选 ×
          </button>
        )}
      </div>

      {shown.length > 0 ? (
        <motion.ul layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p, i) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.4, ease, delay: Math.min(i, 12) * 0.02 },
                }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
              >
                <PluginCard plugin={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : tab === 'community' && counts.community === 0 ? (
        <EmptyCommunity />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-fd-border px-6 py-16 text-center"
        >
          <p className="font-mono text-sm text-fd-muted-foreground">
            <span className="text-fd-primary">$</span> grep &quot;{q || '…'}&quot; → 0 results
          </p>
          <p className="text-fd-foreground">没有匹配的插件</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg border border-fd-border px-3 py-1.5 text-sm hover:bg-fd-accent"
            >
              清除筛选
            </button>
            <Link
              href="/marketplace/submit"
              className="rounded-lg bg-fd-primary px-3 py-1.5 text-sm text-fd-primary-foreground"
            >
              自己写一个
            </Link>
          </div>
        </motion.div>
      )}
    </MotionConfig>
  );
}

function FacetRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 shrink-0 pt-1 text-xs text-fd-muted-foreground">{label}</span>
      <div className="-mx-1 flex min-w-0 flex-1 flex-wrap gap-1.5 px-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors',
        active
          ? 'border-fd-primary/50 bg-fd-primary/10 text-fd-foreground'
          : 'border-fd-border text-fd-muted-foreground hover:border-fd-foreground/20 hover:text-fd-foreground',
      )}
    >
      {children}
    </button>
  );
}

function EmptyCommunity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-fd-border bg-fd-card px-6 py-14 text-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--color-brand-bright)_16%,transparent),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-md">
        <p className="font-mono text-xs tracking-wider text-fd-primary">COMMUNITY · 0 PLUGINS</p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight">第一个社区插件，可以是你的</h3>
        <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
          在 GitHub 仓库里建一个文件夹，放一个 <code className="font-mono text-fd-foreground">PLUGIN.md</code>
          ，提交仓库地址即可上架。不用写代码、不用部署服务器，之后每次 push 都会自动更新。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/marketplace/submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-transform active:scale-[0.98]"
          >
            提交插件 <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/docs/marketplace/publishing"
            className="rounded-lg border border-fd-border px-4 py-2 text-sm hover:bg-fd-accent"
          >
            发布指南
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
