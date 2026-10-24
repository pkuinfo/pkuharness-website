import type { Metadata } from 'next';
import Link from 'next/link';
import { highlight } from '@/components/marketplace/highlight';
import { Rich } from '@/components/marketplace/rich';
import { SubmitForm } from '@/components/marketplace/submit-form';
import { localePath, toLang } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { siteUrl } from '@/lib/shared';

const STARTER_MD = `---
spec: 1
id: my-plugin
name: 我的插件
description: 一句话说明它为同学们做什么。
version: 0.1.0
author: your-github-name
network: [example.pku.edu.cn]
tools:
  lookup: tools/lookup.yaml
i18n:
  en: { name: My plugin, description: What it does, in one sentence. }
---

Use \`lookup\` when the user asks about … Answer with …`;

/** Remote MCP servers, until remote.mcp in PLUGIN.md replaces it. */
const STARTER_JSON = `{
  "$schema": "${siteUrl}/schema/plugin-manifest.v1.json",
  "id": "my-plugin",
  "name": "我的插件",
  "description": "一句话说明它为同学们做什么。",
  "endpoint": "https://my-plugin.example.com/mcp",
  "requires": ["network"],
  "scopes": ["example.pku.edu.cn"]
}`;

export async function generateMetadata({ params }: PageProps<'/[lang]/marketplace/submit'>): Promise<Metadata> {
  const m = t(toLang((await params).lang)).marketplace.meta;
  return {
    title: m.submitTitle,
    description: m.submitDescription,
    alternates: { languages: { 'zh-CN': '/marketplace/submit', en: '/en/marketplace/submit' } },
  };
}

export default async function SubmitPage({ params }: PageProps<'/[lang]/marketplace/submit'>) {
  const lang = toLang((await params).lang);
  const m = t(lang).marketplace;
  const starters = [
    { id: 'md', label: m.submit.starterTabs.md, code: STARTER_MD, html: await highlight(STARTER_MD, 'markdown') },
    { id: 'json', label: m.submit.starterTabs.json, code: STARTER_JSON, html: await highlight(STARTER_JSON, 'json') },
  ];
  return (
    <div className="mx-auto w-full max-w-[960px] flex-1 px-4 pt-10 pb-24 md:px-8">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-fd-muted-foreground">
          <li>
            <Link href={localePath(lang, '/marketplace')} className="hover:text-fd-foreground">
              {m.root}
            </Link>
          </li>
          <li aria-hidden="true" className="opacity-40">
            /
          </li>
          <li aria-current="page" className="text-fd-foreground">
            {m.submit.title}
          </li>
        </ol>
      </nav>
      <h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">{m.submit.title}</h1>
      <p className="mt-4 max-w-[60ch] text-base leading-7 text-fd-muted-foreground">{m.submit.lede}</p>
      <p className="mt-3 max-w-[65ch] text-sm leading-6 text-fd-muted-foreground">
        <Rich text={m.submit.about} />{' '}
        <Link
          href={localePath(lang, '/docs/marketplace/review')}
          className="text-fd-primary underline-offset-4 hover:underline"
        >
          {m.submit.rules}
        </Link>
      </p>
      <div className="mt-10">
        <SubmitForm lang={lang} starters={starters} />
      </div>
    </div>
  );
}
