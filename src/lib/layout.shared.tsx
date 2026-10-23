import { zhCN } from '@fumadocs/language/zh-cn';
import { openapiTranslations } from 'fumadocs-openapi/i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Logo } from '@/components/brand/logo';
import { i18n, type Lang, localePath } from './i18n';
import { t } from './messages';
import { appName, gitConfig } from './shared';

/** Fumadocs UI strings: official zh-CN language pack (https://fumadocs.dev/docs/ui/translations). */
export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .extend(openapiTranslations())
  .preset('zh', zhCN())
  .add({
    zh: { displayName: '简体中文' },
    en: { displayName: 'English' },
  });

export function baseOptions(lang: Lang): BaseLayoutProps {
  const m = t(lang).nav;
  return {
    nav: {
      url: localePath(lang, '/'),
      title: (
        <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <Logo size={24} />
          {appName}
        </span>
      ),
    },
    links: [
      { text: m.docs, url: localePath(lang, '/docs'), active: 'nested-url' },
      { text: m.marketplace, url: localePath(lang, '/marketplace'), active: 'nested-url' },
      { text: m.download, url: localePath(lang, '/download') },
    ],
    githubUrl: `https://github.com/${gitConfig.user}`,
  };
}
