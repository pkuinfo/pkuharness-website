import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Lang } from '@/lib/i18n';

/**
 * The Terms of Service and Privacy Policy. `content/legal/*.md` are copies of `docs/legal/*.md`
 * in pkuinfo/pku-harness, which the app bundles; change both together. Read at build time.
 */
export type LegalDoc = 'terms' | 'privacy';

export async function legalDocument(doc: LegalDoc, lang: Lang) {
  const text = await readFile(
    path.join(process.cwd(), 'content/legal', `${doc}.${lang === 'en' ? 'en' : 'zh'}.md`),
    'utf8',
  );
  const [, title = '', body = text] = /^# (.+)\n+([\s\S]*)$/.exec(text) ?? [];
  return { title, body };
}
