import { Markdown } from 'fumadocs-core/content/md';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import type { Metadata } from 'next';
import type { Lang } from '@/lib/i18n';
import { type LegalDoc, legalDocument } from '@/lib/legal';

export async function legalMetadata(doc: LegalDoc, lang: Lang): Promise<Metadata> {
  const { title } = await legalDocument(doc, lang);
  return { title, alternates: { languages: { 'zh-CN': `/${doc}`, en: `/en/${doc}` } } };
}

/** A long legal text set as readable prose (one column, ~70 characters a line). */
export async function LegalPage({ doc, lang }: { doc: LegalDoc; lang: Lang }) {
  const { title, body } = await legalDocument(doc, lang);
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 pt-14 pb-24 md:px-8 md:pt-20">
      <h1 className="text-balance font-semibold text-3xl tracking-tight md:text-4xl">{title}</h1>
      <div className="prose mt-8 max-w-none text-[15px] leading-7 dark:prose-invert prose-headings:font-semibold prose-h2:mt-10 prose-h2:text-xl">
        <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
      </div>
    </main>
  );
}
