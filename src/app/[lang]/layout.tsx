import { i18nProvider } from 'fumadocs-ui/i18n';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { htmlLang, i18n, isLang } from '@/lib/i18n';
import { translations } from '@/lib/layout.shared';
import { appName, siteUrl } from '@/lib/shared';
import '../global.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

const descriptions = {
  zh: '北大校园生活的 AI 原生 App。登录一次，课表、校园卡、树洞、教学网……每项校园服务都是一个插件，由你手机上的助手代劳。',
  en: 'An open-source, AI-native app for campus life at Peking University. Log in once; every campus service is a plugin your on-device agent can use.',
};

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  const l = isLang(lang) ? lang : 'zh';
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default:
        l === 'zh' ? `${appName}：北大校园生活的 AI 原生 App` : `${appName}: the AI-native app for campus life at PKU`,
      template: `%s | ${appName}`,
    },
    description: descriptions[l],
    alternates: { languages: { 'zh-CN': '/', en: '/en' } },
  };
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html
      lang={htmlLang[lang]}
      className={`${inter.className} ${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider i18n={i18nProvider(translations, lang)} theme={{ defaultTheme: 'dark' }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
