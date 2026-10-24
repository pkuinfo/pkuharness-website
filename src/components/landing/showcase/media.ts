import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Lang } from '@/lib/i18n';

/**
 * Real app captures in `public/showcase/`, described by `public/showcase/manifest.json`
 * (`items: [{ file, type, feature, theme, width, height, caption: { zh, en }, poster? }]`).
 * Read on the server; entries whose file is missing are dropped, so the page degrades to fewer
 * captures (or none) instead of broken frames. Never put mock-ups in here: everything shown as
 * "the app" must come from this folder.
 */

export type Theme = 'dark' | 'light';

export interface ShowcaseMedia {
  /** Public URL, e.g. `/showcase/chat-dark.png`. */
  src: string;
  kind: 'image' | 'video';
  feature: string;
  theme: Theme;
  width: number;
  height: number;
  caption: string;
  /** UI language of the capture; undefined = English (the first captures). */
  lang?: Lang;
  /** Video only: the poster frame (`<name>.poster.webp`, see scripts/showcase-posters.sh), or a still of the same feature. */
  poster?: string;
}

const DIR = path.join(process.cwd(), 'public', 'showcase');

interface RawItem {
  file?: unknown;
  type?: unknown;
  feature?: unknown;
  theme?: unknown;
  width?: unknown;
  height?: unknown;
  caption?: unknown;
  poster?: unknown;
  lang?: unknown;
}

const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : d);

async function exists(file: string) {
  try {
    await access(path.join(DIR, file));
    return true;
  } catch {
    return false;
  }
}

async function readManifest(): Promise<RawItem[]> {
  try {
    const data = JSON.parse(await readFile(path.join(DIR, 'manifest.json'), 'utf8')) as { items?: unknown };
    return Array.isArray(data.items) ? (data.items as RawItem[]) : [];
  } catch {
    return [];
  }
}

/** All captures that exist on disk, in manifest order, with captions in `lang`. */
export async function getShowcase(lang: Lang): Promise<ShowcaseMedia[]> {
  const raw = await readManifest();
  const checked = await Promise.all(
    raw.map(async (r) => {
      const file = str(r.file);
      if (!file || file.includes('/') || file.includes('..') || !(await exists(file))) return null;
      const kind: ShowcaseMedia['kind'] =
        r.type === 'video' || r.type === 'image' ? r.type : /\.(mp4|webm|mov)$/i.test(file) ? 'video' : 'image';
      const cap = (r.caption ?? {}) as Record<string, unknown>;
      const posterFile = str(r.poster) ?? (kind === 'video' ? file.replace(/\.[^.]+$/, '.poster.webp') : undefined);
      return {
        src: `/showcase/${file}`,
        kind,
        feature: str(r.feature) ?? file.replace(/[-.].*$/, ''),
        theme: (r.theme === 'light' ? 'light' : 'dark') as Theme,
        width: num(r.width, 1080),
        height: num(r.height, 2400),
        caption: str(cap[lang]) ?? str(cap.en) ?? '',
        lang: r.lang === 'zh' || r.lang === 'en' ? (r.lang as Lang) : undefined,
        posterFile: posterFile && !posterFile.includes('/') && (await exists(posterFile)) ? posterFile : undefined,
      };
    }),
  );
  const items = checked.filter((x) => x !== null);
  return items.map(({ posterFile, ...m }) => {
    if (m.kind !== 'video') return m;
    if (posterFile) return { ...m, poster: `/showcase/${posterFile}` };
    const still = items.find((x) => x.kind === 'image' && x.feature === m.feature && x.theme === m.theme);
    return still ? { ...m, poster: still.src } : m;
  });
}

/**
 * The best capture for one of `features` (in order of preference), as a dark/light pair. Videos
 * win over stills when `preferVideo`. The light slot falls back to the dark capture (the app's
 * reference theme), so a light page still shows the real app rather than nothing.
 */
export function pick(
  all: ShowcaseMedia[],
  lang: Lang,
  features: string[],
  { preferVideo = false, exclude = [] as string[] } = {},
): { dark: ShowcaseMedia; light?: ShowcaseMedia } | undefined {
  // Captures in the page's language when there are any, else the other language's.
  const inLang = all.filter((m) => (m.lang ?? 'en') === lang);
  const fallback = all.filter((m) => (m.lang ?? 'en') !== lang);
  for (const f of features) {
    const of = (list: ShowcaseMedia[]) => list.filter((m) => m.feature === f && !exclude.includes(m.src));
    const pool = of(inLang).length > 0 ? of(inLang) : of(fallback);
    if (pool.length === 0) continue;
    const order = (m: ShowcaseMedia) => (preferVideo ? (m.kind === 'video' ? 0 : 1) : m.kind === 'image' ? 0 : 1);
    const sorted = [...pool].sort((a, b) => order(a) - order(b));
    const dark = sorted.find((m) => m.theme === 'dark') ?? sorted[0];
    const light = sorted.find((m) => m.theme === 'light' && m.kind === dark.kind);
    return { dark, light };
  }
  return undefined;
}
