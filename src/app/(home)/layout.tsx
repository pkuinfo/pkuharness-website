import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { SiteFooter } from '@/components/landing/footer';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/'>) {
  const base = baseOptions();
  return (
    <HomeLayout {...base} nav={{ ...base.nav, transparentMode: 'top' }}>
      {children}
      <SiteFooter />
    </HomeLayout>
  );
}
