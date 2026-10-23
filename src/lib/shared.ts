export const appName = 'PKU Harness';
// Empty when unset in CI build args, so treat '' as missing too.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

/** This website's own repo (edit-on-GitHub links). */
export const gitConfig = {
  user: 'pkuinfo',
  repo: 'pkuharness-website',
  branch: 'main',
};

/** The repos the site talks about. */
export const repos = {
  org: 'https://github.com/pkuinfo',
  app: 'pkuinfo/pku-harness',
  plugins: 'pkuinfo/pku-harness-plugins',
  pkucli: 'pkuinfo/pkucli',
  website: `${gitConfig.user}/${gitConfig.repo}`,
} as const;

export const github = (repo: string) => `https://github.com/${repo}`;

/** Markdown of a docs page: public URL (`/docs/x.md`, `/en/docs/x.md`) and the route segments behind it. */
export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const lang = page.locale ?? 'zh';
  const prefix = lang === 'zh' ? '' : `/${lang}`;
  const path = page.slugs.length > 0 ? page.slugs.join('/') : 'index';
  return { segments: [...page.slugs, 'content.md'], lang, url: `${prefix}${docsRoute}/${path}.md` };
}

/** OG image of a docs page, served by `/og/docs/[lang]/[...slug]`. */
export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const lang = page.locale ?? 'zh';
  const segments = [...page.slugs, 'image.png'];
  return { segments, lang, url: `${docsImageRoute}/${lang}/${segments.join('/')}` };
}
