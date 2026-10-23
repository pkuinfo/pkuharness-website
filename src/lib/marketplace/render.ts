/* Markdown renderings: scan reports (CLI, issue comments) and the agent-facing llms.txt. */

import { appServerName, CAPABILITY, visibleTags } from './labels';
import type { ScanIssue, ScanReport } from './scanner';
import type { MarketplaceIndex } from './types';

const ICON: Record<ScanIssue['level'], string> = { error: '❌', warning: '⚠️', info: 'ℹ️' };
/** Escape text from untrusted manifests before it goes into markdown (issue comments). */
const md = (s: string) => s.replace(/[\\`*_[\]<>|@]/g, (c) => `\\${c}`).replace(/\r?\n/g, ' ');

function issueLine(i: ScanIssue) {
  return `- ${ICON[i.level]} ${md(i.message)}${i.hint ? ` — _${md(i.hint)}_` : ''}`;
}

export function reportMarkdown(r: ScanReport, siteUrl?: string): string {
  const out: string[] = [];
  if (r.error) {
    out.push(`### ❌ Scan failed`, '', md(r.error.message));
    return out.join('\n');
  }
  const repo = r.repo;
  const ok = r.plugins.filter((p) => p.status === 'ok');
  out.push(
    `### ${r.ok ? '✅' : '❌'} ${repo ? `[${repo.fullName}](${repo.url})` : md(r.input)}`,
    '',
    `Branch \`${repo?.branch}\`${repo?.path ? `, folder \`${md(repo.path)}\`` : ''} · ${r.stats.files} files · ${r.stats.candidates} candidate(s) · **${ok.length} plugin(s) listable**`,
    '',
  );
  if (r.notes.length) out.push(...r.notes.map(issueLine), '');
  const shown = r.plugins.filter((p) => p.status !== 'skipped');
  const skipped = r.plugins.filter((p) => p.status === 'skipped');
  if (shown.length) {
    out.push('| Plugin | Manifest | Status |', '|---|---|---|');
    for (const p of shown) {
      const status = { ok: '✅ ok', error: '❌ error', skipped: '— skipped', official: '↩︎ in official registry' }[
        p.status
      ];
      const name = p.plugin
        ? siteUrl
          ? `[\`${p.plugin.slug}\`](${siteUrl}/marketplace/${p.plugin.slug})`
          : `\`${p.plugin.slug}\``
        : `\`${md(p.id ?? '?')}\``;
      out.push(`| ${name} | \`${md(p.manifestPath)}\` | ${status} |`);
    }
    out.push('');
    for (const p of shown) {
      const issues = p.issues.filter((i) => i.level !== 'info' || p.status === 'error');
      if (!issues.length || p.status === 'official') continue;
      out.push(
        `<details${p.status === 'error' ? ' open' : ''}><summary><code>${md(p.manifestPath)}</code></summary>`,
        '',
        ...issues.map(issueLine),
        '',
        '</details>',
        '',
      );
    }
  }
  if (skipped.length)
    out.push(
      `<details><summary>${skipped.length} file(s) skipped</summary>`,
      '',
      ...skipped.map((p) => `- \`${md(p.manifestPath)}\`: ${md(p.issues[0]?.message ?? 'not a manifest')}`),
      '',
      '</details>',
      '',
    );
  return out.join('\n');
}

export function marketplaceLlms(index: MarketplaceIndex, siteUrl: string): string {
  const lines = [
    '# PKU Harness plugin marketplace',
    '',
    '> Plugins for PKU Harness, the AI-native campus app for Peking University. Built-in plugins ship in the app;',
    '> remote plugins are MCP servers (Streamable HTTP) that users add by URL. Handles are `owner/repo/id`.',
    '',
    `- JSON index: ${siteUrl}/marketplace.json`,
    `- Manifest spec: ${siteUrl}/docs/marketplace/manifest`,
    `- Manifest JSON Schema: ${siteUrl}/schema/plugin-manifest.v1.json`,
    `- Submit a repo: ${siteUrl}/marketplace/submit`,
    '',
    'Declarative plugins are folders with a PLUGIN.md; install one by pasting its install link in the app (设置 → 插件) or opening `pkuharness://plugin?src=<url-encoded link>`.',
    'Remote MCP plugins: 设置 → 插件 → 插件市场, or paste the endpoint URL; they install as `mcp-<id>`.',
    '',
  ];
  const groups: [string, typeof index.plugins][] = [
    ['Official', index.plugins.filter((p) => p.official)],
    ['Community', index.plugins.filter((p) => !p.official)],
  ];
  for (const [title, plugins] of groups) {
    lines.push(`## ${title} (${plugins.length})`, '');
    if (!plugins.length) lines.push('_None yet._', '');
    for (const p of plugins) {
      const caps = p.requires.map((c) => CAPABILITY[c]?.en ?? c).join(', ');
      const meta = [
        p.kind,
        p.verified ? 'verified' : 'unverified',
        p.kind === 'remote' ? (p.endpoint ? `endpoint ${p.endpoint}` : 'self-hosted') : null,
        p.installUrl && p.kind !== 'builtin' ? `install link ${p.installUrl}` : null,
        p.campus?.length ? `campus services ${p.campus.join(', ')}` : null,
        p.tools?.length
          ? `tools ${p.tools.map((t) => `${p.id}.${t.name}${t.effect ? ` (${t.effect})` : ''}`).join(', ')}`
          : null,
        caps ? `requires ${caps}` : null,
        p.cloud?.uses.length ? `cloud: ${p.cloud.uses.join(', ')}` : null,
        visibleTags(p).length ? `tags ${visibleTags(p).join(', ')}` : null,
      ].filter(Boolean);
      lines.push(
        `- [${p.name}${p.nameEn ? ` / ${p.nameEn}` : ''}](${siteUrl}/marketplace/${p.slug}) \`${p.slug}\`: ${p.descriptionEn ?? p.description} (${meta.join('; ')}${p.kind === 'remote' ? `; installs as ${appServerName(p)}` : ''})`,
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}
