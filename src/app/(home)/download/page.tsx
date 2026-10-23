import type { Metadata } from 'next';
import { DownloadView } from '@/components/landing/download/download-view';
import { getReleases } from '@/lib/releases';
import '@/components/landing/landing.css';

export const revalidate = 600;

export const metadata: Metadata = {
  title: '下载 · Download',
  description:
    '下载 PKU Harness Android 版，或从源码构建。Download the PKU Harness APK for Android, or build it from source.',
};

export default async function DownloadPage() {
  const data = await getReleases();
  return <DownloadView data={data} />;
}
