/*
 * Minimal GitHub access for the scanner: repo metadata + recursive tree from the REST API,
 * file contents from raw.githubusercontent.com (not rate limited). No Next.js imports: callers
 * pass Next caching options through `init`.
 */

export interface RepoRef {
  owner: string;
  repo: string;
  /** Branch/tag from a /tree/<ref>/<path> URL; may still contain path segments (see `refCandidates`). */
  ref?: string;
  /** Sub-folder to scan ('' = whole repo). */
  path: string;
}

export type GitHubErrorCode = 'invalid-input' | 'not-found' | 'private' | 'rate-limited' | 'timeout' | 'upstream';

export class GitHubError extends Error {
  constructor(
    public code: GitHubErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

const OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO = /^[A-Za-z0-9._-]{1,100}$/;
const SEGMENT = /^[A-Za-z0-9._@+-][A-Za-z0-9._@+ -]*$/;

/**
 * Accepts `owner/repo`, `owner/repo/sub/path`, `github.com/owner/repo`,
 * `https://github.com/owner/repo(.git)`, `.../tree/<branch>/<path>`. Only github.com.
 */
export function parseRepoInput(raw: string): RepoRef {
  const input = raw.trim();
  if (!input) throw new GitHubError('invalid-input', 'Enter a GitHub repository, e.g. owner/repo.');
  if (input.length > 300) throw new GitHubError('invalid-input', 'That is too long to be a GitHub repository URL.');

  let parts: string[];
  let tree: string[] | undefined;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(input) || /^(www\.)?github\.com\//i.test(input)) {
    let url: URL;
    try {
      url = new URL(/^[a-z]+:\/\//i.test(input) ? input : `https://${input}`);
    } catch {
      throw new GitHubError('invalid-input', 'That is not a valid URL.');
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:')
      throw new GitHubError('invalid-input', 'Use an https://github.com/... URL.');
    const host = url.hostname.toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com')
      throw new GitHubError('invalid-input', 'Only public repositories on github.com are supported.');
    if (url.username || url.password || url.port) throw new GitHubError('invalid-input', 'Unexpected URL format.');
    const segs = url.pathname
      .split('/')
      .filter(Boolean)
      .map((s) => decodeURIComponent(s));
    if (segs.length < 2)
      throw new GitHubError('invalid-input', 'The URL must point to a repository: github.com/owner/repo.');
    parts = segs.slice(0, 2);
    const rest = segs.slice(2);
    if (rest.length > 0) {
      if (rest[0] !== 'tree' && rest[0] !== 'blob')
        throw new GitHubError('invalid-input', 'Link to the repository or a folder in it (…/tree/<branch>/<path>).');
      if (rest.length < 2) throw new GitHubError('invalid-input', 'The URL is missing the branch after /tree/.');
      tree = rest.slice(1);
    }
  } else {
    parts = input.split('/').filter(Boolean);
    if (parts.length < 2) throw new GitHubError('invalid-input', 'Use the form owner/repo.');
    // owner/repo/sub/path (no branch): scan a sub-folder of the default branch.
    if (parts.length > 2) return finish(parts[0], parts[1], undefined, parts.slice(2));
  }
  return finish(parts[0], parts[1], tree?.join('/'), []);
}

function finish(owner: string, repoRaw: string, refAndPath: string | undefined, path: string[]): RepoRef {
  const repo = repoRaw.replace(/\.git$/i, '');
  if (!OWNER.test(owner))
    throw new GitHubError('invalid-input', `"${owner}" is not a valid GitHub user or organisation.`);
  if (!REPO.test(repo) || repo === '.' || repo === '..')
    throw new GitHubError('invalid-input', `"${repo}" is not a valid repository name.`);
  for (const seg of [...(refAndPath?.split('/') ?? []), ...path])
    if (!SEGMENT.test(seg) || seg === '..') throw new GitHubError('invalid-input', `Unexpected path segment "${seg}".`);
  return { owner, repo, ref: refAndPath, path: path.join('/') };
}

/** `/tree/feature/x/plugins/a` is ambiguous: try "feature", then "feature/x", … as the branch. */
export function refCandidates(refAndPath: string): { ref: string; path: string }[] {
  const segs = refAndPath.split('/');
  const out: { ref: string; path: string }[] = [];
  for (let i = 1; i <= Math.min(segs.length, 4); i++)
    out.push({ ref: segs.slice(0, i).join('/'), path: segs.slice(i).join('/') });
  return out;
}

export interface FetchOptions {
  /** Extra fetch init (Next: `{ next: { revalidate, tags } }`). */
  init?: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } };
  token?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export interface RepoInfo {
  fullName: string;
  owner: string;
  repo: string;
  defaultBranch: string;
  stars: number;
  private: boolean;
  archived: boolean;
  description: string | null;
  pushedAt: string | null;
  htmlUrl: string;
}

export interface TreeEntry {
  path: string;
  type: 'blob' | 'tree' | 'commit';
  size?: number;
}

async function request(url: string, opts: FetchOptions, api: boolean): Promise<Response> {
  const headers: Record<string, string> = { 'User-Agent': 'pkuharness-marketplace' };
  if (api) {
    headers.Accept = 'application/vnd.github+json';
    headers['X-GitHub-Api-Version'] = '2022-11-28';
    if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  }
  const f = opts.fetch ?? fetch;
  try {
    return await f(url, {
      ...opts.init,
      headers: { ...headers, ...(opts.init?.headers as Record<string, string> | undefined) },
      signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000),
    });
  } catch (e) {
    if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError'))
      throw new GitHubError('timeout', 'GitHub took too long to answer. Try again in a minute.');
    throw new GitHubError('upstream', `Could not reach GitHub (${e instanceof Error ? e.message : String(e)}).`);
  }
}

function rateLimited(res: Response): GitHubError | null {
  if (res.status !== 403 && res.status !== 429) return null;
  const remaining = res.headers.get('x-ratelimit-remaining');
  if (res.status === 429 || remaining === '0') {
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    const when = Number.isFinite(reset) && reset > 0 ? ` (resets ${new Date(reset * 1000).toISOString()})` : '';
    return new GitHubError('rate-limited', `GitHub API rate limit reached${when}. Try again later.`);
  }
  return null;
}

export async function getRepo(owner: string, repo: string, opts: FetchOptions = {}): Promise<RepoInfo> {
  const res = await request(`https://api.github.com/repos/${owner}/${repo}`, opts, true);
  const rl = rateLimited(res);
  if (rl) throw rl;
  if (res.status === 404)
    throw new GitHubError(
      'not-found',
      `Repository ${owner}/${repo} was not found. Check the spelling; private repositories cannot be listed.`,
    );
  if (!res.ok) throw new GitHubError('upstream', `GitHub answered ${res.status} for ${owner}/${repo}.`);
  const j = (await res.json()) as Record<string, unknown> & { owner?: { login?: string } };
  if (j.private === true)
    throw new GitHubError('private', `${owner}/${repo} is private. The marketplace only lists public repositories.`);
  const fullName = String(j.full_name ?? `${owner}/${repo}`);
  return {
    fullName,
    owner: fullName.split('/')[0],
    repo: fullName.split('/')[1],
    defaultBranch: String(j.default_branch ?? 'main'),
    stars: Number(j.stargazers_count ?? 0),
    private: false,
    archived: j.archived === true,
    description: typeof j.description === 'string' ? j.description : null,
    pushedAt: typeof j.pushed_at === 'string' ? j.pushed_at : null,
    htmlUrl: String(j.html_url ?? `https://github.com/${fullName}`),
  };
}

/** Recursive tree of a branch/tag. Returns null when the ref doesn't exist. */
export async function getTree(
  owner: string,
  repo: string,
  ref: string,
  opts: FetchOptions = {},
): Promise<{ entries: TreeEntry[]; truncated: boolean } | null> {
  const res = await request(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`,
    opts,
    true,
  );
  const rl = rateLimited(res);
  if (rl) throw rl;
  if (res.status === 404 || res.status === 422) return null;
  if (res.status === 409) return { entries: [], truncated: false }; // empty repository
  if (!res.ok) throw new GitHubError('upstream', `GitHub answered ${res.status} listing ${owner}/${repo}@${ref}.`);
  const j = (await res.json()) as { tree?: TreeEntry[]; truncated?: boolean };
  return { entries: j.tree ?? [], truncated: j.truncated === true };
}

/** Raw file text; null on 404. Files over `maxBytes` are rejected. */
export async function getRaw(
  owner: string,
  repo: string,
  ref: string,
  path: string,
  opts: FetchOptions = {},
  maxBytes = 256 * 1024,
): Promise<string | null> {
  const encPath = path.split('/').map(encodeURIComponent).join('/');
  const res = await request(
    `https://raw.githubusercontent.com/${owner}/${repo}/${ref.split('/').map(encodeURIComponent).join('/')}/${encPath}`,
    opts,
    false,
  );
  if (res.status === 404) return null;
  if (res.status === 429) throw new GitHubError('rate-limited', 'raw.githubusercontent.com is rate limiting us.');
  if (!res.ok) throw new GitHubError('upstream', `Could not download ${path} (${res.status}).`);
  const text = await res.text();
  if (text.length > maxBytes) throw new GitHubError('upstream', `${path} is larger than ${maxBytes / 1024} KB.`);
  return text;
}
