import { highlight } from 'fumadocs-core/highlight';
import { ArrowUpRight, BookOpen, Store } from 'lucide-react';
import Link from 'next/link';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { github, repos } from '@/lib/shared';
import { GitHubIcon, Section, SectionHeading } from './bits';
import { CodeTabs } from './code-tabs';

/** pku-harness-plugins/plugins/classrooms/PLUGIN.md (2026-10-23); description, i18n, commands and instructions trimmed. */
const MANIFEST = `---
spec: 1
id: classrooms
name: 空闲教室
description: 查各教学楼今天到后天每节课的空闲教室，找自习室。
version: 0.2.0
author: pkuinfo
icon: building
network: [portal.pku.edu.cn]
tools:
  free: tools/free.yaml
  overview: tools/overview.yaml
widgets:
  overview: widgets/overview.json
dataSources:
  overview: { title: 各楼空闲教室数, tool: overview, ttl: 10m }
---

空闲教室（公开数据，无需登录）：
- classrooms__free：某栋楼在今天/明天/后天的空闲教室。
- classrooms__overview：各楼现在空闲教室数量，适合先挑楼。`;

/** pku-harness-plugins/plugins/classrooms/tools/overview.yaml (2026-10-23); header comment, one request header and the long description trimmed. */
const TOOL = `title: 各楼空闲教室数
description: 'How many classrooms are free right now in each teaching building.'
effect: read
steps:
  - let: r
    request:
      url: https://portal.pku.edu.cn/publicQuery/classroomQuery/retrClassRoomInfos.do
      headers: { referer: 'https://portal.pku.edu.cn/publicQuery/' }
    as: json
  - check: "r.success && isList(r.rows)"
    error: 教室概况查询未成功
return: |
  {
    buildings: sortBy(
      r.rows.map(x => ({ building: str(x.buildingName ?? ''), free: num(x.classroomFree, 0), total: num(x.classroomSum, 0) })).filter(x => x.building && x.total > 0),
      x => x.free, true),
    source: 'https://portal.pku.edu.cn/publicQuery/#/lifeIndex',
  }`;

function hl(code: string, lang: 'md' | 'yaml') {
  return highlight(code, { lang, themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false });
}

export async function Developers({ lang }: { lang: Lang }) {
  const m = t(lang).home.developers;
  const [manifest, tool] = await Promise.all([hl(MANIFEST, 'md'), hl(TOOL, 'yaml')]);
  const links = [
    { href: localePath(lang, '/docs/build'), icon: BookOpen, ...m.links.docs },
    { href: localePath(lang, '/marketplace'), icon: Store, ...m.links.marketplace },
    { href: github(repos.plugins), icon: GitHubIcon, ...m.links.repo },
  ];
  return (
    <Section labelledBy="dev-title" className="py-16 md:py-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
        <div>
          <SectionHeading id="dev-title" title={m.title}>
            <p>{m.lead}</p>
          </SectionHeading>
          <ul className="mt-10 grid max-w-[34rem] gap-1">
            {links.map((l) => {
              const inner = (
                <>
                  <l.icon className="size-5 shrink-0 text-fd-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{l.title}</span>
                    <span className="block text-fd-muted-foreground text-sm">{l.sub}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-fd-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </>
              );
              const cls =
                'group -mx-4 flex items-center gap-4 rounded-[12px] px-4 py-3 transition-colors duration-150 hover:bg-fd-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-fd-ring';
              return (
                <li key={l.href}>
                  {l.href.startsWith('/') ? (
                    <Link href={l.href} className={cls}>
                      {inner}
                    </Link>
                  ) : (
                    <a href={l.href} className={cls}>
                      {inner}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <CodeTabs
            label={m.codeLabel}
            tabs={[
              { id: 'manifest', label: 'PLUGIN.md', file: 'plugins/classrooms/PLUGIN.md', node: manifest },
              { id: 'tool', label: 'tools/overview.yaml', file: 'plugins/classrooms/tools/overview.yaml', node: tool },
            ]}
          />
          <p className="mt-4 text-fd-muted-foreground text-sm">{m.note}</p>
        </div>
      </div>
    </Section>
  );
}
