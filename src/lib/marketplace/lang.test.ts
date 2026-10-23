/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { buildIndex } from './build';
import { deepLinkFor, parsePluginMd, resolvePluginPath, splitFrontmatter, validatePluginMd } from './lang';
import { findCandidates, scanRepo } from './scanner';
import { DOC_PLUGINS, renderMarketplaceFixture } from './test-fixture';

const files = new Map(
  Object.entries(DOC_PLUGINS).map(([p, b]) => [p, (typeof b === 'string' ? b : JSON.stringify(b)).length]),
);
const ctx = { owner: 'carol', repo: 'doc-plugins', branch: 'main', files };

describe('frontmatter', () => {
  test('split', () => {
    expect(splitFrontmatter('---\na: 1\n---\nbody')).toEqual({ frontmatter: 'a: 1', body: 'body' });
    expect(splitFrontmatter('﻿---\r\na: 1\r\n---\r\n\r\nbody')?.body).toBe('\r\nbody');
    expect(splitFrontmatter('---\n---\n')).toEqual({ frontmatter: '', body: '' });
    expect(splitFrontmatter('# no')).toBeNull();
  });
  test('YAML errors are reported, not thrown', () => {
    expect(parsePluginMd('---\na: [1, 2\n---\n').issues[0].message).toContain('Invalid YAML');
    expect(parsePluginMd('---\n- a\n---\n').issues[0].message).toContain('mapping');
  });
});

describe('paths', () => {
  test('relative only, no ..', () => {
    expect(resolvePluginPath('p', './tools/a.yaml')).toEqual({ path: 'p/tools/a.yaml' });
    expect(resolvePluginPath('', 'a.yaml')).toEqual({ path: 'a.yaml' });
    for (const bad of ['../x', 'a/../b', '/etc/passwd', 'https://x/y', 'a\\b', 'a//b'])
      expect(resolvePluginPath('p', bad).error).toBeTruthy();
  });
});

describe('validatePluginMd', () => {
  const run = (dir: string, toolFiles: Record<string, string | null> = {}) =>
    validatePluginMd(DOC_PLUGINS[`${dir}/PLUGIN.md`] as string, {
      ...ctx,
      dir,
      manifestPath: `${dir}/PLUGIN.md`,
      toolFiles,
    });

  test('a declarative plugin maps to a marketplace entry', () => {
    const r = run('classrooms', { 'classrooms/tools/free.yaml': DOC_PLUGINS['classrooms/tools/free.yaml'] as string });
    expect(r.issues.filter((i) => i.level !== 'info')).toEqual([]);
    expect(r.status).toBe('ok');
    const p = r.plugin;
    expect(p).toMatchObject({
      slug: 'carol/doc-plugins/classrooms',
      handle: 'carol/doc-plugins/classrooms',
      kind: 'declarative',
      format: 'plugin-md',
      version: '1.2.0',
      nameEn: 'Free classrooms',
      campus: ['card'],
      network: ['portal.pku.edu.cn'],
      scopes: ['portal.pku.edu.cn'],
      abilities: ['notify'],
      widgets: ['overview'],
      commands: [{ name: 'study', description: '找自习室' }],
      installUrl: 'https://github.com/carol/doc-plugins/tree/main/classrooms',
      deepLink: 'pkuharness://plugin?src=https%3A%2F%2Fgithub.com%2Fcarol%2Fdoc-plugins%2Ftree%2Fmain%2Fclassrooms',
      instructions: 'Use `free` when the user asks where to study.',
    });
    expect(p?.tools).toEqual([
      { name: 'free', path: 'tools/free.yaml', title: '空闲教室', effect: 'read', userOnly: undefined },
      { name: 'rooms', title: '教室列表', effect: 'read', userOnly: undefined },
    ]);
    // Derived: campus → campus-session + network; notify → notifications.
    expect(p?.requires.sort()).toEqual(['campus-session', 'network', 'notifications']);
    // Declarative plugins may use campus sessions: no "remote never gets sessions" warning.
    expect(p?.warnings).toEqual([]);
  });

  test('bad paths, missing files and dangling references are errors', () => {
    const r = run('broken');
    expect(r.status).toBe('error');
    const msgs = r.issues.filter((i) => i.level === 'error').map((i) => i.message);
    expect(msgs.some((m) => m.includes('tools.up') && m.includes('..'))).toBe(true);
    expect(msgs.some((m) => m.includes('tools/missing.yaml does not exist'))).toBe(true);
    expect(msgs.some((m) => m.includes('widgets.abs'))).toBe(true);
    expect(msgs.some((m) => m.includes('tool "nope"'))).toBe(true);
  });

  test('512 KB limit uses tree sizes', () => {
    const big = new Map(files).set('big/tools/huge.yaml', 600 * 1024);
    const r = validatePluginMd(DOC_PLUGINS['big/PLUGIN.md'] as string, {
      ...ctx,
      files: big,
      dir: 'big',
      manifestPath: 'big/PLUGIN.md',
    });
    expect(r.status).toBe('error');
    expect(r.issues.some((i) => i.field === 'files')).toBe(true);
  });

  test('remote.mcp makes a remote plugin; campus on remote warns', () => {
    const r = run('remote');
    expect(r.status).toBe('ok');
    expect(r.plugin).toMatchObject({ kind: 'remote', endpoint: 'https://canteen.example.com/mcp', auth: 'bearer' });
    expect(r.plugin?.warnings?.some((w) => w.includes('never receive campus sessions'))).toBe(true);
  });

  test('schema errors: no frontmatter, numeric version, tool without effect', () => {
    expect(run('nofm').status).toBe('error');
    const r = run('badtool', { 'badtool/t.yaml': DOC_PLUGINS['badtool/t.yaml'] as string });
    expect(r.status).toBe('error');
    expect(r.issues.some((i) => i.field === 'tools.t' && i.message.includes('effect'))).toBe(true);
  });

  test('version must be semver (YAML 1.0 is a number)', () => {
    const text = (DOC_PLUGINS['classrooms/PLUGIN.md'] as string).replace('version: 1.2.0', 'version: 1.0');
    const r = validatePluginMd(text, { ...ctx, dir: 'classrooms', manifestPath: 'classrooms/PLUGIN.md' });
    expect(r.issues.some((i) => i.field === 'version')).toBe(true);
  });

  test('unknown fields are errors (the app parses strictly)', () => {
    const text = (DOC_PLUGINS['classrooms/PLUGIN.md'] as string).replace(
      'icon: building',
      'icon: building\ntags: [study]',
    );
    const r = validatePluginMd(text, { ...ctx, dir: 'classrooms', manifestPath: 'classrooms/PLUGIN.md' });
    expect(r.status).toBe('error');
    expect(r.issues.filter((i) => i.field === 'tags')).toHaveLength(1);
  });

  test('ids stay unique across the marketplace', () => {
    const r = validatePluginMd(DOC_PLUGINS['classrooms/PLUGIN.md'] as string, {
      ...ctx,
      dir: 'classrooms',
      manifestPath: 'classrooms/PLUGIN.md',
      officialIds: new Set(['classrooms']),
    });
    expect(r.status).toBe('error');
    const official = validatePluginMd(DOC_PLUGINS['classrooms/PLUGIN.md'] as string, {
      ...ctx,
      owner: 'pkuinfo',
      repo: 'pku-harness-plugins',
      dir: 'plugins/classrooms',
      manifestPath: 'plugins/classrooms/PLUGIN.md',
      files: new Map([
        ['plugins/classrooms/tools/free.yaml', 10],
        ['plugins/classrooms/widgets/overview.json', 10],
      ]),
      officialIds: new Set(['classrooms']),
    });
    expect(official.status).toBe('official');
    expect(official.plugin?.handle).toBe('pkuinfo/pku-harness-plugins/plugins/classrooms');
  });

  test('deep link encodes the install link', () => {
    expect(deepLinkFor('https://github.com/a/b')).toBe('pkuharness://plugin?src=https%3A%2F%2Fgithub.com%2Fa%2Fb');
  });
});

describe('discovery and scanning', () => {
  test('PLUGIN.md beats pku-harness.plugin.json and package.json in the same folder', () => {
    const tree = [
      'a/PLUGIN.md',
      'a/pku-harness.plugin.json',
      'a/package.json',
      'b/pku-harness.plugin.json',
      'c/PLUGIN.md',
      'node_modules/x/PLUGIN.md',
      '.hidden/PLUGIN.md',
    ].map((path) => ({ path, type: 'blob' as const }));
    expect(findCandidates(tree).candidates.map((c) => `${c.file}:${c.from}`)).toEqual([
      'a/PLUGIN.md:plugin-md',
      'b/pku-harness.plugin.json:manifest',
      'c/PLUGIN.md:plugin-md',
    ]);
    expect(findCandidates(tree, { config: { plugins: ['c', 'a'] } }).candidates.map((c) => c.from)).toEqual([
      'plugin-md',
      'plugin-md',
    ]);
  });

  test('scanRepo fetches tool files and validates every PLUGIN.md', async () => {
    const fx = renderMarketplaceFixture();
    const r = await scanRepo('carol/doc-plugins', { fetch: fx.fetch });
    const by = Object.fromEntries(r.plugins.map((p) => [p.manifestPath, p.status]));
    expect(by).toEqual({
      'badtool/PLUGIN.md': 'error',
      'big/PLUGIN.md': 'error',
      'broken/PLUGIN.md': 'error',
      'classrooms/PLUGIN.md': 'ok',
      'nofm/PLUGIN.md': 'error',
      'remote/PLUGIN.md': 'ok',
    });
    const classrooms = r.plugins.find((p) => p.id === 'classrooms')?.plugin;
    expect(classrooms?.tools?.find((t) => t.name === 'free')?.effect).toBe('read');
  });

  test('index lists PLUGIN.md plugins from sources', async () => {
    const fx = renderMarketplaceFixture();
    const { index } = await buildIndex(
      { sources: [{ repo: 'carol/doc-plugins', addedAt: '2026-10-23' }] },
      { fetch: fx.fetch },
    );
    expect(index.plugins.filter((p) => !p.official).map((p) => `${p.id}:${p.kind}`)).toEqual([
      'classrooms:declarative',
      'remote-canteen:remote',
    ]);
  });
});
