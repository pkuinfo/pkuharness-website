import { highlight } from 'fumadocs-core/highlight';
import { ArrowUpRight, BookOpen, Store } from 'lucide-react';
import Link from 'next/link';
import { github, repos } from '@/lib/shared';
import { GitHubIcon, Section, SectionHeading } from './bits';
import { CodeTabs } from './code-tabs';

const BUILTIN = `import { definePlugin, defineTool } from '@pku-harness/sdk';
import { z } from 'zod';
import { fetchCrowd } from './api';

export const canteenPlugin = definePlugin({
  id: 'canteen',
  name: '食堂',
  version: '0.1.0',
  icon: 'food',
  requires: ['network'],
  tools: {
    crowd: defineTool({
      title: '食堂人流',
      description: 'Live occupancy of each dining hall.',
      input: z.object({ name: z.string().optional() }),
      effect: 'read',
      execute: async ({ name }, ctx) => {
        const { canteens } = await fetchCrowd(ctx.signal);
        return canteens.filter((c) => !name || c.name.includes(name));
      },
    }),
  },
});`;

const REMOTE = `import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const server = new McpServer({ name: 'my-plugin', version: '0.1.0', title: '我的插件' });

server.registerTool(
  'hello',
  {
    title: '打个招呼',
    description: 'Return a greeting.',
    inputSchema: { name: z.string() },
    annotations: { readOnlyHint: true }, // read-only: no confirmation needed
  },
  async ({ name }) => ({
    content: [{ type: 'text', text: \`你好，\${name}\` }],
  }),
);
// Serve it over Streamable HTTP at /mcp, then add it to registry.json.`;

const DECLARATIVE = `---
spec: 1
id: classrooms
name: 空闲教室
description: 查询各教学楼今天、明天、后天的空闲教室。
version: 1.2.0
author: pkuinfo
network: [portal.pku.edu.cn]
tools:
  free: tools/free.yaml
dataSources:
  overview: { tool: free, args: { day: today }, ttl: 30m }
---

Use \`free\` when the user asks where to study or which rooms are free.
Periods are 1–12 (1 = 08:00). Answer with the building, the room and
the free period ranges.`;

async function hl(code: string, lang: 'ts' | 'md' = 'ts') {
  return highlight(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
}

export async function Developers() {
  const [builtin, remote, declarative] = await Promise.all([hl(BUILTIN), hl(REMOTE), hl(DECLARATIVE, 'md')]);
  const links = [
    { href: '/docs/build', icon: BookOpen, title: '插件开发文档', en: 'Build a plugin' },
    { href: '/marketplace', icon: Store, title: '插件市场', en: 'Marketplace' },
    { href: github(repos.plugins), icon: GitHubIcon, title: 'pku-harness-plugins', en: 'SDK and all plugins' },
  ];
  return (
    <Section labelledBy="dev-title" className="py-24 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <SectionHeading
            id="dev-title"
            title={
              <>
                写一个插件，
                <br />
                接入一项校园服务
              </>
            }
            en="Every campus service is a plugin. Write one."
          >
            <p>
              学校没有开放接口的服务，可以由社区补上。内置插件用 TypeScript 写在 SDK 上，随 App 发布；远程插件是一个 MCP
              服务器，用什么语言写、部署在哪里都可以。两种插件一律平等：同样的权限模型，同样能被助手调用、被放上看板。
            </p>
            <p className="mt-3">
              下一步是声明式插件：一个带 PLUGIN.md 的文件夹，像分享一个 skill 一样，贴一个链接就能安装，不用等 App
              发版。
            </p>
          </SectionHeading>
          <ul className="mt-8 grid gap-2">
            {links.map((l) => {
              const external = !l.href.startsWith('/');
              const inner = (
                <>
                  <l.icon className="size-5 text-fd-muted-foreground" aria-hidden="true" />
                  <span className="flex-1">
                    <span className="font-medium">{l.title}</span>
                    <span className="ms-2 text-fd-muted-foreground text-sm">{l.en}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </>
              );
              const cls =
                'group flex items-center gap-3 rounded-[12px] px-4 py-3 transition-colors hover:bg-fd-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-fd-ring';
              return (
                <li key={l.href}>
                  {external ? (
                    <a href={l.href} className={cls}>
                      {inner}
                    </a>
                  ) : (
                    <Link href={l.href} className={cls}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <CodeTabs
          tabs={[
            { id: 'builtin', label: '内置插件', file: 'plugins/canteen/src/index.ts', node: builtin },
            { id: 'remote', label: '远程 MCP', file: 'templates/remote-plugin/server.ts', node: remote },
            {
              id: 'declarative',
              label: 'PLUGIN.md 预览',
              file: 'classrooms/PLUGIN.md',
              node: declarative,
              note: '声明式插件还在设计，语法可能变化。今天请用内置或远程插件。',
            },
          ]}
        />
      </div>
    </Section>
  );
}
