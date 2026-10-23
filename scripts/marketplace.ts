#!/usr/bin/env bun
/// <reference types="bun" />
/**
 * Marketplace maintenance CLI.
 *
 *   bun scripts/marketplace.ts scan <repo|url> [--json]   scan a repo, print the report (exit 1 on errors)
 *   bun scripts/marketplace.ts add <repo|url> [--report f] scan, then add it to data/sources.json
 *   bun scripts/marketplace.ts issue [--report f]          `add` the repo named in $ISSUE_BODY (CI)
 *   bun scripts/marketplace.ts check                       validate data/sources.json + every source (CI)
 *
 * Set GITHUB_TOKEN for 5000 API requests/hour instead of 60. In GitHub Actions, outputs are
 * written to $GITHUB_OUTPUT. Untrusted input (issue bodies) is only ever parsed, never executed.
 */

import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildIndex } from '../src/lib/marketplace/build';
import { GitHubError, parseRepoInput } from '../src/lib/marketplace/github';
import { reportMarkdown } from '../src/lib/marketplace/render';
import { type ScanReport, scanRepo } from '../src/lib/marketplace/scanner';
import { type SourceEntry, type SourcesFile, sourcesFile } from '../src/lib/marketplace/schema';

const SOURCES = join(import.meta.dir, '..', 'data', 'sources.json');
const SITE = process.env.NEXT_PUBLIC_SITE_URL || undefined;
const token = process.env.GITHUB_TOKEN || undefined;

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const has = (name: string) => {
  const i = args.indexOf(`--${name}`);
  if (i >= 0) args.splice(i, 1);
  return i >= 0;
};

function output(values: Record<string, string>) {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  for (const [k, v] of Object.entries(values)) {
    if (/[\r\n]/.test(v)) throw new Error(`output ${k} contains a newline`);
    appendFileSync(file, `${k}=${v}\n`);
  }
}

function readSources(): SourcesFile {
  return sourcesFile.parse(JSON.parse(readFileSync(SOURCES, 'utf8')));
}

function sortSources(s: SourceEntry[]) {
  return [...s].sort((a, b) => a.repo.toLowerCase().localeCompare(b.repo.toLowerCase()));
}

function writeSources(file: SourcesFile) {
  writeFileSync(SOURCES, `${JSON.stringify({ sources: sortSources(file.sources) }, null, 2)}\n`);
}

/** Pull the repository out of an issue-form body ("### GitHub repository\n\n<value>"). */
export function repoFromIssueBody(body: string): string {
  const lines = body.replace(/\r/g, '').split('\n');
  const h = lines.findIndex((l) => /^#{1,6}\s*GitHub repository/i.test(l.trim()));
  const after = h >= 0 ? lines.slice(h + 1) : lines;
  const value = after.map((l) => l.trim()).find((l) => l && !l.startsWith('#') && l !== '_No response_');
  if (!value) throw new GitHubError('invalid-input', 'The issue has no "GitHub repository" value.');
  const cleaned = value.replace(/^<|>$/g, '').replace(/^`|`$/g, '').split(/\s+/)[0];
  parseRepoInput(cleaned); // validate now, with a friendly error
  return cleaned;
}

async function existingIds(sources: SourcesFile, skipRepo?: string) {
  const { index } = await buildIndex(
    { sources: sources.sources.filter((s) => s.repo.toLowerCase() !== skipRepo?.toLowerCase()) },
    { token },
  );
  return {
    officialIds: new Set(index.plugins.filter((p) => p.official).map((p) => p.id)),
    takenIds: new Map(index.plugins.filter((p) => !p.official).map((p) => [p.id, p.slug])),
    officialError: index.sources[0]?.error,
  };
}

async function scanForAdd(input: string): Promise<ScanReport> {
  const sources = readSources();
  const ref = parseRepoInput(input);
  const ids = await existingIds(sources, `${ref.owner}/${ref.repo}`);
  if (ids.officialError) throw new Error(`Could not load the official registry: ${ids.officialError}`);
  return scanRepo(input, { token, officialIds: ids.officialIds, takenIds: ids.takenIds });
}

async function add(input: string, reportFile?: string): Promise<number> {
  const report = await scanForAdd(input);
  let md = reportMarkdown(report, SITE);
  const repo = report.repo?.fullName;
  let changed = false;
  if (report.ok && repo) {
    const sources = readSources();
    const existing = sources.sources.find((s) => s.repo.toLowerCase() === repo.toLowerCase());
    if (existing)
      md += `\n\n${repo} is already listed (added ${existing.addedAt}); pushes to it are picked up automatically.`;
    else {
      const entry: SourceEntry = { repo, addedAt: new Date().toISOString().slice(0, 10) };
      if (report.repo?.path) entry.path = report.repo.path;
      sources.sources.push(entry);
      writeSources(sources);
      changed = true;
      md += `\n\nAdded \`${repo}\` to \`data/sources.json\`.`;
    }
  }
  if (reportFile) writeFileSync(reportFile, md);
  console.log(md);
  output({
    ok: String(report.ok),
    changed: String(changed),
    repo: repo ?? '',
    branch: repo ? `submission/${repo.toLowerCase().replace(/[^a-z0-9-]+/g, '-')}` : '',
  });
  return report.ok ? 0 : 1;
}

async function check(): Promise<number> {
  const raw = JSON.parse(readFileSync(SOURCES, 'utf8'));
  const parsed = sourcesFile.safeParse(raw);
  if (!parsed.success) {
    console.error('data/sources.json is invalid:', parsed.error.issues);
    return 1;
  }
  const problems: string[] = [];
  const names = parsed.data.sources.map((s) => s.repo.toLowerCase());
  if (new Set(names).size !== names.length) problems.push('data/sources.json lists a repo twice.');
  if (JSON.stringify(sortSources(parsed.data.sources)) !== JSON.stringify(parsed.data.sources))
    problems.push('data/sources.json must be sorted by repo (run `bun scripts/marketplace.ts add` or sort it).');
  const today = new Date().toISOString().slice(0, 10);
  for (const s of parsed.data.sources) if (s.addedAt > today) problems.push(`${s.repo}: addedAt is in the future.`);

  const { index, reports } = await buildIndex(parsed.data, { token });
  for (const s of index.sources) {
    console.log(
      `${s.error ? '✗' : '✓'} ${s.repo.padEnd(48)} ${String(s.plugins).padStart(3)} plugin(s)${s.stars !== undefined ? `  ★${s.stars}` : ''}`,
    );
    if (s.error) problems.push(`${s.repo}: ${s.error}`);
  }
  for (const { repo, report } of reports) {
    const verified = parsed.data.sources.find((s) => s.repo === repo)?.verified ?? [];
    const ids = new Set(report.plugins.map((p) => p.id));
    for (const v of verified) if (!ids.has(v)) problems.push(`${repo}: verified id "${v}" was not found in the repo.`);
  }
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):\n${problems.map((p) => `- ${p}`).join('\n')}`);
    return 1;
  }
  console.log(`\nOK: ${index.plugins.length} plugins (${index.plugins.filter((p) => !p.official).length} community).`);
  return 0;
}

async function main(): Promise<number> {
  const json = has('json');
  const reportFile = flag('report');
  const [cmd, input] = args;
  switch (cmd) {
    case 'scan': {
      if (!input) break;
      const report = await scanForAdd(input);
      console.log(json ? JSON.stringify(report, null, 2) : reportMarkdown(report, SITE));
      return report.ok ? 0 : 1;
    }
    case 'add':
      if (!input) break;
      return add(input, reportFile);
    case 'issue': {
      let repo: string;
      try {
        repo = repoFromIssueBody(process.env.ISSUE_BODY ?? '');
      } catch (e) {
        const msg = `### ❌ Could not read the submission\n\n${e instanceof Error ? e.message : String(e)}\n\nEdit the issue and put \`owner/repo\` or a github.com URL in the **GitHub repository** field.`;
        if (reportFile) writeFileSync(reportFile, msg);
        console.log(msg);
        output({ ok: 'false', changed: 'false', repo: '', branch: '' });
        return 1;
      }
      return add(repo, reportFile);
    }
    case 'check':
      return check();
  }
  console.error('usage: bun scripts/marketplace.ts scan|add <owner/repo|url> [--json] [--report file] | issue | check');
  return 2;
}

if (import.meta.main) {
  try {
    process.exit(await main());
  } catch (e) {
    console.error(`error: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}
