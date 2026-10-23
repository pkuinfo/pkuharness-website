/*
 * Server-side entry: the cached marketplace index for pages, /marketplace.json and llms.txt.
 *
 * Caching (Next 16 without Cache Components, which this site doesn't enable): every GitHub
 * request goes through the fetch Data Cache with `revalidate: 3600` and the `marketplace` tag;
 * pages and route handlers export `revalidate = 3600` (ISR). React `cache` dedupes per request.
 */

import { cache } from 'react';
import sourcesJson from '../../../data/sources.json';
import { buildIndex } from './build';
import { sourcesFile } from './schema';
import type { MarketplaceIndex, MarketplacePlugin } from './types';

export const MARKETPLACE_REVALIDATE = 3600;
export const MARKETPLACE_TAG = 'marketplace';

export const sources = sourcesFile.parse(sourcesJson);

export const getMarketplaceIndex = cache(async (): Promise<MarketplaceIndex> => {
  const { index } = await buildIndex(sources, {
    token: process.env.GITHUB_TOKEN,
    init: { next: { revalidate: MARKETPLACE_REVALIDATE, tags: [MARKETPLACE_TAG] } },
  });
  return index;
});

export async function getPlugin(slug: string): Promise<MarketplacePlugin | undefined> {
  const index = await getMarketplaceIndex();
  const s = slug.toLowerCase();
  return index.plugins.find((p) => p.slug === s);
}

/** Plugins found in one repo (owner/repo), or by one owner when `repo` is omitted. */
export async function getRepoPlugins(owner: string, repo?: string): Promise<MarketplacePlugin[]> {
  const index = await getMarketplaceIndex();
  const o = owner.toLowerCase();
  const r = repo?.toLowerCase();
  return index.plugins.filter((p) => {
    const [po, pr] = p.slug.split('/');
    return po === o && (!r || pr === r);
  });
}

export type { MarketplaceIndex, MarketplacePlugin, MarketplaceSource } from './types';
