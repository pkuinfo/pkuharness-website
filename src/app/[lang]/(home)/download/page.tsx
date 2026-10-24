import type { Metadata } from 'next';
import { DownloadView } from '@/components/landing/download/download-view';
import { toLang } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { getReleases } from '@/lib/releases';

export const revalidate = 600;

export async function generateMetadata({ params }: PageProps<'/[lang]/download'>): Promise<Metadata> {
  const m = t(toLang((await params).lang)).download.meta;
  return {
    title: m.title,
    description: m.description,
    alternates: { languages: { 'zh-CN': '/download', en: '/en/download' } },
  };
}

export default async function DownloadPage({ params }: PageProps<'/[lang]/download'>) {
  const lang = toLang((await params).lang);
  const data = await getReleases();
  return <DownloadView data={data} lang={lang} />;
}
