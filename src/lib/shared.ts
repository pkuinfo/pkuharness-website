import { createGetUrl } from 'fumadocs-core/source';

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

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
