import { notFound } from 'next/navigation';
import { getPageMarkdownUrl } from '@/lib/shared';
import { docsLlms, source } from '@/lib/source';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params;
  // drop the appended "content.md"; `/docs/index.md` means the root page
  const slugs = slug?.slice(0, -1) ?? [];
  if (slugs.length === 1 && slugs[0] === 'index') slugs.pop();
  const page = source.getPage(slugs);
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageMarkdownUrl(page).segments,
  }));
}
