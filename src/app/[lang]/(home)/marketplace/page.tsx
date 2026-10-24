import { TriangleAlert } from 'lucide-react';
import type { Metadata } from 'next';
import { MarketplaceBrowser } from '@/components/marketplace/browser';
import { MarketplaceHero } from '@/components/marketplace/hero';
import { HowListingWorks } from '@/components/marketplace/how-it-works';
import { toLang } from '@/lib/i18n';
import { getMarketplaceIndex } from '@/lib/marketplace';
import { t } from '@/lib/messages';

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<'/[lang]/marketplace'>): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const m = t(lang).marketplace.meta;
  return {
    title: m.title,
    description: m.description,
    alternates: {
      languages: { 'zh-CN': '/marketplace', en: '/en/marketplace' },
      types: { 'application/json': '/marketplace.json', 'text/markdown': '/marketplace/llms.txt' },
    },
  };
}

export default async function MarketplacePage({ params }: PageProps<'/[lang]/marketplace'>) {
  const lang = toLang((await params).lang);
  const index = await getMarketplaceIndex();
  const officialDown = index.sources.some(
    (s) => s.repo === 'pkuinfo/pku-harness-plugins' && s.error && s.plugins === 0,
  );
  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-24 md:px-8">
      <MarketplaceHero
        lang={lang}
        stats={{
          plugins: index.plugins.length,
          repos: new Set(index.plugins.map((p) => p.repo)).size,
          generatedAt: index.generatedAt,
        }}
      />
      {officialDown && (
        <p className="mt-6 flex items-start gap-2 rounded-xl border border-pku-amber/30 bg-pku-amber/10 px-4 py-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-pku-gold dark:text-pku-amber" aria-hidden="true" />
          {t(lang).marketplace.browse.officialUnreachable}
        </p>
      )}
      <MarketplaceBrowser plugins={index.plugins} lang={lang} />
      <HowListingWorks lang={lang} />
    </div>
  );
}
