/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildIndex } from './build';
import { GitHubError, parseRepoInput, refCandidates } from './github';
import { extractManifest, findCandidates, isIgnoredPath, scanRepo, validateManifest } from './scanner';
import { manifestJsonSchema, registry } from './schema';
import { renderMarketplaceFixture } from './test-fixture';

describe('parseRepoInput', () => {
  test('owner/repo and URLs', () => {
    expect(parseRepoInput('pkuinfo/pku-harness-plugins')).toEqual({
      owner: 'pkuinfo',
      repo: 'pku-harness-plugins',
      ref: undefined,
      path: '',
    });
    expect(parseRepoInput('https://github.com/a-b/c.d.git')).toMatchObject({ owner: 'a-b', repo: 'c.d', path: '' });
    expect(parseRepoInput('github.com/a/b')).toMatchObject({ owner: 'a', repo: 'b' });
    expect(parseRepoInput('https://github.com/a/b/tree/main/plugins/x')).toMatchObject({
      ref: 'main/plugins/x',
      path: '',
    });
    expect(parseRepoInput('a/b/plugins/x')).toMatchObject({ ref: undefined, path: 'plugins/x' });
    expect(parseRepoInput(' https://www.github.com/a/b/ ')).toMatchObject({ owner: 'a', repo: 'b' });
  });
  test('rejects other hosts and junk', () => {
    for (const bad of [
      '',
      'a',
      'https://gitlab.com/a/b',
      'http://evil.com/github.com/a/b',
      'https://github.com/a',
      'a/../b',
      'https://github.com/a/b/issues/1',
      'ftp://github.com/a/b',
      'https://user:pw@github.com/a/b',
      '-a/b',
      'a/b/../../etc',
    ])
      expect(() => parseRepoInput(bad)).toThrow(GitHubError);
  });
  test('ambiguous tree refs', () => {
    expect(refCandidates('feature/x/plugins')).toEqual([
      { ref: 'feature', path: 'x/plugins' },
      { ref: 'feature/x', path: 'plugins' },
      { ref: 'feature/x/plugins', path: '' },
    ]);
  });
});

describe('findCandidates', () => {
  const tree = [
    'package.json',
    'plugins/a/pku-harness.plugin.json',
    'plugins/a/package.json',
    'plugins/b/package.json',
    'node_modules/x/pku-harness.plugin.json',
    '.github/pku-harness.plugin.json',
    'deep/er/still/pku-harness.plugin.json',
  ].map((path) => ({ path, type: 'blob' as const }));

  test('auto-discovery skips node_modules and dot dirs; manifest beats package.json', () => {
    const { candidates } = findCandidates(tree);
    expect(candidates.map((c) => c.file)).toEqual([
      'package.json',
      'deep/er/still/pku-harness.plugin.json',
      'plugins/a/pku-harness.plugin.json',
      'plugins/b/package.json',
    ]);
  });
  test('sub-folder root', () => {
    expect(findCandidates(tree, { root: 'plugins' }).candidates.map((c) => c.dir)).toEqual(['plugins/a', 'plugins/b']);
  });
  test('pku-harness.json restricts and orders', () => {
    const r = findCandidates(tree, { config: { plugins: ['plugins/b', './plugins/a/', 'missing', '../x'] } });
    expect(r.candidates.map((c) => c.dir)).toEqual(['plugins/b', 'plugins/a']);
    expect(r.notes.filter((n) => n.level === 'error')).toHaveLength(2);
  });
});

const ctx = {
  owner: 'alice',
  repo: 'campus-tools',
  branch: 'main',
  dir: 'canteen',
  manifestPath: 'canteen/pku-harness.plugin.json',
  from: 'manifest' as const,
};
const good = {
  id: 'canteen-menu',
  name: '食堂菜单',
  description: '查看今天各食堂的菜单和营业时间。',
  endpoint: 'https://canteen.example.com/mcp',
  requires: ['network'],
  scopes: ['dining.pku.edu.cn'],
  tags: ['Food'],
  license: 'MIT',
  i18n: { en: { name: 'Canteen menu', description: "Today's menus and opening hours." } },
};

describe('validateManifest', () => {
  test('valid manifest gets defaults and derived fields', () => {
    const r = validateManifest(good, { ...ctx, verified: ['canteen-menu'] });
    expect(r.status).toBe('ok');
    expect(r.plugin).toMatchObject({
      slug: 'alice/campus-tools/canteen-menu',
      author: 'alice',
      kind: 'remote',
      auth: 'none',
      source: 'https://github.com/alice/campus-tools/tree/main/canteen',
      tags: ['food'],
      verified: true,
      official: false,
      nameEn: 'Canteen menu',
    });
    expect(r.issues.filter((i) => i.level !== 'info')).toEqual([]);
  });
  test('schema errors carry field and hint', () => {
    const r = validateManifest({ id: 'Bad_ID', name: '', description: 'x' }, ctx);
    expect(r.status).toBe('error');
    expect(r.issues.map((i) => i.field)).toEqual(['id', 'name', 'description']);
    expect(r.issues[0].hint).toBeTruthy();
  });
  test('endpoint rules', () => {
    for (const endpoint of [
      'http://a.example.com/mcp',
      'https://localhost:8787/mcp',
      'https://10.0.0.2/mcp',
      'https://x.example.com/mcp?token=1',
    ])
      expect(validateManifest({ ...good, endpoint }, ctx).status).toBe('error');
    const selfHost = validateManifest({ ...good, endpoint: null }, ctx);
    expect(selfHost.status).toBe('ok');
    expect(selfHost.plugin?.endpoint).toBeNull();
  });
  test('reserved ids, builtin, cloud disclosure', () => {
    expect(validateManifest(good, { ...ctx, officialIds: new Set(['canteen-menu']) }).status).toBe('error');
    expect(validateManifest(good, { ...ctx, takenIds: new Map([['canteen-menu', 'bob/x/canteen-menu']]) }).status).toBe(
      'error',
    );
    expect(
      validateManifest(good, { ...ctx, takenIds: new Map([['canteen-menu', 'alice/campus-tools/canteen-menu']]) })
        .status,
    ).toBe('ok');
    expect(validateManifest({ ...good, kind: 'builtin' }, ctx).status).toBe('error');
    const cloud = { uses: ['store'], e2e: true, disclosure: { zh: [] } };
    expect(
      validateManifest({ ...good, requires: ['network', 'cloud'], cloud }, ctx).issues.some((i) =>
        i.message.includes('disclosure.zh'),
      ),
    ).toBe(true);
    const fine = validateManifest(
      { ...good, requires: ['network', 'cloud'], cloud: { ...cloud, disclosure: { zh: ['你的收藏会存到云端'] } } },
      ctx,
    );
    expect(fine.status).toBe('ok');
  });
  test('warnings: campus-session, shell, scopes, unknown keys', () => {
    const r = validateManifest(
      { ...good, requires: ['campus-session', 'shell', 'network'], scopes: ['https://x.com/a'], colour: 'red' },
      ctx,
    );
    expect(r.status).toBe('ok');
    expect(r.plugin?.warnings?.length).toBe(4);
  });
  test('official repo entries already in the registry are de-duplicated', () => {
    const r = validateManifest(
      { ...good, id: 'wallet' },
      { ...ctx, owner: 'pkuinfo', repo: 'pku-harness-plugins', officialIds: new Set(['wallet']) },
    );
    expect(r.status).toBe('official');
  });
});

describe('extractManifest', () => {
  test('package.json: needs pkuHarness.id; merges package fields', () => {
    expect(extractManifest(JSON.stringify({ name: 'x' }), 'package.json').skip).toBe(true);
    const sdk = extractManifest(JSON.stringify({ name: 'x', pkuHarness: { builtin: true } }), 'package.json');
    expect(sdk.skip).toBe(true);
    expect(sdk.issues[0].level).toBe('info');
    const r = extractManifest(
      JSON.stringify({
        description: 'from package',
        version: '1.2.0',
        license: 'MIT',
        pkuHarness: { id: 'x-y', name: 'X' },
      }),
      'package.json',
    );
    expect(r.manifest).toEqual({ description: 'from package', version: '1.2.0', license: 'MIT', id: 'x-y', name: 'X' });
  });
  test('invalid JSON', () => {
    expect(extractManifest('{ "a": 1, }', 'manifest').issues[0].level).toBe('error');
  });
});

describe('scanRepo + buildIndex on a fixture repo', () => {
  const fx = renderMarketplaceFixture();
  test('scan', async () => {
    const fx = renderMarketplaceFixture();
    const r = await scanRepo('https://github.com/Alice/campus-tools', {
      fetch: fx.fetch,
      officialIds: new Set(['wallet']),
    });
    expect(r.error).toBeUndefined();
    expect(r.repo).toMatchObject({ fullName: 'alice/campus-tools', branch: 'main', stars: 42 });
    const byPath = Object.fromEntries(r.plugins.map((p) => [p.manifestPath, p.status]));
    expect(byPath).toEqual({
      'canteen/pku-harness.plugin.json': 'ok',
      'dup/pku-harness.plugin.json': 'error',
      'packages/library-seat/package.json': 'ok',
      'packages/sdk-only/package.json': 'skipped',
      'wallet-clone/pku-harness.plugin.json': 'error',
    });
    expect(r.ok).toBe(false);
    expect(fx.calls.api).toBe(2);
  });
  test('scan a sub-folder via /tree/', async () => {
    const r = await scanRepo('https://github.com/alice/campus-tools/tree/main/canteen', { fetch: fx.fetch });
    expect(r.ok).toBe(true);
    expect(r.plugins.map((p) => p.id)).toEqual(['canteen-menu']);
  });
  test('errors: not found, private, rate limited', async () => {
    expect((await scanRepo('nobody/nothing', { fetch: fx.fetch })).error?.code).toBe('not-found');
    expect((await scanRepo('alice/secret', { fetch: fx.fetch })).error?.code).toBe('private');
    expect((await scanRepo('alice/limited', { fetch: fx.fetch })).error?.code).toBe('rate-limited');
  });
  test('index: official + community, first-added keeps an id', async () => {
    const { index } = await buildIndex(
      {
        sources: [
          { repo: 'bob/copycat', addedAt: '2026-10-02' },
          { repo: 'alice/campus-tools', addedAt: '2026-10-01', verified: ['canteen-menu'] },
        ],
      },
      { fetch: fx.fetch },
    );
    expect(index.plugins.filter((p) => p.official).map((p) => p.slug)).toEqual(['pkuinfo/pku-harness-plugins/wallet']);
    const community = index.plugins.filter((p) => !p.official);
    expect(community.map((p) => p.slug)).toEqual([
      'alice/campus-tools/canteen-menu',
      'alice/campus-tools/library-seat',
    ]);
    expect(community[0].verified).toBe(true);
    const copycat = index.sources.find((s) => s.repo === 'bob/copycat');
    expect(copycat?.plugins).toBe(0);
    expect(copycat?.error).toContain('already used by alice/campus-tools/canteen-menu');
  });
});

describe('schema', () => {
  test('JSON Schema generates', () => {
    const s = manifestJsonSchema('https://pkuharness.example');
    expect(s.$id).toBe('https://pkuharness.example/schema/plugin-manifest.v1.json');
    expect((s.required as string[]).sort()).toEqual(['description', 'id', 'name']);
  });
  const sibling = join(import.meta.dir, '../../../../pku-harness-plugins/registry/registry.json');
  test.skipIf(!existsSync(sibling))('mirrors the official registry schema (sibling checkout)', () => {
    expect(registry.safeParse(JSON.parse(readFileSync(sibling, 'utf8'))).success).toBe(true);
  });
});

test('test and fixture folders are never scanned for plugins', () => {
  expect(isIgnoredPath('packages/cloud-server/test/fixtures/fn-demo/PLUGIN.md')).toBe(true);
  expect(isIgnoredPath('src/__tests__/demo/PLUGIN.md')).toBe(true);
  expect(isIgnoredPath('node_modules/x/PLUGIN.md')).toBe(true);
  expect(isIgnoredPath('.github/PLUGIN.md')).toBe(true);
  expect(isIgnoredPath('plugins/classrooms/PLUGIN.md')).toBe(false);
  // a plugin may itself be named "test"; only folders above the file count
  expect(isIgnoredPath('plugins/test-runner/PLUGIN.md')).toBe(false);
});
