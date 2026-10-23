import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { github, repos } from '@/lib/shared';

function columns(lang: Lang): { title: string; links: { label: string; href: string }[] }[] {
  const m = t(lang);
  return [
    {
      title: m.footer.product,
      links: [
        { label: m.nav.download, href: localePath(lang, '/download') },
        { label: m.nav.marketplace, href: localePath(lang, '/marketplace') },
        { label: m.nav.docs, href: localePath(lang, '/docs') },
      ],
    },
    {
      title: m.footer.source,
      links: [
        { label: 'pku-harness', href: github(repos.app) },
        { label: 'pku-harness-plugins', href: github(repos.plugins) },
        { label: 'pkucli', href: github(repos.pkucli) },
        { label: m.footer.thisSite, href: github(repos.website) },
      ],
    },
    {
      title: m.footer.community,
      links: [
        { label: m.footer.org, href: repos.org },
        { label: m.footer.issues, href: `${github(repos.app)}/issues` },
        { label: m.footer.contributing, href: `${github(repos.app)}/blob/HEAD/CONTRIBUTING.md` },
        { label: m.footer.security, href: `${github(repos.app)}/blob/HEAD/SECURITY.md` },
      ],
    },
  ];
}

export function SiteFooter({ lang }: { lang: Lang }) {
  const m = t(lang).footer;
  return (
    <footer className="mt-auto border-fd-border border-t">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-8">
        <div>
          <Link href={localePath(lang, '/')} className="inline-flex items-center gap-2.5 font-semibold">
            <Logo size={28} />
            PKU Harness
          </Link>
          <p className="mt-4 max-w-xs text-fd-muted-foreground text-sm leading-relaxed">{m.tagline}</p>
        </div>
        {columns(lang).map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-medium text-sm">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-fd-muted-foreground text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith('/') ? (
                    <Link href={l.href} className="transition-colors hover:text-fd-foreground">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="transition-colors hover:text-fd-foreground">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap justify-between gap-2 border-fd-border border-t px-5 py-6 text-fd-muted-foreground text-xs md:px-8">
        <span>{m.license}</span>
        <span>{m.disclaimer}</span>
      </div>
    </footer>
  );
}
