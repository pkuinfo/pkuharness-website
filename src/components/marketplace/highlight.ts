/** Server only: Shiki is large, keep it out of client bundles. */
import { codeToHtml } from 'shiki';

/** Shiki HTML with light and dark colours as CSS variables (fumadocs' shiki.css picks per theme). */
export function highlight(code: string, lang: 'yaml' | 'json' | 'markdown' | 'bash') {
  return codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
}
