import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PluginDetail } from '@/components/marketplace/plugin-detail';
import { RepoPage } from '@/components/marketplace/repo-page';
import { getMarketplaceIndex, getPlugin, getRepoPlugins } from '@/lib/marketplace';

export const revalidate = 3600;

const SEG = /^[A-Za-z0-9._-]{1,100}$/;

export async function generateStaticParams() {
  const index = await getMarketplaceIndex();
  return index.plugins.map((p) => ({ slug: p.slug.split('/') }));
}

export async function generateMetadata({ params }: PageProps<'/marketplace/[...slug]'>): Promise<Metadata> {
  const { slug } = await params;
  if (slug.length === 3) {
    const p = await getPlugin(slug.join('/'));
    if (!p) return {};
    return {
      title: `${p.name}${p.nameEn ? ` · ${p.nameEn}` : ''} — 插件市场`,
      description: p.descriptionEn ? `${p.description} ${p.descriptionEn}` : p.description,
    };
  }
  return { title: `${slug.join('/')} — 插件市场` };
}

export default async function Page({ params }: PageProps<'/marketplace/[...slug]'>) {
  const { slug } = await params;
  if (slug.length > 3 || !slug.every((s) => SEG.test(s))) notFound();

  if (slug.length === 3) {
    const plugin = await getPlugin(slug.join('/'));
    if (!plugin) notFound();
    const siblings = (await getRepoPlugins(slug[0], slug[1])).filter((p) => p.slug !== plugin.slug);
    return <PluginDetail plugin={plugin} siblings={siblings} />;
  }

  const [owner, repo] = slug;
  const plugins = await getRepoPlugins(owner, repo);
  const index = await getMarketplaceIndex();
  const source = repo
    ? index.sources.find((s) => s.repo.toLowerCase() === `${owner}/${repo}`.toLowerCase())
    : undefined;
  if (!plugins.length && !source) notFound();
  return <RepoPage owner={owner} repo={repo} plugins={plugins} source={source} />;
}
