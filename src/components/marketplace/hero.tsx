'use client';

import { ArrowRight, BookOpen } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const ease = [0.23, 1, 0.32, 1] as const;

const MANIFEST = `{
  "$schema": "https://…/schema/plugin-manifest.v1.json",
  "id": "canteen-menu",
  "name": "食堂菜单",
  "description": "今天各食堂的菜单和营业时间。",
  "endpoint": "https://canteen.example.com/mcp",
  "requires": ["network"],
  "scopes": ["dining.pku.edu.cn"]
}`;

function useTyped(text: string, speed = 9) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) {
      setN(text.length);
      return;
    }
    let i = 0;
    const start = setTimeout(function tick() {
      i = Math.min(text.length, i + 2);
      setN(i);
      if (i < text.length) timer = setTimeout(tick, speed);
    }, 500);
    let timer: ReturnType<typeof setTimeout> = start;
    return () => clearTimeout(timer);
  }, [text, speed, reduce]);
  return text.slice(0, n);
}

/** Minimal JSON colouring for the hero snippet (keys / strings / punctuation). */
function Json({ code }: { code: string }) {
  const parts = code.split(/("(?:[^"\\]|\\.)*"?)(\s*:)?/g);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i])
      out.push(
        <span key={`p${i}`} className="text-fd-muted-foreground">
          {parts[i]}
        </span>,
      );
    const str = parts[i + 1];
    const colon = parts[i + 2];
    if (str)
      out.push(
        <span key={`s${i}`} className={colon ? 'text-fd-foreground' : 'text-brand-bright dark:text-[#ff8a96]'}>
          {str}
        </span>,
      );
    if (colon)
      out.push(
        <span key={`c${i}`} className="text-fd-muted-foreground">
          {colon}
        </span>,
      );
  }
  return <>{out}</>;
}

export function MarketplaceHero({
  stats,
}: {
  stats: { official: number; community: number; repos: number; generatedAt: string };
}) {
  const typed = useTyped(MANIFEST);
  const done = typed.length === MANIFEST.length;
  return (
    <section className="relative grid gap-10 pt-14 pb-10 md:pt-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 opacity-70 [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand)_28%,transparent),transparent)] blur-2xl dark:opacity-100"
      />
      <div>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="font-mono text-xs tracking-wider text-fd-muted-foreground"
        >
          <span className="text-fd-primary">~/</span>marketplace
          <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-fd-primary" />
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.05 }}
          className="mt-4 text-4xl font-semibold tracking-tight text-balance md:text-5xl"
        >
          插件市场
          <span className="mt-2 block text-lg font-normal tracking-normal text-fd-muted-foreground md:text-xl">
            Every campus service is a plugin. Pick the ones you trust.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="mt-5 max-w-xl text-[15px] leading-7 text-fd-muted-foreground"
        >
          官方插件随 App 一起发布；社区插件是运行在开发者服务器上的 MCP
          服务，手机上不运行任何第三方代码，也永远拿不到你的校园密码。每个插件需要什么、连到哪里、往云端发什么，都写在这里。
        </motion.p>
        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-7 flex gap-8 font-mono"
        >
          {[
            ['official', stats.official],
            ['community', stats.community],
            ['repos', stats.repos],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] tracking-wider text-fd-muted-foreground uppercase">{k}</dt>
              <dd className="mt-1 text-2xl text-fd-foreground tabular-nums">{v}</dd>
            </div>
          ))}
        </motion.dl>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.25 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          <Link
            href="/marketplace/submit"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-transform active:scale-[0.98]"
          >
            发布你的插件
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/docs/marketplace"
            className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-4 py-2 text-sm transition-colors hover:bg-fd-accent"
          >
            <BookOpen className="size-3.5" />
            上架规则
          </Link>
        </motion.div>
      </div>

      <motion.figure
        initial={{ opacity: 0, y: 16, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.15 }}
        className="relative hidden overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-2xl shadow-black/20 sm:block"
        style={{ transformPerspective: 1200 }}
      >
        <div className="flex items-center gap-1.5 border-b border-fd-border px-3 py-2">
          <span className="size-2.5 rounded-full bg-fd-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-fd-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-fd-muted-foreground/25" />
          <figcaption className="ml-2 font-mono text-[11px] text-fd-muted-foreground">
            your-repo/canteen/<span className="text-fd-foreground">pku-harness.plugin.json</span>
          </figcaption>
        </div>
        <pre className="min-h-[220px] overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6">
          <code>
            <Json code={typed} />
            <span className={done ? 'animate-pulse text-fd-primary' : 'text-fd-primary'}>▍</span>
          </code>
        </pre>
        <div className="flex items-center justify-between border-t border-fd-border px-4 py-2.5 font-mono text-[11px] text-fd-muted-foreground">
          <span>
            <span className="text-up">●</span> git push → listed as{' '}
            <span className="text-fd-foreground">you/your-repo/canteen-menu</span>
          </span>
        </div>
      </motion.figure>
    </section>
  );
}
