import '@/components/landing/landing.css';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { SiteFooter } from '@/components/landing/footer';
import { toLang } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';

export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const lang = toLang((await params).lang);
  const base = baseOptions(lang);
  return (
    <div className="lp-canvas flex flex-1 flex-col bg-[var(--color-lp-canvas)]">
      <HomeLayout {...base} nav={{ ...base.nav, transparentMode: 'top' }}>
        {children}
        <SiteFooter lang={lang} />
      </HomeLayout>
    </div>
  );
}
