import { getMarketplaceIndex } from '@/lib/marketplace';

export const revalidate = 3600;

/** The whole marketplace index, for the app and for agents. Shape: `MarketplaceIndex`. */
export async function GET() {
  const index = await getMarketplaceIndex();
  return Response.json(index, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  });
}
