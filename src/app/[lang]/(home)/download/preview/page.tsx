import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DownloadView } from '@/components/landing/download/download-view';
import { toLang } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { normalizeReleases, PREVIEW_RELEASES } from '@/lib/releases';

export async function generateMetadata({ params }: PageProps<'/[lang]/download/preview'>): Promise<Metadata> {
  return { title: t(toLang((await params).lang)).download.meta.previewTitle, robots: { index: false } };
}

/** Development only: the download page with demo data (two releases, notes with a checksum). */
export default async function DownloadPreviewPage({ params }: PageProps<'/[lang]/download/preview'>) {
  if (process.env.NODE_ENV === 'production') notFound();
  const lang = toLang((await params).lang);
  return <DownloadView data={{ releases: normalizeReleases(PREVIEW_RELEASES) }} lang={lang} preview />;
}
