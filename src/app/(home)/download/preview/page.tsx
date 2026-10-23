import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DownloadView } from '@/components/landing/download/download-view';
import { normalizeReleases, PREVIEW_RELEASES } from '@/lib/releases';
import '@/components/landing/landing.css';

export const metadata: Metadata = { title: '下载（预览）', robots: { index: false } };

/** Development only: the download page as it will look once releases exist (demo data). */
export default function DownloadPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <DownloadView data={{ releases: normalizeReleases(PREVIEW_RELEASES) }} />;
}
