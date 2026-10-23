import type { Lang } from '@/lib/i18n';
import * as common from './common';

/**
 * UI strings for pages outside the docs (the docs themselves are MDX per language). One file per
 * area, each exporting `en` (defines the shape) and `zh: typeof en`. Add an area by importing it here.
 */
const messages = {
  en: { ...common.en },
  zh: { ...common.zh },
} satisfies Record<Lang, unknown>;

export type Messages = (typeof messages)['en'];

export function t(lang: Lang): Messages {
  return messages[lang];
}
