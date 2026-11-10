import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '@/components/legal-page';
import { toLang } from '@/lib/i18n';

export const dynamic = 'force-static';

export async function generateMetadata({ params }: PageProps<'/[lang]/terms'>): Promise<Metadata> {
  return legalMetadata('terms', toLang((await params).lang));
}

export default async function TermsPage({ params }: PageProps<'/[lang]/terms'>) {
  return <LegalPage doc="terms" lang={toLang((await params).lang)} />;
}
