/* Offline GitHub fixture for scanner tests: a fake `fetch` serving the API and raw files. */

type Repo = {
  stars?: number;
  private?: boolean;
  branch?: string;
  files?: Record<string, unknown>;
  rateLimited?: boolean;
  sizes?: Record<string, number>;
};

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

const manifest = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  name: `插件 ${id}`,
  description: `Fixture plugin ${id} for tests.`,
  endpoint: `https://${id}.example.com/mcp`,
  requires: ['network'],
  scopes: ['example.com'],
  ...extra,
});

const textOf = (body: unknown) => (body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body));

const md = (frontmatter: string, body = 'Use the tools when the user asks.') =>
  `---\n${frontmatter.trim()}\n---\n\n${body}\n`;

/** PLUGIN.md fixtures (plugin language spec v1). */
export const DOC_PLUGINS: Record<string, unknown> = {
  'classrooms/PLUGIN.md': md(
    `
spec: 1
id: classrooms
name: 空闲教室
description: 查询各教学楼今天、明天、后天的空闲教室。
version: 1.2.0
author: carol
icon: building
campus: [card]
network: [portal.pku.edu.cn]
abilities: [scheduler]
tools:
  free: tools/free.yaml
  rooms:
    title: 教室列表
    description: List rooms.
    effect: read
    steps: []
    return: "[]"
widgets:
  overview: widgets/overview.json
dataSources:
  overview: { tool: free, args: { day: today }, ttl: 30m }
commands:
  study: { description: 找自习室, prompt: "Find a free room {{input}}" }
i18n:
  en: { name: Free classrooms, description: Free classrooms in each teaching building. }
`,
    'Use `free` when the user asks where to study.',
  ),
  'classrooms/tools/free.yaml': 'title: 空闲教室\ndescription: Free rooms.\neffect: read\nsteps: []\nreturn: "[]"\n',
  'classrooms/widgets/overview.json': { title: 'Free rooms', spec: {} },
  'classrooms/pku-harness.plugin.json': { id: 'shadowed', name: 'x', description: 'never read' },
  'broken/PLUGIN.md': md(`
spec: 1
id: broken
name: 坏插件
description: Paths that escape or don't exist.
version: 0.1.0
author: carol
tools:
  up: ../classrooms/tools/free.yaml
  gone: tools/missing.yaml
widgets:
  abs: /etc/passwd
dataSources:
  x: { tool: nope, ttl: 5m }
`),
  'big/PLUGIN.md': md(`
spec: 1
id: big
name: 大插件
description: Names a file that is too large.
version: 1.0.0
author: carol
tools:
  huge: tools/huge.yaml
`),
  'big/tools/huge.yaml': 'title: t\ndescription: d\neffect: read\n',
  'remote/PLUGIN.md': md(`
spec: 1
id: remote-canteen
name: 食堂（远程）
description: A remote MCP plugin described by PLUGIN.md.
version: 1.0.0
author: carol
campus: [card]
remote: { mcp: "https://canteen.example.com/mcp", auth: bearer }
`),
  'nofm/PLUGIN.md': '# just markdown, no frontmatter\n',
  'badtool/PLUGIN.md': md(`
spec: 1
id: badtool
name: 无效工具
description: The tool file lacks an effect.
version: 2.0.0
author: carol
tools:
  t: t.yaml
`),
  'badtool/t.yaml': 'title: t\ndescription: no effect here\n',
};

export function renderMarketplaceFixture() {
  const repos: Record<string, Repo> = {
    'alice/campus-tools': {
      stars: 42,
      files: {
        'README.md': '# hi',
        'canteen/pku-harness.plugin.json': manifest('canteen-menu', { tags: ['food'] }),
        'dup/pku-harness.plugin.json': manifest('canteen-menu'),
        'packages/library-seat/package.json': {
          name: 'library-seat',
          description: '图书馆座位查询与预约提醒。',
          version: '0.3.0',
          pkuHarness: {
            id: 'library-seat',
            name: '图书馆座位',
            endpoint: null,
            requires: ['network'],
            scopes: ['seat.lib.pku.edu.cn'],
          },
        },
        'packages/sdk-only/package.json': { name: 'sdk-only', pkuHarness: { builtin: true } },
        'packages/plain/package.json': { name: 'plain' },
        'wallet-clone/pku-harness.plugin.json': manifest('wallet'),
        'node_modules/foo/pku-harness.plugin.json': manifest('ignored'),
      },
    },
    'carol/doc-plugins': { stars: 9, files: DOC_PLUGINS, sizes: { 'big/tools/huge.yaml': 600 * 1024 } },
    'bob/copycat': { stars: 1, files: { 'pku-harness.plugin.json': manifest('canteen-menu') } },
    'alice/secret': { private: true },
    'alice/limited': { rateLimited: true },
    'pkuinfo/pku-harness-plugins': {
      stars: 7,
      files: {
        'registry/registry.json': {
          version: 1,
          updatedAt: '2026-10-22',
          plugins: [
            {
              id: 'wallet',
              name: '校园卡',
              description: '校园卡余额与付款码。',
              author: 'pkuinfo',
              source: 'https://github.com/pkuinfo/pku-harness-plugins/tree/main/plugins/wallet',
              kind: 'builtin',
              requires: ['campus-session', 'network'],
              tags: ['official', 'campus'],
              verified: true,
            },
            { id: 'BROKEN' },
          ],
        },
      },
    },
  };
  const calls = { api: 0, raw: 0 };
  const find = (owner: string, repo: string) =>
    Object.entries(repos).find(([k]) => k.toLowerCase() === `${owner}/${repo}`.toLowerCase());

  const fetchImpl = (async (input: string | URL | Request) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    if (url.hostname === 'api.github.com') {
      calls.api++;
      const m = url.pathname.match(/^\/repos\/([^/]+)\/([^/]+)(?:\/git\/trees\/(.+))?$/);
      const hit = m && find(m[1], m[2]);
      if (!m || !hit) return json({ message: 'Not Found' }, 404);
      const [name, r] = hit;
      if (r.rateLimited)
        return json({ message: 'rate limit' }, 403, {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1800000000',
        });
      if (r.private) return json({ message: 'Not Found' }, 404); // unauthenticated: private looks missing
      if (!m[3])
        return json({
          full_name: name,
          default_branch: r.branch ?? 'main',
          stargazers_count: r.stars ?? 0,
          private: false,
          archived: false,
          description: 'fixture',
          pushed_at: '2026-10-20T00:00:00Z',
          html_url: `https://github.com/${name}`,
        });
      if (decodeURIComponent(m[3]) !== (r.branch ?? 'main')) return json({ message: 'Not Found' }, 404);
      const files = Object.keys(r.files ?? {});
      const dirs = new Set<string>();
      for (const f of files) {
        const segs = f.split('/');
        for (let i = 1; i < segs.length; i++) dirs.add(segs.slice(0, i).join('/'));
      }
      return json({
        tree: [
          ...[...dirs].map((path) => ({ path, type: 'tree' })),
          ...files.map((path) => ({ path, type: 'blob', size: r.sizes?.[path] ?? textOf(r.files?.[path]).length })),
        ],
        truncated: false,
      });
    }
    if (url.hostname === 'raw.githubusercontent.com') {
      calls.raw++;
      const [, owner, repo, ref, ...rest] = url.pathname.split('/');
      const hit = find(owner, repo);
      const body =
        hit && ref === (hit[1].branch ?? 'main') ? hit[1].files?.[rest.map(decodeURIComponent).join('/')] : undefined;
      if (body === undefined) return new Response('404: Not Found', { status: 404 });
      return new Response(typeof body === 'string' ? body : JSON.stringify(body));
    }
    return new Response('unexpected host', { status: 500 });
  }) as typeof fetch;

  // The private repo "exists" only with a token; emulate the authenticated answer for the test.
  const withPrivate = (async (input: string | URL | Request, init?: RequestInit) => {
    const u = String(input instanceof Request ? input.url : input);
    if (u === 'https://api.github.com/repos/alice/secret')
      return json({ full_name: 'alice/secret', private: true, default_branch: 'main' });
    return fetchImpl(input, init);
  }) as typeof fetch;

  return { fetch: withPrivate, calls };
}
