import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { openapiPlugin } from 'fumadocs-openapi/server';
import { i18n } from './i18n';
import { parseAPIPageElement, renderOpenAPIMarkdown } from './openapi';
import { docsRoute } from './shared';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  i18n,
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  // openapiPlugin: method badges for the generated Cloud API pages in the sidebar.
  plugins: [lucideIconsPlugin(), openapiPlugin()],
});

type DocsPage = ReturnType<typeof source.getPages>[number];

/** Page body as Markdown. Generated API pages are interactive UI, so render their operations as text. */
async function pageMarkdown(page: DocsPage): Promise<string> {
  if (page.data._openapi) {
    const element = parseAPIPageElement(await page.data.getText('raw'));
    if (element) return renderOpenAPIMarkdown(element.document, element.operations);
  }
  return page.data.getText('processed');
}

export const docsLlms = llms(source, {
  renderPage: async (page) => {
    const description = page.data.description ? `> ${page.data.description}\n\n` : '';
    return `# ${page.data.title} (${page.url})\n\n${description}${await pageMarkdown(page)}`;
  },
});
