import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { isMarkdownPreferred } from 'fumadocs-core/negotiation';
import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server';
import { i18n } from '@/lib/i18n';
import { docsContentRoute } from '@/lib/shared';

const i18nMiddleware = createI18nMiddleware(i18n);

/** `/docs/x`, `/en/docs/x` (+ optional `.md`) → lang and slug path. */
const DOCS = /^(?:\/(en|zh))?\/docs(\/.*?)?(\.md)?\/?$/;

/** Paths served by route handlers or static files: never localized. */
const PASSTHROUGH =
  /^\/(api|_next|og|llms|schema|marketplace\.json|marketplace\/llms\.txt|updates)(\/|\.|$)|\.[a-z0-9]+$/i;

function markdown(lang: string, rest: string | undefined) {
  const path = !rest || rest === '/' || rest === '/index' ? '' : rest;
  return `${docsContentRoute}/${lang}${path}/content.md`;
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const docs = DOCS.exec(pathname);
  if (docs) {
    const [, lang = i18n.defaultLanguage, rest, md] = docs;
    // Markdown for agents: `/docs/x.md`, or `Accept: text/markdown` on the page URL.
    if (md) return NextResponse.rewrite(new URL(markdown(lang, rest), request.nextUrl));
    if (isMarkdownPreferred(request))
      return NextResponse.rewrite(new URL(markdown(lang, rest), request.nextUrl), { headers: { Vary: 'Accept' } });
  }
  if (PASSTHROUGH.test(pathname)) return NextResponse.next();
  return i18nMiddleware(request, event);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
