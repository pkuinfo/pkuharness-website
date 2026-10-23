import { getMarketplaceIndex } from '@/lib/marketplace';
import { marketplaceLlms } from '@/lib/marketplace/render';
import { siteUrl } from '@/lib/shared';

export const revalidate = 3600;

/** Markdown list of every plugin, for agents. */
export async function GET() {
  return new Response(marketplaceLlms(await getMarketplaceIndex(), siteUrl), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
