/* Offline GitHub fixture for scanner tests: a fake `fetch` serving the API and raw files. */

type Repo = {
  stars?: number;
  private?: boolean;
  branch?: string;
  files?: Record<string, unknown>;
  rateLimited?: boolean;
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
        tree: [...[...dirs].map((path) => ({ path, type: 'tree' })), ...files.map((path) => ({ path, type: 'blob' }))],
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
