import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PluginDetail } from '@/components/marketplace/plugin-detail';
import { RepoPage } from '@/components/marketplace/repo-page';
import { toLang } from '@/lib/i18n';
import { getMarketplaceIndex, getPlugin, getRepoPlugins } from '@/lib/marketplace';
import { pluginDescription, pluginName } from '@/lib/marketplace/labels';
import { t } from '@/lib/messages';

export const revalidate = 3600;

const SEG = /^[A-Za-z0-9._-]{1,100}$/;

/** Runs once per language from the [lang] layout, so every plugin page exists in zh and en. */
export async function generateStaticParams() {
  const index = await getMarketplaceIndex();
  return index.plugins.map((p) => ({ slug: p.slug.split('/') }));
}

export async function generateMetadata({ params }: PageProps<'/[lang]/marketplace/[...slug]'>): Promise<Metadata> {
  const { slug, lang: raw } = await params;
  const lang = toLang(raw);
  const suffix = t(lang).marketplace.meta.suffix;
  const path = slug.join('/');
  const alternates = { languages: { 'zh-CN': `/marketplace/${path}`, en: `/en/marketplace/${path}` } };
  if (slug.length === 3) {
    const p = await getPlugin(path);
    if (!p) return {};
    return {
      title: `${pluginName(p, lang)} · ${suffix}`,
      description: pluginDescription(p, lang).text,
      alternates,
    };
  }
  return { title: `${path} · ${suffix}`, alternates };
}

export default async function Page({ params }: PageProps<'/[lang]/marketplace/[...slug]'>) {
  const { slug, lang: raw } = await params;
  const lang = toLang(raw);
  if (slug.length > 3 || !slug.every((s) => SEG.test(s))) notFound();

  if (slug.length === 3) {
    const plugin = await getPlugin(slug.join('/'));
    if (!plugin) notFound();
    const siblings = (await getRepoPlugins(slug[0], slug[1])).filter((p) => p.slug !== plugin.slug);
    return <PluginDetail plugin={plugin} siblings={siblings} lang={lang} />;
  }

  const [owner, repo] = slug;
  const plugins = await getRepoPlugins(owner, repo);
  const index = await getMarketplaceIndex();
  const source = repo
    ? index.sources.find((s) => s.repo.toLowerCase() === `${owner}/${repo}`.toLowerCase())
    : undefined;
  if (!plugins.length && !source) notFound();
  return <RepoPage owner={owner} repo={repo} plugins={plugins} source={source} lang={lang} />;
}
