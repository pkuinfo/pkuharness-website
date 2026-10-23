import { FileJson, GitPullRequestArrow, RefreshCw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    icon: FileJson,
    title: '写一个 PLUGIN.md',
    en: 'Add a PLUGIN.md',
    body: (
      <>
        每个插件一个文件夹，放一个 <code>PLUGIN.md</code>：YAML 写声明，正文写给 AI 的说明。一个仓库可以有任意多个插件。
      </>
    ),
  },
  {
    icon: GitPullRequestArrow,
    title: '提交仓库',
    en: 'Submit the repo',
    body: <>粘贴 GitHub 地址，实时预览检测结果；提交后自动开 issue，机器人扫描并发起收录 PR。</>,
  },
  {
    icon: RefreshCw,
    title: '推送即更新',
    en: 'Push to update',
    body: <>市场每小时重新扫描已收录的仓库。改清单、加插件、删插件，push 就好。</>,
  },
  {
    icon: ShieldCheck,
    title: '人工审核',
    en: 'Get verified',
    body: <>维护者读过源码后标记「已审核」。未审核的插件同样可以添加，页面上会标明「社区」。</>,
  },
];

export function HowListingWorks() {
  return (
    <section className="mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-wider text-fd-muted-foreground">HOW LISTING WORKS</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">仓库即插件源</h2>
        </div>
        <div className="flex gap-4 font-mono text-xs text-fd-muted-foreground">
          <Link href="/marketplace.json" className="hover:text-fd-foreground">
            marketplace.json
          </Link>
          <Link href="/marketplace/llms.txt" className="hover:text-fd-foreground">
            llms.txt
          </Link>
          <Link href="/docs/marketplace/manifest" className="hover:text-fd-foreground">
            manifest spec →
          </Link>
        </div>
      </div>
      <ol className="mt-8 grid gap-px overflow-hidden rounded-xl border border-fd-border bg-fd-border sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.en} className="bg-fd-card p-5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-fd-foreground">
            <div className="flex items-center justify-between">
              <s.icon className="size-5 text-fd-primary" strokeWidth={1.75} />
              <span className="font-mono text-xs text-fd-muted-foreground">0{i + 1}</span>
            </div>
            <h3 className="mt-4 font-medium">
              {s.title} <span className="font-mono text-xs font-normal text-fd-muted-foreground">{s.en}</span>
            </h3>
            <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
