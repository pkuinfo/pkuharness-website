import type { Metadata } from 'next';
import { MarketplaceBrowser } from '@/components/marketplace/browser';
import { MarketplaceHero } from '@/components/marketplace/hero';
import { HowListingWorks } from '@/components/marketplace/how-it-works';
import { getMarketplaceIndex } from '@/lib/marketplace';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '插件市场 · Plugin marketplace',
  description:
    'Every PKU Harness capability is a plugin. Browse official and community plugins, see exactly what each one can do, and add remote MCP plugins to the app.',
  alternates: { types: { 'application/json': '/marketplace.json', 'text/markdown': '/marketplace/llms.txt' } },
};

export default async function MarketplacePage() {
  const index = await getMarketplaceIndex();
  const community = index.plugins.filter((p) => !p.official);
  const failed = index.sources.filter((s) => s.error && s.plugins === 0);
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 md:px-6">
      <MarketplaceHero
        stats={{
          official: index.plugins.length - community.length,
          community: community.length,
          repos: new Set(index.plugins.map((p) => p.repo)).size,
          generatedAt: index.generatedAt,
        }}
      />
      {failed.some((s) => s.repo === 'pkuinfo/pku-harness-plugins') && (
        <p className="mb-4 rounded-lg border border-pku-amber/30 bg-pku-amber/10 px-4 py-3 text-sm">
          暂时无法从 GitHub 读取官方插件列表，稍后会自动重试。
        </p>
      )}
      <MarketplaceBrowser plugins={index.plugins} />
      <HowListingWorks />
    </div>
  );
}
