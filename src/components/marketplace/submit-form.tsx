'use client';

import {
  ArrowRight,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  CircleMinus,
  CornerDownLeft,
  ExternalLink,
  Info,
  LoaderCircle,
  RotateCcw,
  TriangleAlert,
} from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Link from 'next/link';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import type { ScanIssue, ScannedPlugin, ScanReport } from '@/lib/marketplace/scanner';
import { GitHubIcon } from './badges';
import { CopyField } from './copy-field';
import { PluginCard } from './plugin-card';

const ease = [0.23, 1, 0.32, 1] as const;
const WEBSITE_REPO = 'pkuinfo/pkuharness-website';

type State =
  | { phase: 'idle' }
  | { phase: 'scanning'; input: string }
  | { phase: 'done'; report: ScanReport; listed: boolean }
  | { phase: 'error'; message: string; code?: string };

const STEPS = ['resolve repository', 'list files', 'read manifests', 'validate'];

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
  "$schema": "/schema/plugin-manifest.v1.json",
  "id": "my-plugin",
  "name": "我的插件",
  "description": "一句话说明它为同学们做什么。",
  "endpoint": "https://my-plugin.example.com/mcp",
  "requires": ["network"],
  "scopes": ["example.pku.edu.cn"]
}`;

function issueUrl(report: ScanReport) {
  const repo = report.repo?.fullName ?? report.input;
  const handles = report.plugins
    .filter((p) => p.status === 'ok' && p.plugin)
    .map((p) => p.plugin?.handle ?? p.plugin?.slug);
  const params = new URLSearchParams({
    template: 'plugin-submission.yml',
    title: `[plugin] ${repo}`,
    repo: report.repo?.path ? `${repo}/${report.repo.path}` : repo,
    plugins: handles.join('\n'),
  });
  return `https://github.com/${WEBSITE_REPO}/issues/new?${params}`;
}

export function SubmitForm() {
  const [value, setValue] = useState('');
  const [state, setState] = useState<State>({ phase: 'idle' });
  const [step, setStep] = useState(0);
  const abort = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function scan(input: string) {
    const repo = input.trim();
    if (!repo) {
      inputRef.current?.focus();
      return;
    }
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setState({ phase: 'scanning', input: repo });
    setStep(0);
    const url = new URL(window.location.href);
    url.searchParams.set('repo', repo);
    window.history.replaceState(null, '', url);
    try {
      const res = await fetch('/api/marketplace/scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ repo }),
        signal: ctrl.signal,
      });
      const data = (await res.json().catch(() => null)) as
        | { report: ScanReport; listed: boolean }
        | { error: { code: string; message: string } }
        | null;
      if (!data) throw new Error(`The server answered ${res.status}.`);
      if ('error' in data) setState({ phase: 'error', message: data.error.message, code: data.error.code });
      else if (data.report.error)
        setState({ phase: 'error', message: data.report.error.message, code: data.report.error.code });
      else setState({ phase: 'done', report: data.report, listed: data.listed });
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setState({ phase: 'error', message: e instanceof Error ? e.message : String(e) });
    }
  }

  const scanRef = useRef(scan);
  scanRef.current = scan;
  useEffect(() => {
    const repo = new URLSearchParams(window.location.search).get('repo');
    if (repo) {
      setValue(repo);
      void scanRef.current(repo);
    }
  }, []);

  useEffect(() => {
    if (state.phase !== 'scanning') return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 650);
    return () => clearInterval(t);
  }, [state.phase]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void scan(value);
  };

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.4, ease }}>
      <form onSubmit={onSubmit} className="relative">
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl border bg-fd-card p-1.5 pl-4 transition-[border-color,box-shadow]',
            'border-fd-border focus-within:border-fd-primary/50 focus-within:ring-4 focus-within:ring-fd-primary/10',
          )}
        >
          <GitHubIcon className="size-4 shrink-0 text-fd-muted-foreground" />
          <label htmlFor="repo" className="sr-only">
            GitHub repository
          </label>
          <input
            ref={inputRef}
            id="repo"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="owner/repo 或 https://github.com/owner/repo/tree/main/plugins"
            className="min-w-0 flex-1 bg-transparent py-2 font-mono text-sm outline-none placeholder:font-sans placeholder:text-fd-muted-foreground/70"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={300}
            // biome-ignore lint/a11y/noAutofocus: the page's only task
            autoFocus
          />
          <button
            type="submit"
            disabled={state.phase === 'scanning'}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground transition-[transform,opacity] active:scale-[0.97] disabled:opacity-60"
          >
            {state.phase === 'scanning' ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <CornerDownLeft className="size-3.5" />
            )}
            检查
          </button>
        </div>
        <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-fd-muted-foreground">
          只支持 github.com 上的公开仓库。试试
          <button
            type="button"
            className="font-mono text-fd-foreground underline decoration-fd-border underline-offset-4 hover:decoration-fd-primary"
            onClick={() => {
              setValue('pkuinfo/pku-harness-plugins');
              void scan('pkuinfo/pku-harness-plugins');
            }}
          >
            pkuinfo/pku-harness-plugins
          </button>
        </p>
      </form>

      <div className="mt-8" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {state.phase === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
              className="rounded-xl border border-fd-border bg-fd-card p-5 font-mono text-[13px]"
            >
              <p className="text-fd-muted-foreground">
                <span className="text-fd-primary">$</span> scan {state.input}
              </p>
              <ul className="mt-3 space-y-1.5">
                {STEPS.slice(0, step + 1).map((s, i) => (
                  <motion.li
                    key={s}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    {i < step ? (
                      <CircleCheck className="size-3.5 text-up" />
                    ) : (
                      <LoaderCircle className="size-3.5 animate-spin text-fd-muted-foreground" />
                    )}
                    <span className={i < step ? 'text-fd-muted-foreground' : ''}>{s}…</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {state.phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="flex gap-3 rounded-xl border border-brand-bright/30 bg-brand-bright/5 p-5"
            >
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-fd-primary" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {state.code === 'rate-limited'
                    ? '请求太频繁了'
                    : state.code === 'not-found'
                      ? '找不到这个仓库'
                      : '没能完成检查'}
                </p>
                <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{state.message}</p>
                <button
                  type="button"
                  onClick={() => void scan(value)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-fd-primary hover:underline"
                >
                  <RotateCcw className="size-3.5" /> 重试
                </button>
              </div>
            </motion.div>
          )}

          {state.phase === 'done' && (
            <Result key={`done-${state.report.scannedAt}`} report={state.report} listed={state.listed} />
          )}

          {state.phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <Starter />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function Starter() {
  return (
    <div className="grid gap-6 rounded-xl border border-dashed border-fd-border p-6 md:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="font-mono text-xs tracking-wider text-fd-muted-foreground">BEFORE YOU SUBMIT</p>
        <ol className="mt-3 space-y-2.5 text-sm leading-6 text-fd-muted-foreground">
          <li>
            <span className="mr-2 font-mono text-fd-primary">1</span>每个插件一个文件夹，放一个{' '}
            <code className="font-mono text-fd-foreground">PLUGIN.md</code>；它引用的文件（tools/、widgets/）都要提交。
          </li>
          <li>
            <span className="mr-2 font-mono text-fd-primary">2</span>如实声明 <code className="font-mono">campus</code>
            、<code className="font-mono">network</code> 和每个工具的 <code className="font-mono">effect</code>。
          </li>
          <li>
            <span className="mr-2 font-mono text-fd-primary">3</span>不要索要校园密码；工具返回数据，不返回指令。
          </li>
        </ol>
        <Link
          href="/docs/marketplace/manifest"
          className="mt-4 inline-flex items-center gap-1 text-sm text-fd-primary hover:underline"
        >
          清单字段说明 <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <StarterManifest />
    </div>
  );
}

function StarterManifest() {
  const [tab, setTab] = useState<'md' | 'json'>('md');
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);
  const code = tab === 'md' ? STARTER_MD : STARTER_JSON.replace('"/schema', `"${origin}/schema`);
  return (
    <div className="min-w-0">
      <div role="tablist" aria-label="Manifest format" className="mb-2 flex gap-1 font-mono text-[11px]">
        {(
          [
            ['md', 'PLUGIN.md'],
            ['json', 'pku-harness.plugin.json · 远程 MCP'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'rounded-md px-2 py-1 transition-colors',
              tab === id ? 'bg-fd-secondary text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto rounded-lg border border-fd-border bg-fd-background/60 p-4 font-mono text-[12px] leading-5 text-fd-muted-foreground">
        {code}
      </pre>
    </div>
  );
}

const LEVEL = {
  error: { Icon: CircleAlert, cls: 'text-fd-primary' },
  warning: { Icon: TriangleAlert, cls: 'text-pku-amber' },
  info: { Icon: Info, cls: 'text-fd-muted-foreground' },
} as const;

function IssueList({ issues }: { issues: ScanIssue[] }) {
  return (
    <ul className="space-y-2">
      {issues.map((i, n) => {
        const { Icon, cls } = LEVEL[i.level];
        return (
          <li key={`${i.message}${String(n)}`} className="flex gap-2.5 text-sm leading-6">
            <Icon className={cn('mt-1 size-4 shrink-0', cls)} />
            <div className="min-w-0">
              <p className={i.level === 'info' ? 'text-fd-muted-foreground' : ''}>{i.message}</p>
              {i.hint && <p className="text-xs leading-5 text-fd-muted-foreground">→ {i.hint}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const STATUS = {
  ok: { label: 'ready', Icon: CircleCheck, cls: 'text-up' },
  error: { label: 'error', Icon: CircleAlert, cls: 'text-fd-primary' },
  skipped: { label: 'skipped', Icon: CircleMinus, cls: 'text-fd-muted-foreground' },
  official: { label: 'official', Icon: CircleMinus, cls: 'text-fd-muted-foreground' },
} as const;

function PluginRow({ p, index, expand }: { p: ScannedPlugin; index: number; expand: boolean }) {
  const [open, setOpen] = useState(p.status === 'error' || (expand && p.status === 'ok'));
  const s = STATUS[p.status];
  const visible = p.issues.filter((i) => i.level !== 'info');
  const infos = p.status === 'ok' ? p.issues.filter((i) => i.level === 'info') : [];
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.05 + Math.min(index, 10) * 0.04, duration: 0.4, ease } }}
      className="overflow-hidden rounded-xl border border-fd-border bg-fd-card"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <s.Icon className={cn('size-4 shrink-0', s.cls)} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-sm">{p.plugin?.slug ?? p.id ?? p.manifestPath}</span>
          <span className="block truncate font-mono text-[11px] text-fd-muted-foreground">{p.manifestPath}</span>
        </span>
        <span className={cn('font-mono text-[11px]', s.cls)}>{s.label}</span>
        {(visible.length > 0 || p.plugin) && (
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-fd-muted-foreground transition-transform duration-300',
              open && 'rotate-180',
            )}
          />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (visible.length > 0 || p.plugin) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="grid gap-5 border-t border-fd-border p-4 md:grid-cols-[1fr_300px]">
              <div className="min-w-0 space-y-4">
                {visible.length > 0 ? (
                  <IssueList issues={visible} />
                ) : (
                  <p className="text-sm text-fd-muted-foreground">没有问题。</p>
                )}
                {infos.length > 0 && (
                  <div>
                    <p className="mb-2 font-mono text-[11px] tracking-wider text-fd-muted-foreground">SUGGESTIONS</p>
                    <IssueList issues={infos} />
                  </div>
                )}
              </div>
              {p.plugin && (
                <div>
                  <p className="mb-2 font-mono text-[11px] tracking-wider text-fd-muted-foreground">PREVIEW</p>
                  <PluginCard plugin={p.plugin} href={null} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function Result({ report, listed }: { report: ScanReport; listed: boolean }) {
  const ready = report.plugins.filter((p) => p.status === 'ok');
  const errors =
    report.plugins.filter((p) => p.status === 'error').length + report.notes.filter((n) => n.level === 'error').length;
  const shown = report.plugins.filter((p) => p.status !== 'skipped');
  const skipped = report.plugins.filter((p) => p.status === 'skipped');
  const r = report.repo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      className="space-y-4"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border p-5',
          report.ok ? 'border-up/30 bg-up/5' : 'border-fd-border bg-fd-card',
        )}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <a
              href={r?.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono text-base hover:text-fd-primary"
            >
              {r?.fullName}
              {r?.path && <span className="text-fd-muted-foreground">/{r.path}</span>}
              <ExternalLink className="size-3.5 text-fd-muted-foreground" />
            </a>
            <p className="mt-1 font-mono text-xs text-fd-muted-foreground">
              {r?.branch} · {report.stats.files} files · {report.stats.candidates} candidates ·{' '}
              <span className={ready.length ? 'text-up' : ''}>{ready.length} ready</span>
              {errors > 0 && <span className="text-fd-primary"> · {errors} error(s)</span>}
            </p>
          </div>
          {listed ? (
            <Link
              href={`/marketplace/${r?.fullName.toLowerCase()}`}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-fd-border px-4 py-2 text-sm hover:bg-fd-accent"
            >
              已收录 · 查看 <ArrowRight className="size-3.5" />
            </Link>
          ) : report.ok ? (
            <a
              href={issueUrl(report)}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-transform active:scale-[0.98]"
            >
              提交上架 · Submit for listing
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          ) : (
            <span className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-dashed border-fd-border px-4 py-2 text-sm text-fd-muted-foreground">
              修复错误后再提交
            </span>
          )}
        </div>
        {listed && (
          <p className="mt-3 text-sm text-fd-muted-foreground">
            这个仓库已经收录。push 之后市场会在一小时内自动更新，无需再次提交。
          </p>
        )}
        {!listed && report.ok && (
          <p className="mt-3 text-sm text-fd-muted-foreground">
            会在 GitHub 上打开一个预填好的 issue。机器人会再扫描一次并发起收录 PR，维护者合并后即上架。
          </p>
        )}
      </div>

      {report.notes.length > 0 && (
        <div className="rounded-xl border border-fd-border bg-fd-card p-4">
          <IssueList issues={report.notes} />
        </div>
      )}

      {shown.length > 0 && (
        <ul className="space-y-2">
          {shown.map((p, i) => (
            <PluginRow key={p.manifestPath} p={p} index={i} expand={shown.length <= 4} />
          ))}
        </ul>
      )}

      {skipped.length > 0 && (
        <details className="group rounded-xl border border-dashed border-fd-border px-4 py-3 text-sm">
          <summary className="cursor-pointer list-none font-mono text-xs text-fd-muted-foreground marker:hidden">
            <span className="inline-block transition-transform group-open:rotate-90">›</span> {skipped.length} file(s)
            skipped
          </summary>
          <ul className="mt-3 space-y-1 font-mono text-xs text-fd-muted-foreground">
            {skipped.map((p) => (
              <li key={p.manifestPath}>
                {p.manifestPath} — {p.issues[0]?.message}
              </li>
            ))}
          </ul>
        </details>
      )}

      {ready.length === 0 && (
        <div className="rounded-xl border border-dashed border-fd-border p-5">
          <p className="text-sm">从这个清单开始：</p>
          <div className="mt-3">
            <StarterManifest />
          </div>
          <CopyField className="mt-3" label="文件名" value="PLUGIN.md" />
        </div>
      )}
    </motion.div>
  );
}
