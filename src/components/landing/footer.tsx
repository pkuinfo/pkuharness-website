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

/**
 * Site footer. The oversized wordmark along the bottom edge follows 21st.dev:
 * arihantcodes/large-name-footer; here it is set in the page's own type, cut off by the page edge
 * and kept faint so it reads as a sign-off, not a headline.
 */
export function SiteFooter({ lang }: { lang: Lang }) {
  const m = t(lang).footer;
  return (
    <footer className="relative mt-auto overflow-hidden border-fd-border border-t">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-x-6 gap-y-10 px-4 pt-16 pb-12 sm:grid-cols-3 md:grid-cols-[1.5fr_repeat(3,1fr)] md:px-8">
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <Link
            href={localePath(lang, '/')}
            className="inline-flex items-center gap-2.5 rounded-[8px] font-semibold focus-visible:outline-2 focus-visible:outline-fd-ring"
          >
            <Logo size={28} />
            PKU Harness
          </Link>
          <p className="mt-4 max-w-xs text-pretty text-fd-muted-foreground text-sm leading-relaxed">{m.tagline}</p>
        </div>
        {columns(lang).map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-medium text-sm">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-fd-muted-foreground text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith('/') ? (
                    <Link
                      href={l.href}
                      className="rounded-[4px] transition-colors hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-fd-ring"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      className="rounded-[4px] transition-colors hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-fd-ring"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 text-fd-muted-foreground text-xs leading-relaxed md:flex-row md:justify-between md:gap-8 md:px-8">
        <span>{m.license}</span>
        <span className="md:text-end">{m.disclaimer}</span>
      </div>
      <p
        aria-hidden="true"
        className="pointer-events-none mt-6 -mb-[0.24em] select-none whitespace-nowrap text-center font-bold text-[15.5vw] text-fd-foreground/[0.06] leading-[0.9] tracking-[-0.04em] min-[1440px]:text-[14rem]"
      >
        PKU Harness
      </p>
    </footer>
  );
}
