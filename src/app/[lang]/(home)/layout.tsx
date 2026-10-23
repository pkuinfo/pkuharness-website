import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { SiteFooter } from '@/components/landing/footer';
import { toLang } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';

export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const lang = toLang((await params).lang);
  const base = baseOptions(lang);
  return (
    <HomeLayout {...base} nav={{ ...base.nav, transparentMode: 'top' }}>
      {children}
      <SiteFooter lang={lang} />
    </HomeLayout>
  );
}
