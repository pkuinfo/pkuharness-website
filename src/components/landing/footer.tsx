import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { github, repos } from '@/lib/shared';

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: '产品',
    links: [
      { label: '下载', href: '/download' },
      { label: '插件市场', href: '/marketplace' },
      { label: '文档', href: '/docs' },
    ],
  },
  {
    title: '源代码',
    links: [
      { label: 'pku-harness', href: github(repos.app) },
      { label: 'pku-harness-plugins', href: github(repos.plugins) },
      { label: 'pkucli', href: github(repos.pkucli) },
      { label: '本网站', href: github(repos.website) },
    ],
  },
  {
    title: '社区',
    links: [
      { label: 'GitHub 组织', href: repos.org },
      { label: '提交问题', href: `${github(repos.app)}/issues` },
      { label: '参与贡献', href: `${github(repos.app)}/blob/HEAD/CONTRIBUTING.md` },
      { label: '安全问题', href: `${github(repos.app)}/blob/HEAD/SECURITY.md` },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-fd-border border-t">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 font-semibold">
            <Logo size={28} />
            PKU Harness
          </Link>
          <p className="mt-4 max-w-xs text-fd-muted-foreground text-sm leading-relaxed">
            北大校园生活的 AI 原生 App。
            <br />
            An open-source, AI-native app for campus life at Peking University.
          </p>
        </div>
        {columns.map((col) => (
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
        <span>MIT License. 由 pkuinfo 社区开发和维护。</span>
        <span>学生社区开源项目，非北京大学官方产品。“北京大学”名称与标识归北京大学所有。</span>
      </div>
    </footer>
  );
}
