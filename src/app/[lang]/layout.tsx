import { i18nProvider } from 'fumadocs-ui/i18n';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { htmlLang, i18n, isLang } from '@/lib/i18n';
import { translations } from '@/lib/layout.shared';
import { t } from '@/lib/messages';
import { appName, siteUrl } from '@/lib/shared';
import '../global.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  const site = t(isLang(lang) ? lang : 'zh').site;
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: site.title,
      template: `%s | ${appName}`,
    },
    description: site.description,
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
