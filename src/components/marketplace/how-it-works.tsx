import Link from 'next/link';
import { CodePanel } from '@/components/ui/code-panel';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { highlight } from './highlight';

const SAMPLE = `---
spec: 1
id: canteen-menu
name: 食堂菜单
description: 今天各食堂的菜单和营业时间。
version: 1.0.0
author: you
network: [dining.pku.edu.cn]
tools:
  menu: tools/menu.yaml
i18n:
  en: { name: Canteen menus, description: What each canteen serves today. }
---

Use \`menu\` when the user asks what to eat.`;

/** "How a plugin gets listed": four real steps next to the file that starts it all. */
export async function HowListingWorks({ lang }: { lang: Lang }) {
  const m = t(lang).marketplace;
  const html = await highlight(SAMPLE, 'markdown');
  return (
    <section aria-labelledby="listing-title" className="mt-24 border-t border-fd-border pt-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
        <div>
          <h2 id="listing-title" className="text-2xl font-semibold tracking-[-0.02em]">
            {m.listing.title}
          </h2>
          <p className="mt-3 text-fd-muted-foreground">{m.listing.lede}</p>
          <ol className="mt-8 space-y-6">
            {m.listing.steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[28px_1fr] gap-x-3">
                <span
                  aria-hidden="true"
                  className="flex size-7 items-center justify-center rounded-full border border-fd-border text-xs font-medium tabular-nums text-fd-muted-foreground"
                >
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <h3 className="font-medium">{s.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/marketplace.json" className="font-mono text-fd-muted-foreground hover:text-fd-foreground">
              {m.listing.json}
            </Link>
            <Link href="/marketplace/llms.txt" className="font-mono text-fd-muted-foreground hover:text-fd-foreground">
              {m.listing.llms}
            </Link>
            <Link
              href={localePath(lang, '/docs/marketplace/manifest')}
              className="text-fd-primary underline-offset-4 hover:underline"
            >
              {m.listing.spec}
            </Link>
          </p>
        </div>
        <CodePanel
          className="self-start"
          label={m.listing.sample}
          copyLabel={m.copy.copyValue('PLUGIN.md')}
          copiedLabel={m.copy.copied}
          files={[{ id: 'sample', label: m.listing.sample, code: SAMPLE, html }]}
        />
      </div>
    </section>
  );
}
