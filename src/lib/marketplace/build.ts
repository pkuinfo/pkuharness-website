/*
 * Builds the marketplace index: the official registry + every repo in data/sources.json.
 * No Next.js imports (the CLI's `check` reuses it); index.ts adds caching.
 */

import { type FetchOptions, getRaw, getRepo } from './github';
import { OFFICIAL_REPO, pluginSlug, type ScanReport, scanRepo } from './scanner';
import { type RegistryEntry, registry, type SourcesFile } from './schema';
import type { MarketplaceIndex, MarketplacePlugin, MarketplaceSource } from './types';

export const REGISTRY_URL = `https://raw.githubusercontent.com/${OFFICIAL_REPO}/main/registry/registry.json`;

export function officialToPlugin(e: RegistryEntry, stars?: number): MarketplacePlugin {
  const m = e.source.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/[^/]+\/(.+))?$/);
  const repo = m ? `${m[1]}/${m[2]}` : OFFICIAL_REPO;
  return {
    slug: pluginSlug('pkuinfo', 'pku-harness-plugins', e.id),
    id: e.id,
    name: e.name,
    description: e.description,
    author: e.author,
    kind: e.kind,
    source: e.source,
    repo,
    path: m?.[3] ?? '',
    endpoint: e.kind === 'remote' ? (e.endpoint ?? null) : undefined,
    auth: e.auth,
    icon: e.icon,
    requires: e.requires,
    scopes: e.scopes,
    tags: e.tags,
    cloud: e.cloud ? { uses: e.cloud.uses, e2e: e.cloud.e2e, disclosure: e.cloud.disclosure } : undefined,
    verified: e.verified,
    official: true,
    stars,
    manifestPath: 'registry/registry.json',
  };
}

export async function fetchOfficial(
  opts: FetchOptions,
): Promise<{ plugins: MarketplacePlugin[]; error?: string; updatedAt?: string }> {
  try {
    const [text, info] = await Promise.all([
      getRaw('pkuinfo', 'pku-harness-plugins', 'main', 'registry/registry.json', opts, 2 * 1024 * 1024),
      getRepo('pkuinfo', 'pku-harness-plugins', opts).catch(() => null),
    ]);
    if (!text) return { plugins: [], error: 'registry.json not found' };
    // Parse entry by entry so one bad entry doesn't hide the rest.
    const raw = JSON.parse(text) as { version?: unknown; updatedAt?: unknown; plugins?: unknown[] };
    const head = registry.pick({ version: true, updatedAt: true }).safeParse(raw);
    if (!head.success) return { plugins: [], error: 'registry.json has an unknown format' };
    const plugins: MarketplacePlugin[] = [];
    for (const p of raw.plugins ?? []) {
      const r = registry.shape.plugins.element.safeParse(p);
      if (r.success) plugins.push(officialToPlugin(r.data, info?.stars));
    }
    return { plugins, updatedAt: head.data.updatedAt };
  } catch (e) {
    return { plugins: [], error: e instanceof Error ? e.message : String(e) };
  }
}

/** Copy a PLUGIN.md's declarations onto an official registry entry (registry keeps kind/verified). */
export function mergeDeclarations(entry: MarketplacePlugin, doc: MarketplacePlugin) {
  const keys = [
    'format',
    'handle',
    'campus',
    'network',
    'abilities',
    'tools',
    'widgets',
    'screens',
    'commands',
    'defaultModes',
    'installUrl',
    'deepLink',
    'instructions',
    'manifestSource',
    'version',
    'nameEn',
    'descriptionEn',
  ] as const;
  for (const k of keys) if (doc[k] !== undefined) Object.assign(entry, { [k]: doc[k] });
  entry.requires = [...new Set([...entry.requires, ...doc.requires])];
  entry.scopes = [...new Set([...entry.scopes, ...doc.scopes])];
  entry.manifestPath = doc.manifestPath;
}

export interface BuildResult {
  index: MarketplaceIndex;
  reports: { repo: string; report: ScanReport }[];
}

/**
 * Community ids must be unique across the marketplace (the app installs `mcp-<id>`): the repo
 * added first keeps an id; later duplicates are dropped and reported on their source.
 */
export async function buildIndex(
  sources: SourcesFile,
  opts: FetchOptions & { concurrency?: number; scanOfficial?: boolean } = {},
): Promise<BuildResult> {
  const official = await fetchOfficial(opts);
  const officialIds = new Set(official.plugins.map((p) => p.id));
  // Official plugins that moved to PLUGIN.md: merge their declarations (install link, tools,
  // campus services…) into the registry entries, and list PLUGIN.md-only ones as official.
  const officialScan =
    opts.scanOfficial === false || sources.sources.some((s) => s.repo.toLowerCase() === OFFICIAL_REPO)
      ? null
      : scanRepo(OFFICIAL_REPO, { ...opts, officialIds });
  const ordered = [...sources.sources].sort(
    (a, b) => a.addedAt.localeCompare(b.addedAt) || a.repo.localeCompare(b.repo),
  );

  const reports: { repo: string; report: ScanReport }[] = new Array(ordered.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(opts.concurrency ?? 4, ordered.length) }, async () => {
      while (next < ordered.length) {
        const i = next++;
        const s = ordered[i];
        const report = await scanRepo(s.path ? `${s.repo}/${s.path}` : s.repo, {
          ...opts,
          officialIds,
          verified: s.verified,
          addedAt: s.addedAt,
        });
        reports[i] = { repo: s.repo, report };
      }
    }),
  );

  for (const sp of (await officialScan)?.plugins ?? []) {
    if (!sp.plugin || sp.from !== 'plugin-md') continue;
    const entry = official.plugins.find((p) => p.id === sp.plugin?.id);
    if (entry) mergeDeclarations(entry, sp.plugin);
    else if (sp.status === 'ok') official.plugins.push(sp.plugin);
  }

  const taken = new Map<string, string>();
  const community: MarketplacePlugin[] = [];
  const out: MarketplaceSource[] = [];
  for (const [i, s] of ordered.entries()) {
    const { report } = reports[i];
    const errors: string[] = [];
    if (report.error) errors.push(report.error.message);
    let count = 0;
    for (const sp of report.plugins) {
      if (sp.status === 'error')
        errors.push(`${sp.manifestPath}: ${sp.issues.find((x) => x.level === 'error')?.message ?? 'invalid'}`);
      if (sp.status !== 'ok' || !sp.plugin) continue;
      const prev = taken.get(sp.plugin.id);
      if (prev) {
        errors.push(`${sp.manifestPath}: id "${sp.plugin.id}" is already used by ${prev}`);
        continue;
      }
      taken.set(sp.plugin.id, sp.plugin.slug);
      community.push(sp.plugin);
      count++;
    }
    out.push({
      repo: report.repo?.fullName ?? s.repo,
      addedAt: s.addedAt,
      plugins: count,
      error: errors.length ? errors.join('\n') : undefined,
      stars: report.repo?.stars,
      branch: report.repo?.branch,
      description: report.repo?.description,
    });
  }

  const index: MarketplaceIndex = {
    version: 1,
    generatedAt: new Date().toISOString(),
    plugins: [...official.plugins, ...community],
    sources: [
      {
        repo: OFFICIAL_REPO,
        addedAt: official.updatedAt ?? '',
        plugins: official.plugins.length,
        error: official.error,
        stars: official.plugins[0]?.stars,
        branch: 'main',
      },
      ...out,
    ],
  };
  return { index, reports };
}
