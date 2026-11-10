import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '@/components/legal-page';
import { toLang } from '@/lib/i18n';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: PageProps<'/[lang]/privacy'>): Promise<Metadata> {
  return legalMetadata('privacy', toLang((await params).lang));
}

export default async function PrivacyPage({ params }: PageProps<'/[lang]/privacy'>) {
  return <LegalPage doc="privacy" lang={toLang((await params).lang)} />;
}
