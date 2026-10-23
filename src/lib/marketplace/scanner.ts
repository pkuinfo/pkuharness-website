/*
 * Repo scanner: finds plugin manifests in a GitHub repo and validates them, skills.sh-style
 * (one repo, many plugins, handle = owner/repo/id). Pure logic is exported separately from the
 * I/O so tests can run on fixtures. No Next.js imports: the CLI and CI use this file.
 */

import { endpointIssues, folderUrl, HOST, isOfficialRepo, pluginSlug, type ScanIssue, zodIssues } from './common';
import {
  type FetchOptions,
  GitHubError,
  getRaw,
  getRepo,
  getTree,
  parseRepoInput,
  type RepoInfo,
  type RepoRef,
  refCandidates,
  type TreeEntry,
} from './github';
import { namedToolFiles, parsePluginMd, validatePluginMd } from './lang';
import { PLUGIN_MD } from './lang-schema';
import {
  cloudIssues,
  MANIFEST_FILE,
  MANIFEST_KEYS,
  type ManifestV1,
  manifestV1,
  PACKAGE_KEY,
  REPO_CONFIG_FILE,
  repoConfig,
} from './schema';
import type { MarketplacePlugin } from './types';

export const LIMITS = {
  maxPlugins: 100,
  maxPackageJson: 300,
  concurrency: 8,
  maxToolFiles: 40,
  maxToolFilesTotal: 400,
} as const;

export type { IssueLevel, ScanIssue } from './common';
export { folderUrl, isOfficialRepo, OFFICIAL_REPO, pluginSlug } from './common';

export type ScannedStatus = 'ok' | 'error' | 'skipped' | 'official';

export interface ScannedPlugin {
  /** Folder of the plugin, relative to the repo root ('' = root). */
  dir: string;
  manifestPath: string;
  from: CandidateFrom;
  status: ScannedStatus;
  id?: string;
  plugin?: MarketplacePlugin;
  /** The manifest as read (after package.json merge), for display. */
  manifest?: unknown;
  issues: ScanIssue[];
}

export interface ScanReport {
  input: string;
  ok: boolean;
  error?: { code: string; message: string };
  repo?: {
    fullName: string;
    branch: string;
    path: string;
    stars: number;
    description: string | null;
    archived: boolean;
    url: string;
  };
  plugins: ScannedPlugin[];
  notes: ScanIssue[];
  stats: { files: number; candidates: number; fetched: number };
  scannedAt: string;
}

export interface ScanOptions extends FetchOptions {
  /** Ids in the official registry (the app installs plugins by id, so they're reserved). */
  officialIds?: Set<string>;
  /** Ids already used by other community repos: id → slug. */
  takenIds?: Map<string, string>;
  /** Plugin ids a maintainer verified (data/sources.json). */
  verified?: string[];
  addedAt?: string;
  maxPlugins?: number;
  maxPackageJson?: number;
}

/* ------------------------------------------------------------------------------------------ */
/* Discovery                                                                                   */
/* ------------------------------------------------------------------------------------------ */

/** Where a plugin was found: PLUGIN.md (primary), pku-harness.plugin.json, or package.json. */
export type CandidateFrom = 'plugin-md' | 'manifest' | 'package.json';

export interface Candidate {
  dir: string;
  file: string;
  from: CandidateFrom;
}

const dirOf = (p: string) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');
const baseOf = (p: string) => p.slice(p.lastIndexOf('/') + 1);

export function isIgnoredPath(path: string): boolean {
  return path.split('/').some((seg, i, all) => i < all.length - 1 && (seg === 'node_modules' || seg.startsWith('.')));
}

export function normalizeDir(d: string): string {
  return d
    .trim()
    .replace(/^\.\/+/, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/^\.$/, '');
}

const within = (dir: string, root: string) => !root || dir === root || dir.startsWith(`${root}/`);

/**
 * Pick candidate files from a repo tree. With a `pku-harness.json` config, only (and in the order
 * of) its folders; otherwise every `PLUGIN.md`, every `pku-harness.plugin.json` and every
 * `package.json` (which still has to contain a `pkuHarness` object with an `id`). One plugin per
 * folder: PLUGIN.md beats pku-harness.plugin.json beats package.json.
 */
export function findCandidates(
  entries: TreeEntry[],
  opts: { root?: string; config?: { plugins: string[] }; maxPackageJson?: number } = {},
): { candidates: Candidate[]; notes: ScanIssue[] } {
  const root = normalizeDir(opts.root ?? '');
  const notes: ScanIssue[] = [];
  const blobs = new Set(entries.filter((e) => e.type === 'blob').map((e) => e.path));
  const pick = (dir: string): Candidate | null => {
    const prefix = dir ? `${dir}/` : '';
    if (blobs.has(`${prefix}${PLUGIN_MD}`)) return { dir, file: `${prefix}${PLUGIN_MD}`, from: 'plugin-md' };
    if (blobs.has(`${prefix}${MANIFEST_FILE}`)) return { dir, file: `${prefix}${MANIFEST_FILE}`, from: 'manifest' };
    if (blobs.has(`${prefix}package.json`)) return { dir, file: `${prefix}package.json`, from: 'package.json' };
    return null;
  };

  if (opts.config) {
    const seen = new Set<string>();
    const candidates: Candidate[] = [];
    for (const raw of opts.config.plugins) {
      const dir = normalizeDir(raw);
      if (raw.includes('..') || raw.startsWith('/')) {
        notes.push({
          level: 'error',
          message: `${REPO_CONFIG_FILE}: "${raw}" must be a relative folder inside the repo.`,
        });
        continue;
      }
      if (seen.has(dir)) {
        notes.push({ level: 'warning', message: `${REPO_CONFIG_FILE}: "${raw}" is listed twice.` });
        continue;
      }
      seen.add(dir);
      if (!within(dir, root)) continue;
      const c = pick(dir);
      if (c) candidates.push(c);
      else
        notes.push({
          level: 'error',
          message: `${REPO_CONFIG_FILE} lists "${dir || '.'}", but that folder has no ${PLUGIN_MD}, ${MANIFEST_FILE} or package.json.`,
          hint: `Add ${dir ? `${dir}/` : ''}${PLUGIN_MD}, or remove the folder from ${REPO_CONFIG_FILE}.`,
        });
    }
    return { candidates, notes };
  }

  const pluginMdDirs = new Set<string>();
  const manifestDirs = new Set<string>();
  const pluginMds: Candidate[] = [];
  const manifests: Candidate[] = [];
  const packages: Candidate[] = [];
  for (const path of [...blobs].sort()) {
    if (isIgnoredPath(path)) continue;
    const dir = dirOf(path);
    if (!within(dir, root)) continue;
    const base = baseOf(path);
    if (base === PLUGIN_MD) {
      pluginMdDirs.add(dir);
      pluginMds.push({ dir, file: path, from: 'plugin-md' });
    } else if (base === MANIFEST_FILE) {
      manifestDirs.add(dir);
      manifests.push({ dir, file: path, from: 'manifest' });
    } else if (base === 'package.json') packages.push({ dir, file: path, from: 'package.json' });
  }
  const jsonManifests = manifests.filter((m) => !pluginMdDirs.has(m.dir));
  let pkgs = packages.filter((p) => !manifestDirs.has(p.dir) && !pluginMdDirs.has(p.dir));
  const maxPkg = opts.maxPackageJson ?? LIMITS.maxPackageJson;
  if (pkgs.length > maxPkg) {
    notes.push({
      level: 'warning',
      message: `Found ${pkgs.length} package.json files; only the first ${maxPkg} were checked for "${PACKAGE_KEY}".`,
      hint: `Add a ${REPO_CONFIG_FILE} at the repo root listing your plugin folders, or use ${MANIFEST_FILE} files.`,
    });
    pkgs = pkgs.slice(0, maxPkg);
  }
  const candidates = [...pluginMds, ...jsonManifests, ...pkgs].sort((a, b) => a.dir.localeCompare(b.dir));
  return { candidates, notes };
}

/* ------------------------------------------------------------------------------------------ */
/* Validation                                                                                  */
/* ------------------------------------------------------------------------------------------ */

const FIELD_HINTS: Record<string, string> = {
  id: 'Use 2-41 lowercase letters, digits or dashes, e.g. "canteen-menu". It is also your MCP server name.',
  name: 'A short display name, Chinese first, e.g. "食堂菜单".',
  description: 'One sentence (4-200 characters) saying what the plugin does for students.',
  endpoint: 'The public https URL of your MCP server, e.g. "https://canteen.example.com/mcp", or null to self-host.',
  requires:
    'Allowed: network, campus-network, campus-session, notifications, background, shell, filesystem, cloud, ongoing.',
  kind: 'Community plugins are "remote" (the default).',
  auth: '"none" or "bearer".',
  homepage: 'A full https:// URL.',
};

export interface ValidateContext {
  owner: string;
  repo: string;
  branch: string;
  dir: string;
  manifestPath: string;
  from: 'manifest' | 'package.json';
  officialIds?: Set<string>;
  takenIds?: Map<string, string>;
  verified?: string[];
  repoInfo?: Pick<RepoInfo, 'stars' | 'pushedAt'>;
  addedAt?: string;
}

/** Turn file text into the manifest object (package.json: merge package fields under `pkuHarness`). */
export function extractManifest(
  text: string,
  from: 'manifest' | 'package.json',
): { manifest?: Record<string, unknown>; issues: ScanIssue[]; skip?: boolean } {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    return {
      issues: [
        {
          level: 'error',
          message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
          hint: 'Run the file through a JSON validator; trailing commas and comments are not allowed.',
        },
      ],
    };
  }
  if (!json || typeof json !== 'object' || Array.isArray(json))
    return { issues: [{ level: 'error', message: 'The manifest must be a JSON object.' }] };
  const obj = json as Record<string, unknown>;
  if (from === 'manifest') return { manifest: obj, issues: [] };

  const ph = obj[PACKAGE_KEY];
  if (ph === undefined) return { issues: [], skip: true };
  if (!ph || typeof ph !== 'object' || Array.isArray(ph))
    return {
      issues: [{ level: 'warning', message: `"${PACKAGE_KEY}" in package.json must be an object; ignored.` }],
      skip: true,
    };
  const inner = ph as Record<string, unknown>;
  if (!('id' in inner))
    return {
      issues: [
        {
          level: 'info',
          message: `package.json has "${PACKAGE_KEY}" without an "id": treated as SDK metadata, not a marketplace listing.`,
          hint: `Add "id", "name" and "description" to "${PACKAGE_KEY}" to list it.`,
        },
      ],
      skip: true,
    };
  const { builtin: _builtin, ...rest } = inner;
  const merged: Record<string, unknown> = {};
  if (typeof obj.description === 'string') merged.description = obj.description;
  if (typeof obj.version === 'string') merged.version = obj.version;
  if (typeof obj.license === 'string') merged.license = obj.license;
  if (typeof obj.homepage === 'string') merged.homepage = obj.homepage;
  return { manifest: { ...merged, ...rest }, issues: [] };
}

/** Validate one manifest object and build the marketplace entry. */
export function validateManifest(
  raw: Record<string, unknown>,
  ctx: ValidateContext,
): { plugin?: MarketplacePlugin; manifest?: ManifestV1; issues: ScanIssue[]; status: ScannedStatus } {
  const issues: ScanIssue[] = [];
  for (const key of Object.keys(raw))
    if (!MANIFEST_KEYS.has(key))
      issues.push({
        level: 'warning',
        field: key,
        message: `Unknown field "${key}" is ignored.`,
        hint: 'Check the spelling against the manifest reference.',
      });

  const parsed = manifestV1.safeParse(raw);
  if (!parsed.success) return { issues: [...issues, ...zodIssues(parsed.error, FIELD_HINTS)], status: 'error' };
  const m = parsed.data;
  const official = isOfficialRepo(ctx.owner, ctx.repo);

  if (official && ctx.officialIds?.has(m.id)) {
    issues.push({ level: 'info', message: `"${m.id}" is in the official registry; it is listed from there.` });
    return { manifest: m, issues, status: 'official' };
  }
  if (ctx.officialIds?.has(m.id))
    issues.push({
      level: 'error',
      field: 'id',
      message: `id "${m.id}" belongs to an official plugin. The app installs plugins by id, so it must be unique.`,
      hint: 'Pick another id (and rename your MCP server to match).',
    });
  const taken = ctx.takenIds?.get(m.id);
  if (taken && taken !== pluginSlug(ctx.owner, ctx.repo, m.id))
    issues.push({
      level: 'error',
      field: 'id',
      message: `id "${m.id}" is already used by ${taken}. The app installs plugins by id, so it must be unique.`,
      hint: 'Pick another id, e.g. prefix it with your project name.',
    });

  if (m.kind === 'builtin' && !official)
    issues.push({
      level: 'error',
      field: 'kind',
      message: 'Only plugins bundled in the app (pkuinfo/pku-harness-plugins) can be "builtin".',
      hint: 'Use "kind": "remote" and serve your plugin as an MCP server.',
    });

  if (m.kind === 'remote') {
    if (!m.endpoint)
      issues.push({
        level: 'info',
        field: 'endpoint',
        message: 'No public endpoint: listed as self-hosted (users deploy it from source and paste their own URL).',
        hint: 'Add "endpoint" once you run a public instance.',
      });
    else issues.push(...endpointIssues(m.endpoint, 'endpoint', FIELD_HINTS.endpoint));
  } else if (m.endpoint)
    issues.push({ level: 'warning', field: 'endpoint', message: 'Builtin plugins have no endpoint; ignored.' });

  for (const cap of ['shell', 'filesystem'] as const)
    if (m.requires.includes(cap))
      issues.push({
        level: 'warning',
        field: 'requires',
        message: `requires "${cap}": phones have no ${cap}, so the app hides this plugin on them.`,
        hint: 'Remote plugins run on your server; only declare what the phone must provide.',
      });
  if (m.requires.includes('campus-session') && m.kind === 'remote')
    issues.push({
      level: 'warning',
      field: 'requires',
      message:
        'requires "campus-session": remote plugins never receive campus credentials or cookies; scoped session grants are not available yet.',
      hint: 'Never ask users for their campus password. Use public data, or wait for scoped session grants.',
    });
  if (new Set(m.requires).size !== m.requires.length)
    issues.push({ level: 'warning', field: 'requires', message: 'requires has duplicates.' });

  if (m.cloud) {
    for (const msg of cloudIssues(m.cloud)) issues.push({ level: 'error', field: 'cloud', message: msg });
    if (m.cloud.uses.length > 0 && !m.requires.includes('cloud'))
      issues.push({
        level: 'warning',
        field: 'requires',
        message: 'cloud.uses is set, so requires should include "cloud".',
      });
  } else if (m.requires.includes('cloud'))
    issues.push({
      level: 'warning',
      field: 'cloud',
      message: 'requires "cloud" but there is no "cloud" block: users cannot see what leaves the device.',
      hint: 'Copy PluginDef.cloud: { "uses": [...], "e2e": true, "disclosure": { "zh": [...] } }.',
    });

  const badScopes = m.scopes.filter((s) => !HOST.test(s));
  if (badScopes.length)
    issues.push({
      level: 'warning',
      field: 'scopes',
      message: `scopes should be host names; not understood: ${badScopes.map((s) => `"${s}"`).join(', ')}.`,
      hint: 'Write bare hosts like "dining.pku.edu.cn" (no scheme or path); "*.example.com" is allowed.',
    });
  if (
    m.kind === 'remote' &&
    m.scopes.length === 0 &&
    (m.requires.includes('network') || m.requires.includes('campus-network'))
  )
    issues.push({
      level: 'warning',
      field: 'scopes',
      message: 'requires network but lists no scopes.',
      hint: 'List the hosts your server talks to, so students know where their requests go.',
    });

  if (m.icon && /^[a-z]+:/i.test(m.icon) && !m.icon.startsWith('https://'))
    issues.push({ level: 'warning', field: 'icon', message: 'icon URLs must be https.' });
  if (m.homepage && !m.homepage.startsWith('https://'))
    issues.push({ level: 'warning', field: 'homepage', message: 'homepage should be https.' });
  if (!m.i18n?.en?.name || !m.i18n.en.description)
    issues.push({
      level: 'info',
      field: 'i18n',
      message: 'No English name/description.',
      hint: 'Add "i18n": { "en": { "name": "…", "description": "…" } } for English-speaking users.',
    });
  if (!m.license)
    issues.push({
      level: 'info',
      field: 'license',
      message: 'No license declared.',
      hint: 'Add an SPDX id, e.g. "MIT".',
    });

  const hasError = issues.some((i) => i.level === 'error');
  const plugin: MarketplacePlugin = {
    slug: pluginSlug(ctx.owner, ctx.repo, m.id),
    id: m.id,
    name: m.name,
    nameEn: m.i18n?.en?.name,
    description: m.description,
    descriptionEn: m.i18n?.en?.description,
    author: m.author ?? ctx.owner,
    kind: m.kind,
    source: folderUrl(ctx.owner, ctx.repo, ctx.branch, ctx.dir),
    repo: `${ctx.owner}/${ctx.repo}`,
    path: ctx.dir,
    endpoint: m.kind === 'remote' ? (m.endpoint ?? null) : undefined,
    auth: m.auth,
    icon: m.icon,
    requires: [...new Set(m.requires)],
    scopes: m.scopes,
    tags: [...new Set(m.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))],
    cloud: m.cloud ? { uses: m.cloud.uses, e2e: m.cloud.e2e, disclosure: m.cloud.disclosure } : undefined,
    verified: ctx.verified?.includes(m.id) ?? false,
    official,
    version: m.version,
    license: m.license,
    homepage: m.homepage,
    stars: ctx.repoInfo?.stars,
    updatedAt: ctx.repoInfo?.pushedAt ?? undefined,
    addedAt: ctx.addedAt,
    manifestPath: ctx.manifestPath,
    warnings: issues.filter((i) => i.level === 'warning').map((i) => i.message),
    format: 'json',
  };
  return { plugin: hasError ? undefined : plugin, manifest: m, issues, status: hasError ? 'error' : 'ok' };
}

/* ------------------------------------------------------------------------------------------ */
/* I/O                                                                                         */
/* ------------------------------------------------------------------------------------------ */

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

function reportOk(r: Omit<ScanReport, 'ok'>): boolean {
  return (
    !r.error &&
    !r.notes.some((n) => n.level === 'error') &&
    r.plugins.some((p) => p.status === 'ok') &&
    !r.plugins.some((p) => p.status === 'error')
  );
}

/** Scan a GitHub repo (owner/repo or URL) for plugins. Never throws; failures are in `error`. */
export async function scanRepo(input: string, opts: ScanOptions = {}): Promise<ScanReport> {
  const scannedAt = new Date().toISOString();
  const base = {
    input,
    plugins: [] as ScannedPlugin[],
    notes: [] as ScanIssue[],
    stats: { files: 0, candidates: 0, fetched: 0 },
    scannedAt,
  };
  let ref: RepoRef;
  try {
    ref = parseRepoInput(input);
  } catch (e) {
    const err = e instanceof GitHubError ? e : new GitHubError('invalid-input', String(e));
    return { ...base, ok: false, error: { code: err.code, message: err.message } };
  }

  try {
    const info = await getRepo(ref.owner, ref.repo, opts);
    const { owner, repo } = info;
    let branch = info.defaultBranch;
    let root = ref.path;
    let tree: Awaited<ReturnType<typeof getTree>> = null;
    if (ref.ref) {
      for (const c of refCandidates(ref.ref)) {
        tree = await getTree(owner, repo, c.ref, opts);
        if (tree) {
          branch = c.ref;
          root = c.path;
          break;
        }
      }
      if (!tree) throw new GitHubError('not-found', `Branch or tag in "${ref.ref}" was not found in ${owner}/${repo}.`);
    } else tree = await getTree(owner, repo, branch, opts);
    if (!tree) throw new GitHubError('not-found', `Could not list ${owner}/${repo}@${branch}.`);
    root = normalizeDir(root);

    const notes: ScanIssue[] = [];
    if (info.archived)
      notes.push({ level: 'warning', message: 'This repository is archived; listings should be maintained.' });
    if (tree.truncated)
      notes.push({
        level: 'warning',
        message: 'The repository is too large for GitHub to list in one call; some plugins may be missing.',
        hint: `Add a ${REPO_CONFIG_FILE} at the repo root listing your plugin folders.`,
      });
    if (root && !tree.entries.some((e) => e.type === 'tree' && e.path === root))
      throw new GitHubError('not-found', `Folder "${root}" does not exist on ${branch}.`);

    let config: { plugins: string[] } | undefined;
    if (tree.entries.some((e) => e.type === 'blob' && e.path === REPO_CONFIG_FILE)) {
      const text = await getRaw(owner, repo, branch, REPO_CONFIG_FILE, opts);
      try {
        const parsed = repoConfig.safeParse(JSON.parse(text ?? ''));
        if (parsed.success) {
          config = parsed.data;
          notes.push({
            level: 'info',
            message: `Using ${REPO_CONFIG_FILE}: ${config.plugins.length} folder(s) listed.`,
          });
        } else
          notes.push({
            level: 'error',
            message: `${REPO_CONFIG_FILE} is invalid: ${parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'} ${i.message}`).join('; ')}`,
            hint: 'Expected { "plugins": ["path/to/plugin", ...] }.',
          });
      } catch {
        notes.push({ level: 'error', message: `${REPO_CONFIG_FILE} is not valid JSON.` });
      }
    }

    const found = findCandidates(tree.entries, { root, config, maxPackageJson: opts.maxPackageJson });
    notes.push(...found.notes);
    const fetchedAll = await mapLimit(found.candidates, LIMITS.concurrency, async (c) => {
      try {
        return { c, text: await getRaw(owner, repo, branch, c.file, opts), err: undefined as string | undefined };
      } catch (e) {
        return { c, text: null, err: e instanceof Error ? e.message : String(e) };
      }
    });

    // PLUGIN.md: fetch the tool files it names (to read their effects), then validate.
    const files = new Map(tree.entries.filter((e) => e.type === 'blob').map((e) => [e.path, e.size] as const));
    const toolPaths = new Set<string>();
    for (const { c, text } of fetchedAll) {
      if (c.from !== 'plugin-md' || !text) continue;
      const raw = parsePluginMd(text).raw;
      if (raw)
        for (const p of namedToolFiles(raw, c.dir).slice(0, LIMITS.maxToolFiles))
          if (files.has(p) && toolPaths.size < LIMITS.maxToolFilesTotal) toolPaths.add(p);
    }
    const toolFiles: Record<string, string | null> = {};
    await mapLimit([...toolPaths], LIMITS.concurrency, async (p) => {
      toolFiles[p] = await getRaw(owner, repo, branch, p, opts).catch(() => null);
    });

    const plugins: ScannedPlugin[] = [];
    const seen = new Map<string, string>();
    const maxPlugins = opts.maxPlugins ?? LIMITS.maxPlugins;
    let listed = 0;
    for (const { c, text, err } of fetchedAll) {
      if (err || text === null) {
        if (c.from !== 'package.json' || err)
          plugins.push({
            dir: c.dir,
            manifestPath: c.file,
            from: c.from,
            status: 'error',
            issues: [{ level: 'error', message: err ?? `Could not download ${c.file}.` }],
          });
        continue;
      }
      if (c.from === 'plugin-md') {
        if (listed >= maxPlugins) {
          notes.push({ level: 'error', message: `More than ${maxPlugins} plugins found; the rest were not scanned.` });
          break;
        }
        const v = validatePluginMd(text, {
          owner,
          repo,
          branch,
          dir: c.dir,
          manifestPath: c.file,
          files,
          toolFiles,
          officialIds: opts.officialIds,
          takenIds: opts.takenIds,
          verified: opts.verified,
          repoInfo: info,
          addedAt: opts.addedAt,
        });
        const entry: ScannedPlugin = {
          dir: c.dir,
          manifestPath: c.file,
          from: c.from,
          status: v.status,
          id: v.id,
          plugin: v.plugin,
          manifest: v.raw,
          issues: v.issues,
        };
        if (v.status !== 'official') listed++;
        if (entry.id && v.status !== 'official') {
          const prev = seen.get(entry.id);
          if (prev) {
            entry.status = 'error';
            entry.plugin = undefined;
            entry.issues.unshift({
              level: 'error',
              field: 'id',
              message: `Duplicate id "${entry.id}" (also in ${prev}).`,
              hint: 'Every plugin in a repo needs its own id.',
            });
          } else seen.set(entry.id, c.file);
        }
        plugins.push(entry);
        continue;
      }
      const ex = extractManifest(text, c.from);
      if (ex.skip) {
        if (ex.issues.length)
          plugins.push({ dir: c.dir, manifestPath: c.file, from: c.from, status: 'skipped', issues: ex.issues });
        continue;
      }
      if (!ex.manifest) {
        plugins.push({ dir: c.dir, manifestPath: c.file, from: c.from, status: 'error', issues: ex.issues });
        continue;
      }
      if (listed >= maxPlugins) {
        notes.push({
          level: 'error',
          message: `More than ${maxPlugins} plugins found; the rest were not scanned.`,
          hint: 'Split the repo, or contact the maintainers.',
        });
        break;
      }
      const v = validateManifest(ex.manifest, {
        owner,
        repo,
        branch,
        dir: c.dir,
        manifestPath: c.file,
        from: c.from,
        officialIds: opts.officialIds,
        takenIds: opts.takenIds,
        verified: opts.verified,
        repoInfo: info,
        addedAt: opts.addedAt,
      });
      const entry: ScannedPlugin = {
        dir: c.dir,
        manifestPath: c.file,
        from: c.from,
        status: v.status,
        id: v.manifest?.id ?? (typeof ex.manifest.id === 'string' ? ex.manifest.id : undefined),
        plugin: v.plugin,
        manifest: ex.manifest,
        issues: v.issues,
      };
      if (v.status === 'ok' || v.status === 'error') listed++;
      if (entry.id && v.status !== 'official') {
        const prev = seen.get(entry.id);
        if (prev) {
          entry.status = 'error';
          entry.plugin = undefined;
          entry.issues.unshift({
            level: 'error',
            field: 'id',
            message: `Duplicate id "${entry.id}" (also in ${prev}).`,
            hint: 'Every plugin in a repo needs its own id.',
          });
        } else seen.set(entry.id, c.file);
      }
      plugins.push(entry);
    }

    if (found.candidates.length === 0 || !plugins.some((p) => p.status === 'ok' || p.status === 'error'))
      notes.push({
        level: 'error',
        message: plugins.some((p) => p.status === 'official')
          ? 'Every plugin found here is already listed from the official registry.'
          : `No plugin manifests found${root ? ` under ${root}` : ''}.`,
        hint: `Add a ${PLUGIN_MD} to each plugin folder (remote MCP servers: ${MANIFEST_FILE}, until remote.mcp in PLUGIN.md replaces it).`,
      });

    const r = {
      ...base,
      repo: {
        fullName: info.fullName,
        branch,
        path: root,
        stars: info.stars,
        description: info.description,
        archived: info.archived,
        url: folderUrl(owner, repo, branch, root),
      },
      plugins,
      notes,
      stats: {
        files: tree.entries.length,
        candidates: found.candidates.length,
        fetched: fetchedAll.filter((f) => f.text !== null).length,
      },
    };
    return { ...r, ok: reportOk(r) };
  } catch (e) {
    const err = e instanceof GitHubError ? e : new GitHubError('upstream', e instanceof Error ? e.message : String(e));
    return { ...base, ok: false, error: { code: err.code, message: err.message } };
  }
}
