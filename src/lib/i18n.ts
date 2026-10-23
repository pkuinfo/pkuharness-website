import { defineI18n } from 'fumadocs-core/i18n';

/**
 * Site languages (https://fumadocs.dev/docs/internationalization/next). Chinese is the default and
 * has no prefix (`/docs`); English lives under `/en` (`/en/docs`). Content files use the dot parser:
 * `page.mdx` is Chinese, `page.en.mdx` English. A page missing in Chinese falls back to English.
 */
export const i18n = defineI18n({
  defaultLanguage: 'zh',
  languages: ['zh', 'en'],
  hideLocale: 'default-locale',
  fallbackLanguage: 'en',
  parser: 'dot',
});

export type Lang = (typeof i18n.languages)[number];

export function isLang(value: string | undefined): value is Lang {
  return value === 'zh' || value === 'en';
}

export function toLang(value: string | undefined): Lang {
  return isLang(value) ? value : 'zh';
}

/** Locale-aware internal href: `localePath('en', '/docs')` → `/en/docs`, `localePath('zh', '/docs')` → `/docs`. */
export function localePath(lang: Lang, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (lang === i18n.defaultLanguage) return p;
  return p === '/' ? `/${lang}` : `/${lang}${p}`;
}

/** BCP 47 tag for <html lang> and Intl. */
export const htmlLang: Record<Lang, string> = { zh: 'zh-CN', en: 'en' };
