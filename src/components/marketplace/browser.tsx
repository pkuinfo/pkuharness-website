'use client';

import { ArrowRight, ChevronDown, PackageSearch, Search, SlidersHorizontal, Sprout, X } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Link from 'next/link';
import { type ReactNode, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { HoverTabs } from '@/components/ui/hover-tabs';
import { cn } from '@/lib/cn';
import { htmlLang, type Lang, localePath } from '@/lib/i18n';
import { ALL_CAPABILITIES, CAMPUS_SERVICE, CAPABILITY, capabilityExplain, visibleTags } from '@/lib/marketplace/labels';
import type { Capability, MarketplacePlugin } from '@/lib/marketplace/types';
import { t } from '@/lib/messages';
import { PluginCard } from './plugin-card';
import { Rich } from './rich';

type Tab = 'all' | 'official' | 'community';
type Sort = 'official' | 'stars' | 'newest' | 'name';
type Kind = 'any' | 'builtin' | 'remote' | 'declarative';

const TABS: Tab[] = ['all', 'official', 'community'];
const SORTS: Sort[] = ['official', 'stars', 'newest', 'name'];
const KINDS: Kind[] = ['any', 'declarative', 'builtin', 'remote'];
const ease = [0.23, 1, 0.32, 1] as const;

function haystack(p: MarketplacePlugin) {
  return [
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
    ...(p.campus ?? []).flatMap((c) => [c, CAMPUS_SERVICE[c]?.zh, CAMPUS_SERVICE[c]?.en]),
    ...(p.tools ?? []).flatMap((tool) => [tool.title ?? tool.name, tool.titleEn ?? '', tool.summary ?? '']),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function compare(sort: Sort, lang: Lang) {
  const byName = (a: MarketplacePlugin, b: MarketplacePlugin) =>
    (lang === 'en' ? (a.nameEn ?? a.id) : a.name).localeCompare(
      lang === 'en' ? (b.nameEn ?? b.id) : b.name,
      htmlLang[lang],
    );
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
  const tab = sp.get('tab') as Tab | null;
  const sort = sp.get('sort') as Sort | null;
  const kind = sp.get('kind') as Kind | null;
  return {
    q: sp.get('q') ?? '',
    tab: tab && TABS.includes(tab) ? tab : 'all',
    sort: sort && SORTS.includes(sort) ? sort : 'official',
    kind: kind && KINDS.includes(kind) ? kind : 'any',
    campus: sp.get('campus'),
    caps: (sp.get('requires')?.split(',') ?? []).filter((c): c is Capability => c in CAPABILITY),
    tag: sp.get('tag'),
  } as const;
}

function countBy(values: string[]) {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function MarketplaceBrowser({ plugins, lang }: { plugins: MarketplacePlugin[]; lang: Lang }) {
  const m = t(lang).marketplace.browse;
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('official');
  const [kind, setKind] = useState<Kind>('any');
  const [caps, setCaps] = useState<Capability[]>([]);
  const [tag, setTag] = useState<string | null>(null);
  const [campus, setCampus] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const q = useDeferredValue(query.trim().toLowerCase());
  const input = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = readUrl();
    setQuery(s.q);
    setTab(s.tab);
    setSort(s.sort);
    setKind(s.kind);
    setCaps(s.caps);
    // Drop filters the index can't satisfy any more (old links), so no invisible filter hides everything.
    const tag = s.tag && plugins.some((p) => p.tags.includes(s.tag as string)) ? s.tag : null;
    const campus = s.campus && plugins.some((p) => p.campus?.includes(s.campus as string)) ? s.campus : null;
    setTag(tag);
    setCampus(campus);
    if (s.caps.length || tag || campus || s.kind !== 'any') setFiltersOpen(true);
    setReady(true);
  }, [plugins]);

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
      const el = e.target as HTMLElement;
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !el.isContentEditable) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const index = useMemo(() => new Map(plugins.map((p) => [p.slug, haystack(p)])), [plugins]);
  const counts = useMemo(
    () => ({
      all: plugins.length,
      official: plugins.filter((p) => p.official).length,
      community: plugins.filter((p) => !p.official).length,
    }),
    [plugins],
  );
  const tags = useMemo(() => countBy(plugins.flatMap((p) => visibleTags(p))), [plugins]);
  const campusServices = useMemo(() => countBy(plugins.flatMap((p) => p.campus ?? [])), [plugins]);
  const usedCaps = useMemo(
    () => ALL_CAPABILITIES.filter((c) => plugins.some((p) => p.requires.includes(c))),
    [plugins],
  );
  const usedKinds = useMemo(() => KINDS.filter((k) => k === 'any' || plugins.some((p) => p.kind === k)), [plugins]);

  const shown = useMemo(() => {
    const words = q.split(/\s+/).filter(Boolean);
    return plugins
      .filter((p) => (tab === 'all' ? true : tab === 'official' ? p.official : !p.official))
      .filter((p) => kind === 'any' || p.kind === kind)
      .filter((p) => caps.every((c) => p.requires.includes(c)))
      .filter((p) => !tag || p.tags.includes(tag))
      .filter((p) => !campus || (p.campus ?? []).includes(campus))
      .filter((p) => words.every((w) => index.get(p.slug)?.includes(w)))
      .sort(compare(sort, lang));
  }, [plugins, index, tab, kind, caps, tag, campus, q, sort, lang]);

  const activeFilters = caps.length + (tag ? 1 : 0) + (campus ? 1 : 0) + (kind !== 'any' ? 1 : 0);
  const clearAll = () => {
    setQuery('');
    setCaps([]);
    setTag(null);
    setCampus(null);
    setKind('any');
  };
  const toggleCap = (c: Capability) => setCaps((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const facets = (
    <div className="space-y-7 rounded-2xl border border-fd-border p-4 lg:rounded-none lg:border-0 lg:p-0">
      {campusServices.length > 0 && (
        <Facet title={m.facets.campus}>
          <FacetItem active={campus === null} onClick={() => setCampus(null)}>
            {m.any}
          </FacetItem>
          {campusServices.map(([c, n]) => (
            <FacetItem key={c} active={campus === c} onClick={() => setCampus(campus === c ? null : c)} count={n}>
              {CAMPUS_SERVICE[c]?.[lang] ?? c}
            </FacetItem>
          ))}
        </Facet>
      )}
      {usedCaps.length > 0 && (
        <Facet title={m.facets.needs}>
          {usedCaps.map((c) => (
            <FacetItem
              key={c}
              active={caps.includes(c)}
              onClick={() => toggleCap(c)}
              title={capabilityExplain(c, lang)}
              check
            >
              {CAPABILITY[c][lang]}
            </FacetItem>
          ))}
        </Facet>
      )}
      {usedKinds.length > 2 && (
        <Facet title={m.facets.kind}>
          {usedKinds.map((k) => (
            <FacetItem key={k} active={kind === k} onClick={() => setKind(k)}>
              {k === 'any' ? m.any : m.kinds[k]}
            </FacetItem>
          ))}
        </Facet>
      )}
      {tags.length > 0 && (
        <Facet title={m.facets.tags} wrap>
          {tags.map(([tg, n]) => (
            <button
              key={tg}
              type="button"
              aria-pressed={tag === tg}
              onClick={() => setTag(tag === tg ? null : tg)}
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-fd-ring',
                tag === tg
                  ? 'border-fd-primary/50 bg-fd-primary/10 text-fd-foreground'
                  : 'border-fd-border text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              #{tg}
              <span className="opacity-60">{n}</span>
            </button>
          ))}
        </Facet>
      )}
    </div>
  );

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease }}>
      <label className="group relative mt-8 flex items-center">
        <span className="sr-only">{m.searchLabel}</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 size-[18px] text-fd-muted-foreground transition-colors group-focus-within:text-fd-primary"
        />
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
          placeholder={m.searchPlaceholder}
          className="h-12 w-full rounded-xl border border-fd-border bg-fd-card pr-14 pl-11 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-fd-muted-foreground focus:border-fd-primary/60 focus:ring-4 focus:ring-fd-primary/15 [&::-webkit-search-cancel-button]:hidden"
          type="search"
          spellCheck={false}
          autoComplete="off"
          aria-controls="mk-results"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              input.current?.focus();
            }}
            className="absolute right-2.5 inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-fd-ring"
            aria-label={m.clearSearch}
          >
            <X className="size-4" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-3.5 hidden h-6 min-w-6 items-center justify-center rounded-md border border-fd-border px-1.5 font-mono text-xs text-fd-muted-foreground sm:inline-flex">
            /
          </kbd>
        )}
      </label>

      <div className="mt-8 lg:grid lg:grid-cols-[208px_minmax(0,1fr)] lg:gap-10">
        <aside aria-label={m.filters} className="hidden lg:block">
          <div className="lg:sticky lg:top-20">{facets}</div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-fd-border">
            <HoverTabs
              label={m.sourceLabel}
              controls="mk-results"
              value={tab}
              onValueChange={setTab}
              tabs={TABS.map((id) => ({ id, label: m.tabs[id], count: counts[id] }))}
              className="-mb-px"
            />
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                aria-expanded={filtersOpen}
                aria-controls="mk-filters"
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-fd-ring lg:hidden',
                  activeFilters
                    ? 'border-fd-primary/40 text-fd-foreground'
                    : 'border-fd-border text-fd-muted-foreground',
                )}
              >
                <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                {filtersOpen ? m.hideFilters : m.filters}
                {activeFilters > 0 && (
                  <span className="rounded bg-fd-primary px-1 text-[11px] font-medium text-fd-primary-foreground tabular-nums">
                    {activeFilters}
                  </span>
                )}
              </button>
              <label className="relative">
                <span className="sr-only">{m.sortLabel}</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="h-9 appearance-none rounded-lg border border-fd-border bg-fd-card pr-8 pl-3 text-sm text-fd-foreground outline-none focus-visible:border-fd-primary/60 focus-visible:ring-3 focus-visible:ring-fd-primary/15"
                >
                  {SORTS.map((s) => (
                    <option key={s} value={s}>
                      {m.sorts[s]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-fd-muted-foreground"
                />
              </label>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                id="mk-filters"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden lg:hidden"
              >
                <div className="pt-4">{facets}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex min-h-12 items-center justify-between gap-3 text-sm text-fd-muted-foreground">
            <span aria-live="polite" className="tabular-nums">
              {m.results(shown.length, counts[tab])}
            </span>
            {(activeFilters > 0 || q) && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-fd-ring"
              >
                <X className="size-3.5" aria-hidden="true" />
                {m.clear}
              </button>
            )}
          </div>

          <div id="mk-results" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            {shown.length > 0 ? (
              <motion.ul layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {shown.map((p) => (
                    <motion.li
                      key={p.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
                    >
                      <PluginCard plugin={p} lang={lang} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            ) : tab === 'community' && counts.community === 0 ? (
              <EmptyState
                icon={<Sprout />}
                title={m.noCommunity.title}
                actions={
                  <>
                    <Link
                      href={localePath(lang, '/marketplace/submit')}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground transition-transform active:scale-[0.98]"
                    >
                      {m.noCommunity.submit}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      href={localePath(lang, '/docs/marketplace/publishing')}
                      className="inline-flex h-9 items-center rounded-lg border border-fd-border px-4 text-sm hover:bg-fd-accent"
                    >
                      {m.noCommunity.guide}
                    </Link>
                  </>
                }
              >
                <Rich text={m.noCommunity.body} />
              </EmptyState>
            ) : (
              <EmptyState
                icon={<PackageSearch />}
                title={m.noMatch.title}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex h-9 items-center rounded-lg border border-fd-border px-4 text-sm hover:bg-fd-accent"
                    >
                      {m.clear}
                    </button>
                    <Link
                      href={localePath(lang, '/marketplace/submit')}
                      className="inline-flex h-9 items-center rounded-lg bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground"
                    >
                      {m.noMatch.write}
                    </Link>
                  </>
                }
              >
                {m.noMatch.body}
              </EmptyState>
            )}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

function Facet({ title, children, wrap }: { title: string; children: ReactNode; wrap?: boolean }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-fd-muted-foreground">{title}</legend>
      <div className={wrap ? 'flex flex-wrap gap-1.5' : 'flex flex-col gap-0.5'}>{children}</div>
    </fieldset>
  );
}

function FacetItem({
  active,
  onClick,
  children,
  count,
  title,
  check,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
  title?: string;
  check?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        'group/facet flex h-8 items-center gap-2 rounded-md px-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-fd-ring',
        active
          ? 'bg-fd-primary/10 text-fd-foreground'
          : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-3.5 shrink-0 items-center justify-center border transition-colors',
          check ? 'rounded-[4px]' : 'rounded-full',
          active ? 'border-fd-primary bg-fd-primary' : 'border-fd-muted-foreground/50',
        )}
      >
        {active && (
          <span
            className={cn('bg-fd-primary-foreground', check ? 'size-1.5 rounded-[1px]' : 'size-1.5 rounded-full')}
          />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count !== undefined && <span className="text-xs tabular-nums opacity-70">{count}</span>}
    </button>
  );
}
