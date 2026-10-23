import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { getPageMarkdownUrl } from '@/lib/shared';
import { docsLlms, source } from '@/lib/source';

export const revalidate = false;

/** Markdown of one docs page. Reached through the proxy: `/docs/x.md`, `/en/docs/x.md`, or `Accept: text/markdown`. */
export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[lang]/[[...slug]]'>) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  // drop the appended "content.md"; `/docs/index.md` means the root page
  const slugs = slug?.slice(0, -1) ?? [];
  if (slugs.length === 1 && slugs[0] === 'index') slugs.pop();
  const page = source.getPage(slugs, lang);
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}

export function generateStaticParams() {
  return source
    .getLanguages()
    .flatMap(({ language, pages }) =>
      pages.map((page) => ({ lang: language, slug: getPageMarkdownUrl(page).segments })),
    );
}
