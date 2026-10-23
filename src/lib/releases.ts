/**
 * App releases from GitHub (pkuinfo/pku-harness). Server-only; cached for 10 minutes.
 * `GITHUB_TOKEN` (optional) lifts the anonymous rate limit.
 */

const REPO = 'pkuinfo/pku-harness';
const API = `https://api.github.com/repos/${REPO}/releases?per_page=10`;

export interface ReleaseAsset {
  name: string;
  size: number;
  url: string;
  downloads: number;
  /** Hex SHA-256 from the asset's `digest` field or from the release notes. */
  sha256?: string;
}

export interface Release {
  tag: string;
  name: string;
  publishedAt: string;
  prerelease: boolean;
  htmlUrl: string;
  body: string;
  apks: ReleaseAsset[];
  others: ReleaseAsset[];
}

export interface ReleasesResult {
  releases: Release[];
  /** Set when GitHub could not be reached; the page then shows the build-from-source state. */
  error?: string;
}

interface GhAsset {
  name: string;
  size: number;
  browser_download_url: string;
  download_count?: number;
  digest?: string | null;
}

interface GhRelease {
  tag_name: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  created_at: string;
  html_url: string;
  body: string | null;
  assets: GhAsset[];
}

export async function getReleases(): Promise<ReleasesResult> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(API, { headers, next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { releases: [], error: `GitHub ${res.status}` };
    const data = (await res.json()) as GhRelease[];
    return { releases: normalizeReleases(data) };
  } catch (e) {
    return { releases: [], error: e instanceof Error ? e.message : 'network error' };
  }
}

export function normalizeReleases(data: GhRelease[]): Release[] {
  return data
    .filter((r) => !r.draft)
    .map((r) => {
      const body = r.body ?? '';
      const assets = r.assets.map((a) => ({
        name: a.name,
        size: a.size,
        url: a.browser_download_url,
        downloads: a.download_count ?? 0,
        sha256: shaFromDigest(a.digest) ?? shaFromNotes(body, a.name),
      }));
      const apks = assets.filter((a) => a.name.toLowerCase().endsWith('.apk'));
      // A lone hash in the notes belongs to a lone APK.
      if (apks.length === 1 && !apks[0].sha256) {
        const all = [...new Set(body.match(/\b[a-f0-9]{64}\b/gi) ?? [])];
        if (all.length === 1) apks[0].sha256 = all[0].toLowerCase();
      }
      return {
        tag: r.tag_name,
        name: r.name?.trim() || r.tag_name,
        publishedAt: r.published_at ?? r.created_at,
        prerelease: r.prerelease,
        htmlUrl: r.html_url,
        body,
        apks,
        others: assets.filter((a) => !apks.includes(a)),
      };
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

/** Latest stable release with an APK, else the latest release with an APK. */
export function pickLatest(releases: Release[]): Release | undefined {
  const withApk = releases.filter((r) => r.apks.length > 0);
  return withApk.find((r) => !r.prerelease) ?? withApk[0];
}

function shaFromDigest(digest: string | null | undefined) {
  const m = digest?.match(/^sha256:([a-f0-9]{64})$/i);
  return m ? m[1].toLowerCase() : undefined;
}

function shaFromNotes(body: string, file: string) {
  for (const line of body.split('\n')) {
    if (!line.includes(file)) continue;
    const m = line.match(/\b([a-f0-9]{64})\b/i);
    if (m) return m[1].toLowerCase();
  }
  return undefined;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(iso));
}

/** Demo data for previewing the "released" state in development (`/download/preview`). */
export const PREVIEW_RELEASES: GhRelease[] = [
  {
    tag_name: 'v1.1.0',
    name: 'PKU Harness 1.1.0',
    draft: false,
    prerelease: false,
    published_at: '2026-11-02T08:00:00Z',
    created_at: '2026-11-02T08:00:00Z',
    html_url: `https://github.com/${REPO}/releases`,
    body: '## 新功能\n\n- 看板支持拖动排序\n- 日程：每 N 天、共 M 次的重复提醒\n\n## 修复\n\n- 树洞二次验证后不再重复要求登录\n\n```\n3f5a0c9b2e7d4f61a8c3b9e0d2f4a6b8c1e3f5a7b9d0c2e4f6a8b0c2d4e6f8a0  pku-harness-1.1.0.apk\n```',
    assets: [
      {
        name: 'pku-harness-1.1.0.apk',
        size: 61_340_112,
        browser_download_url: `https://github.com/${REPO}/releases/download/v1.1.0/pku-harness-1.1.0.apk`,
        download_count: 0,
      },
    ],
  },
  {
    tag_name: 'v1.0.0',
    name: 'PKU Harness 1.0.0',
    draft: false,
    prerelease: false,
    published_at: '2026-10-30T08:00:00Z',
    created_at: '2026-10-30T08:00:00Z',
    html_url: `https://github.com/${REPO}/releases`,
    body: '第一个公开版本。',
    assets: [
      {
        name: 'pku-harness-1.0.0.apk',
        size: 60_112_384,
        browser_download_url: `https://github.com/${REPO}/releases/download/v1.0.0/pku-harness-1.0.0.apk`,
        download_count: 0,
        digest: 'sha256:9c1e3f5a7b9d0c2e4f6a8b0c2d4e6f8a03f5a0c9b2e7d4f61a8c3b9e0d2f4a6b',
      },
    ],
  },
];
