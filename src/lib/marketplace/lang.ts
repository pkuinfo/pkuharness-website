/*
 * PLUGIN.md support: split and parse the frontmatter, validate it against the plugin language
 * (spec v1), check the files it names against the repo tree, and map it to a MarketplacePlugin.
 * Pure: the scanner does the fetching and passes file contents in. No Next.js imports.
 */

import { parse as parseYaml } from 'yaml';
import { endpointIssues, folderUrl, HOST, isOfficialRepo, pluginSlug, type ScanIssue, zodIssues } from './common';
import {
  ABILITIES,
  KNOWN_CAMPUS,
  LANG_KEYS,
  type LangManifest,
  langManifest,
  langTool,
  MAX_PLUGIN_BYTES,
} from './lang-schema';
import { cloudIssues } from './schema';
import type { Capability, MarketplacePlugin, MarketplaceTool } from './types';

export const INSTRUCTIONS_CAP = 20_000;
const INSTRUCTIONS_SOFT = 8_000;
const FRONTMATTER_CAP = 16_000;

const HINTS: Record<string, string> = {
  spec: 'Add "spec: 1" (the plugin language version).',
  id: 'Use 2-41 lowercase letters, digits or dashes, e.g. "canteen-menu". Tool ids become <id>.<tool>.',
  name: 'A short display name, Chinese first, e.g. "食堂菜单".',
  description: 'One sentence (4-200 characters) saying what the plugin does for students.',
  version: 'Semver, quoted if YAML would read it as a number: version: "1.0.0".',
  author: 'Your GitHub handle or name.',
  tools: 'Map tool names to a file ("tools/free.yaml") or an inline tool with title, description and effect.',
  remote: 'remote: { mcp: "https://…/mcp", auth: none }',
};

/** `pkuharness://plugin?src=<link>` (§10). */
export const deepLinkFor = (installUrl: string) => `pkuharness://plugin?src=${encodeURIComponent(installUrl)}`;

/** Split `---\nYAML\n---\nbody`. */
export function splitFrontmatter(text: string): { frontmatter: string; body: string } | null {
  const m = text.match(/^﻿?---[ \t]*\r?\n([\s\S]*?)(?:\r?\n)?---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
  return m ? { frontmatter: m[1], body: m[2] } : null;
}

export function parsePluginMd(text: string): {
  raw?: Record<string, unknown>;
  frontmatter?: string;
  body: string;
  issues: ScanIssue[];
} {
  const split = splitFrontmatter(text);
  if (!split)
    return {
      body: text,
      issues: [
        {
          level: 'error',
          message: 'PLUGIN.md has no YAML frontmatter.',
          hint: 'Start the file with a line "---", the manifest in YAML, then another "---" line.',
        },
      ],
    };
  let raw: unknown;
  try {
    raw = parseYaml(split.frontmatter, { maxAliasCount: 100, prettyErrors: true });
  } catch (e) {
    return {
      frontmatter: split.frontmatter,
      body: split.body,
      issues: [
        {
          level: 'error',
          message: `Invalid YAML frontmatter: ${(e instanceof Error ? e.message : String(e)).split('\n')[0]}`,
          hint: 'Check indentation and quote values containing ":" or "#".',
        },
      ],
    };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    return {
      frontmatter: split.frontmatter,
      body: split.body,
      issues: [{ level: 'error', message: 'The frontmatter must be a YAML mapping (key: value lines).' }],
    };
  return { raw: raw as Record<string, unknown>, frontmatter: split.frontmatter, body: split.body, issues: [] };
}

/** Plugin-relative path → repo path, or an error message. */
export function resolvePluginPath(dir: string, path: string): { path?: string; error?: string } {
  const p = path.trim().replace(/^\.\//, '');
  if (!p || p.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(p) || p.includes('\\'))
    return { error: `"${path}" must be a relative path inside the plugin folder` };
  if (p.split('/').some((s) => s === '..' || s === '.' || s === ''))
    return { error: `"${path}" must not contain "..", "." or empty segments` };
  return { path: dir ? `${dir}/${p}` : p };
}

/** Repo paths of the tool files a manifest names (so the scanner can fetch them first). */
export function namedToolFiles(raw: Record<string, unknown>, dir: string): string[] {
  const tools = raw.tools;
  if (!tools || typeof tools !== 'object') return [];
  const out: string[] = [];
  for (const v of Object.values(tools as Record<string, unknown>))
    if (typeof v === 'string') {
      const r = resolvePluginPath(dir, v);
      if (r.path) out.push(r.path);
    }
  return out;
}

/** Capabilities implied by the declarations (§4: requires is derived; listing it is optional). */
export function deriveCapabilities(m: LangManifest): Capability[] {
  const caps = new Set<Capability>(m.requires);
  if (m.campus.length) {
    caps.add('campus-session');
    caps.add('network');
  }
  if (m.campus.includes('cwfw')) caps.add('campus-network');
  if (m.network.length || m.remote) caps.add('network');
  for (const a of m.abilities) {
    const c = ABILITIES[a]?.capability;
    if (c) caps.add(c);
  }
  if (m.cloud?.uses.length) caps.add('cloud');
  return [...caps];
}

export interface LangContext {
  owner: string;
  repo: string;
  branch: string;
  /** Plugin folder, relative to the repo root ('' = root). */
  dir: string;
  manifestPath: string;
  /** Repo tree blobs: path → size in bytes (undefined when GitHub didn't say). */
  files: Map<string, number | undefined>;
  /** Contents of named tool files, by repo path (null = could not be downloaded). */
  toolFiles?: Record<string, string | null>;
  officialIds?: Set<string>;
  takenIds?: Map<string, string>;
  verified?: string[];
  repoInfo?: { stars: number; pushedAt: string | null };
  addedAt?: string;
}

export function validatePluginMd(
  text: string,
  ctx: LangContext,
): {
  status: 'ok' | 'error' | 'official';
  id?: string;
  raw?: Record<string, unknown>;
  plugin?: MarketplacePlugin;
  issues: ScanIssue[];
} {
  const parsed = parsePluginMd(text);
  if (!parsed.raw) return { status: 'error', issues: parsed.issues };
  const raw = parsed.raw;
  const issues: ScanIssue[] = [];
  const err = (field: string, message: string, hint?: string) => issues.push({ level: 'error', field, message, hint });
  const warn = (field: string, message: string, hint?: string) =>
    issues.push({ level: 'warning', field, message, hint });

  // Strict like the app: unknown top-level keys are errors (zod reports them below).
  for (const key of Object.keys(raw))
    if (!LANG_KEYS.has(key))
      err(
        key,
        `Unknown field "${key}": the app refuses manifests with fields it doesn't know.`,
        'Check the spelling against the plugin language spec §4.',
      );

  const result = langManifest.safeParse(raw);
  const id = typeof raw.id === 'string' ? raw.id : undefined;
  if (!result.success)
    return {
      status: 'error',
      id,
      raw,
      issues: [...issues, ...zodIssues(result.error, HINTS).filter((i) => !/^Unrecognized key/.test(i.message))],
    };
  const m = result.data;
  const official = isOfficialRepo(ctx.owner, ctx.repo);

  // Ids are global: the app registers tools as <id>.<tool>.
  if (!official && ctx.officialIds?.has(m.id))
    err('id', `id "${m.id}" belongs to an official plugin; tool ids (<id>.<tool>) must be unique.`, 'Pick another id.');
  const taken = ctx.takenIds?.get(m.id);
  if (taken && taken !== pluginSlug(ctx.owner, ctx.repo, m.id))
    err(
      'id',
      `id "${m.id}" is already used by ${taken}; tool ids (<id>.<tool>) must be unique.`,
      'Pick another id, e.g. prefix it with your project name.',
    );

  // Files named in the frontmatter: relative, inside the folder, present in the repo, ≤ 512 KB total.
  let bytes = ctx.files.get(ctx.manifestPath) ?? text.length;
  let sizesKnown = true;
  const tools: MarketplaceTool[] = [];
  const checkFile = (field: string, path: string): string | undefined => {
    const r = resolvePluginPath(ctx.dir, path);
    if (!r.path) {
      err(field, `${field}: ${r.error}.`);
      return undefined;
    }
    if (!ctx.files.has(r.path)) {
      err(
        field,
        `${field}: ${path} does not exist in the repository.`,
        `Add ${r.path}, or fix the path (relative to PLUGIN.md).`,
      );
      return undefined;
    }
    const size = ctx.files.get(r.path);
    if (size === undefined) sizesKnown = false;
    else bytes += size;
    return r.path;
  };

  for (const [name, def] of Object.entries(m.tools)) {
    if (typeof def !== 'string') {
      tools.push({ name, title: def.title, effect: def.effect, userOnly: def.userOnly });
      continue;
    }
    const repoPath = checkFile(`tools.${name}`, def);
    const tool: MarketplaceTool = { name, path: def };
    const content = repoPath ? ctx.toolFiles?.[repoPath] : undefined;
    if (repoPath && content === null)
      warn(`tools.${name}`, `tools.${name}: could not download ${def}; its effect is unknown.`);
    if (repoPath && typeof content === 'string') {
      let doc: unknown;
      try {
        doc = parseYaml(content, { maxAliasCount: 100 });
      } catch (e) {
        err(
          `tools.${name}`,
          `tools.${name} (${def}): invalid YAML: ${(e instanceof Error ? e.message : String(e)).split('\n')[0]}`,
        );
      }
      if (doc !== undefined) {
        const t = langTool.safeParse(doc);
        if (t.success) Object.assign(tool, { title: t.data.title, effect: t.data.effect, userOnly: t.data.userOnly });
        else
          for (const i of zodIssues(t.error))
            err(
              `tools.${name}`,
              `tools.${name} (${def}): ${i.message}`,
              'Every tool needs title, description and effect (read, write, money or public).',
            );
      }
    }
    tools.push(tool);
  }
  for (const [name, path] of Object.entries(m.widgets)) checkFile(`widgets.${name}`, path);
  for (const [name, path] of Object.entries(m.screens)) checkFile(`screens.${name}`, path);
  if (bytes > MAX_PLUGIN_BYTES)
    err(
      'files',
      `PLUGIN.md and the files it names total ${Math.round(bytes / 1024)} KB; the limit is ${MAX_PLUGIN_BYTES / 1024} KB.`,
      'Move fixtures and assets out of the named files.',
    );
  else if (!sizesKnown)
    issues.push({ level: 'info', message: 'Some file sizes were unknown; the 512 KB limit was not fully checked.' });

  for (const [name, ds] of Object.entries(m.dataSources))
    if (!(ds.tool in m.tools))
      err(`dataSources.${name}`, `dataSources.${name}: tool "${ds.tool}" is not declared in tools.`);
  for (const s of m.settings)
    if (!(s.screen in m.screens)) err('settings', `settings: screen "${s.screen}" is not declared in screens.`);

  // Declarations shown on the permission sheet.
  for (const h of m.network)
    if (!HOST.test(h))
      err(
        'network',
        `network: "${h}" is not a host name.`,
        'Write bare hosts like "dining.pku.edu.cn" (no scheme or path); "*.example.com" is allowed.',
      );
  const unknownCampus = m.campus.filter((c) => !(KNOWN_CAMPUS as readonly string[]).includes(c));
  if (unknownCampus.length)
    warn(
      'campus',
      `campus: unknown service(s) ${unknownCampus.map((c) => `"${c}"`).join(', ')}; the app refuses services it doesn't know.`,
      `Known: ${KNOWN_CAMPUS.join(', ')}.`,
    );
  const unknownAbilities = m.abilities.filter((a) => !(a in ABILITIES));
  if (unknownAbilities.length)
    err(
      'abilities',
      `abilities: unknown ${unknownAbilities.map((a) => `"${a}"`).join(', ')}; the app refuses abilities it doesn't know.`,
      `Known: ${Object.keys(ABILITIES).join(', ')}.`,
    );
  for (const cap of ['shell', 'filesystem'] as const)
    if (m.requires.includes(cap))
      warn('requires', `requires "${cap}": phones have no ${cap}, so the app hides this plugin on them.`);

  if (m.remote) {
    issues.push(...endpointIssues(m.remote.mcp, 'remote.mcp'));
    if (Object.keys(m.tools).length)
      warn('tools', "A remote plugin uses its MCP server's tools; the tools declared here are ignored.");
    if (m.campus.length)
      warn(
        'campus',
        'campus on a remote plugin: remote MCP servers never receive campus sessions.',
        'Make it a declarative plugin (no remote) to call campus services with scoped sessions.',
      );
  } else if (!Object.keys(m.tools).length && !Object.keys(m.commands).length && !Object.keys(m.widgets).length)
    warn('tools', 'The plugin declares no tools, commands or widgets, so it adds only instructions.');

  if (m.cloud) {
    for (const msg of cloudIssues(m.cloud)) err('cloud', msg);
  } else if (m.requires.includes('cloud'))
    warn('cloud', 'requires "cloud" but there is no "cloud" block: users cannot see what leaves the device.');

  const body = parsed.body.trim();
  if (!body)
    warn('body', 'The Markdown body is empty.', 'Tell the agent when to use which tool and what the numbers mean.');
  else if (body.length > INSTRUCTIONS_SOFT)
    warn(
      'body',
      `The instructions are ${body.length} characters; they are sent with every prompt, so keep them short.`,
    );
  if (!m.i18n?.en?.name || !m.i18n.en.description)
    issues.push({
      level: 'info',
      field: 'i18n',
      message: 'No English name/description.',
      hint: 'Add i18n: { en: { name: …, description: … } }.',
    });

  const hasError = issues.some((i) => i.level === 'error');
  const installUrl = folderUrl(ctx.owner, ctx.repo, ctx.branch, ctx.dir);
  const en = m.i18n?.en;
  const plugin: MarketplacePlugin = {
    slug: pluginSlug(ctx.owner, ctx.repo, m.id),
    id: m.id,
    name: m.name,
    nameEn: typeof en?.name === 'string' ? en.name : undefined,
    description: m.description,
    descriptionEn: typeof en?.description === 'string' ? en.description : undefined,
    author: m.author,
    kind: m.remote ? 'remote' : 'declarative',
    source: installUrl,
    repo: `${ctx.owner}/${ctx.repo}`,
    path: ctx.dir,
    endpoint: m.remote?.mcp,
    auth: m.remote?.auth ?? 'none',
    icon: m.icon,
    requires: deriveCapabilities(m),
    scopes: m.network,
    tags: [],
    cloud: m.cloud ? { uses: m.cloud.uses, e2e: m.cloud.e2e, disclosure: m.cloud.disclosure } : undefined,
    verified: ctx.verified?.includes(m.id) ?? false,
    official,
    version: m.version,
    homepage: m.homepage,
    stars: ctx.repoInfo?.stars,
    updatedAt: ctx.repoInfo?.pushedAt ?? undefined,
    addedAt: ctx.addedAt,
    manifestPath: ctx.manifestPath,
    warnings: issues.filter((i) => i.level === 'warning').map((i) => i.message),
    format: 'plugin-md',
    handle: ctx.dir ? `${ctx.owner}/${ctx.repo}/${ctx.dir}` : `${ctx.owner}/${ctx.repo}`,
    campus: m.campus,
    network: m.network,
    abilities: m.abilities,
    tools,
    widgets: Object.keys(m.widgets),
    screens: Object.keys(m.screens),
    commands: Object.entries(m.commands).map(([name, c]) => ({ name, description: c.description })),
    defaultModes: m.defaultModes,
    installUrl,
    deepLink: deepLinkFor(installUrl),
    instructions: body.length > INSTRUCTIONS_CAP ? `${body.slice(0, INSTRUCTIONS_CAP)}\n\n…` : body,
    manifestSource: (parsed.frontmatter ?? '').slice(0, FRONTMATTER_CAP),
  };
  if (official && ctx.officialIds?.has(m.id)) {
    issues.unshift({
      level: 'info',
      message: `"${m.id}" is in the official registry; its PLUGIN.md details are merged into that listing.`,
    });
    return { status: 'official', id: m.id, raw, plugin: hasError ? undefined : plugin, issues };
  }
  return { status: hasError ? 'error' : 'ok', id: m.id, raw, plugin: hasError ? undefined : plugin, issues };
}
