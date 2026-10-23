import { generateOGImage } from 'fumadocs-ui/og';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { appName, getPageImageUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[lang]/[...slug]'>) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const page = source.getPage(slug.slice(0, -1), lang);
  if (!page) notFound();

  return generateOGImage({
    title: page.data.title,
    description: page.data.description,
    site: appName,
  });
}

export function generateStaticParams() {
  return source
    .getLanguages()
    .flatMap(({ language, pages }) => pages.map((page) => ({ lang: language, slug: getPageImageUrl(page).segments })));
}
