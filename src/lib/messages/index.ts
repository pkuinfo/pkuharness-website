import type { Lang } from '@/lib/i18n';
import * as common from './common';
import * as download from './download';
import * as home from './home';
import * as marketplace from './marketplace';

/**
 * UI strings for pages outside the docs (the docs themselves are MDX per language). One file per
 * area, each exporting `en` (defines the shape) and `zh: typeof en`.
 */
const messages = {
  en: { ...common.en, home: home.en, marketplace: marketplace.en, download: download.en },
  zh: { ...common.zh, home: home.zh, marketplace: marketplace.zh, download: download.zh },
} satisfies Record<Lang, unknown>;

export type Messages = (typeof messages)['en'];

export function t(lang: Lang): Messages {
  return messages[lang];
}
