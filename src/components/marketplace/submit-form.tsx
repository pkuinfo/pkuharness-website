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
import { CodePanel, type CodePanelFile } from '@/components/ui/code-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { type Lang, localePath } from '@/lib/i18n';
import type { ScanIssue, ScannedPlugin, ScanReport } from '@/lib/marketplace/scanner';
import { t } from '@/lib/messages';
import { GitHubIcon } from './badges';
import { CopyField } from './copy-field';
import { PluginCard } from './plugin-card';
import { Rich } from './rich';

const ease = [0.23, 1, 0.32, 1] as const;
const WEBSITE_REPO = 'pkuinfo/pkuharness-website';
const EXAMPLE = 'pkuinfo/pku-harness-plugins';

type M = ReturnType<typeof t>['marketplace'];

type State =
  | { phase: 'idle' }
  | { phase: 'scanning'; input: string }
  | { phase: 'done'; report: ScanReport; listed: boolean }
  | { phase: 'error'; message: string; code?: string };

/** Prefilled submission issue (template fields are English on GitHub, whatever the page language). */
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

export function SubmitForm({ lang, starters }: { lang: Lang; starters: CodePanelFile[] }) {
  const m = t(lang).marketplace;
  const s = m.submit;
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
      if (!data) throw new Error(s.errors.server(res.status));
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
    const timer = setInterval(() => setStep((n) => Math.min(n + 1, s.steps.length - 1)), 650);
    return () => clearInterval(timer);
  }, [state.phase, s.steps.length]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void scan(value);
  };

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease }}>
      <form onSubmit={onSubmit}>
        <div className="flex items-center gap-2 rounded-2xl border border-fd-border bg-fd-card p-1.5 ps-4 transition-[border-color,box-shadow] focus-within:border-fd-primary/60 focus-within:ring-4 focus-within:ring-fd-primary/15">
          <GitHubIcon className="size-4 shrink-0 text-fd-muted-foreground" />
          <label htmlFor="repo" className="sr-only">
            {s.inputLabel}
          </label>
          <input
            ref={inputRef}
            id="repo"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={s.placeholder}
            className="h-10 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:font-sans placeholder:text-fd-muted-foreground"
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
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground transition-[transform,opacity] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring active:scale-[0.97] disabled:opacity-60"
          >
            {state.phase === 'scanning' ? (
              <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <CornerDownLeft className="size-3.5" aria-hidden="true" />
            )}
            {s.check}
          </button>
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-sm text-fd-muted-foreground">
          {s.hint}
          <button
            type="button"
            className="rounded font-mono text-xs text-fd-foreground underline decoration-fd-border underline-offset-4 hover:decoration-fd-primary focus-visible:outline-2 focus-visible:outline-fd-ring"
            onClick={() => {
              setValue(EXAMPLE);
              void scan(EXAMPLE);
            }}
          >
            {EXAMPLE}
          </button>
        </p>
      </form>

      <div className="mt-10" aria-live="polite" aria-busy={state.phase === 'scanning'}>
        <AnimatePresence mode="wait" initial={false}>
          {state.phase === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="space-y-3"
            >
              <div className="rounded-2xl border border-fd-border bg-fd-card p-5">
                <p className="font-mono text-sm text-fd-muted-foreground">{state.input}</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {s.steps.slice(0, step + 1).map((label, i) => (
                    <motion.li
                      key={label}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      {i < step ? (
                        <CircleCheck className="size-3.5 text-up" aria-hidden="true" />
                      ) : (
                        <LoaderCircle className="size-3.5 animate-spin text-fd-muted-foreground" aria-hidden="true" />
                      )}
                      <span className={i < step ? 'text-fd-muted-foreground' : ''}>{label}…</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              {[0, 1].map((n) => (
                <div key={n} className="flex items-center gap-3 rounded-2xl border border-fd-border p-4">
                  <Skeleton className="size-4 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/5" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {state.phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              role="alert"
              className="flex gap-3 rounded-2xl border border-brand-bright/30 bg-brand-bright/5 p-5"
            >
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-fd-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {state.code === 'rate-limited'
                    ? s.errors.rateLimited
                    : state.code === 'not-found'
                      ? s.errors.notFound
                      : s.errors.generic}
                </p>
                <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{state.message}</p>
                <button
                  type="button"
                  onClick={() => void scan(value)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded text-sm text-fd-primary hover:underline focus-visible:outline-2 focus-visible:outline-fd-ring"
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  {s.errors.retry}
                </button>
              </div>
            </motion.div>
          )}

          {state.phase === 'done' && (
            <Result
              key={`done-${state.report.scannedAt}`}
              report={state.report}
              listed={state.listed}
              lang={lang}
              m={m}
              starters={starters}
            />
          )}

          {state.phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <Starter lang={lang} m={m} starters={starters} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function Starter({ lang, m, starters }: { lang: Lang; m: M; starters: CodePanelFile[] }) {
  const b = m.submit.before;
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <div>
        <h2 className="font-semibold">{b.title}</h2>
        <ol className="mt-4 space-y-3">
          {b.items.map((item, i) => (
            <li key={item} className="grid grid-cols-[20px_1fr] gap-3 text-sm leading-6 text-fd-muted-foreground">
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-5 items-center justify-center rounded-full border border-fd-border text-[11px] tabular-nums"
              >
                {i + 1}
              </span>
              <span>
                <Rich text={item} />
              </span>
            </li>
          ))}
        </ol>
        <Link
          href={localePath(lang, '/docs/marketplace/manifest')}
          className="mt-5 inline-flex items-center gap-1 text-sm text-fd-primary underline-offset-4 hover:underline"
        >
          {b.fields}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <CodePanel
        files={starters}
        label={m.submit.starterLabel}
        copyLabel={m.copy.copy}
        copiedLabel={m.copy.copied}
        className="self-start"
      />
    </div>
  );
}

const LEVEL = {
  error: { Icon: CircleAlert, cls: 'text-fd-primary' },
  warning: { Icon: TriangleAlert, cls: 'text-pku-gold dark:text-pku-amber' },
  info: { Icon: Info, cls: 'text-fd-muted-foreground' },
} as const;

function IssueList({ issues }: { issues: ScanIssue[] }) {
  return (
    <ul className="space-y-2">
      {issues.map((i, n) => {
        const { Icon, cls } = LEVEL[i.level];
        return (
          <li key={`${i.message}${String(n)}`} className="flex gap-2.5 text-sm leading-6">
            <Icon className={cn('mt-1 size-4 shrink-0', cls)} aria-hidden="true" />
            <div className="min-w-0">
              <p className={i.level === 'info' ? 'text-fd-muted-foreground' : ''}>{i.message}</p>
              {i.hint && <p className="text-xs leading-5 text-fd-muted-foreground">{i.hint}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const STATUS = {
  ok: { Icon: CircleCheck, cls: 'text-up' },
  error: { Icon: CircleAlert, cls: 'text-fd-primary' },
  skipped: { Icon: CircleMinus, cls: 'text-fd-muted-foreground' },
  official: { Icon: CircleMinus, cls: 'text-fd-muted-foreground' },
} as const;

function PluginRow({
  p,
  index,
  expand,
  lang,
  m,
}: {
  p: ScannedPlugin;
  index: number;
  expand: boolean;
  lang: Lang;
  m: M;
}) {
  const r = m.submit.report;
  const [open, setOpen] = useState(p.status === 'error' || (expand && p.status === 'ok'));
  const st = STATUS[p.status];
  const visible = p.issues.filter((i) => i.level !== 'info');
  const infos = p.status === 'ok' ? p.issues.filter((i) => i.level === 'info') : [];
  const expandable = visible.length > 0 || Boolean(p.plugin);
  const panelId = `scan-${index}`;
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.05 + Math.min(index, 10) * 0.04, duration: 0.35, ease } }}
      className="overflow-hidden rounded-2xl border border-fd-border bg-fd-card"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={expandable ? open : undefined}
        aria-controls={expandable ? panelId : undefined}
        disabled={!expandable}
        className="flex w-full items-center gap-3 px-4 py-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fd-ring disabled:cursor-default"
      >
        <st.Icon className={cn('size-4 shrink-0', st.cls)} aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-sm">{p.plugin?.slug ?? p.id ?? p.manifestPath}</span>
          <span className="block truncate font-mono text-[11px] text-fd-muted-foreground">{p.manifestPath}</span>
        </span>
        <span className={cn('text-xs', st.cls)}>{r.status[p.status]}</span>
        {expandable && (
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 text-fd-muted-foreground transition-transform duration-300',
              open && 'rotate-180',
            )}
          />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && expandable && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="grid gap-5 border-t border-fd-border p-4 md:grid-cols-[minmax(0,1fr)_300px]">
              <div className="min-w-0 space-y-4">
                {visible.length > 0 ? (
                  <IssueList issues={visible} />
                ) : (
                  <p className="text-sm text-fd-muted-foreground">{r.noProblems}</p>
                )}
                {infos.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-fd-muted-foreground">{r.suggestions}</p>
                    <IssueList issues={infos} />
                  </div>
                )}
              </div>
              {p.plugin && (
                <div>
                  <p className="mb-2 text-xs font-medium text-fd-muted-foreground">{r.preview}</p>
                  <PluginCard plugin={p.plugin} lang={lang} href={null} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function Result({
  report,
  listed,
  lang,
  m,
  starters,
}: {
  report: ScanReport;
  listed: boolean;
  lang: Lang;
  m: M;
  starters: CodePanelFile[];
}) {
  const r = m.submit.report;
  const ready = report.plugins.filter((p) => p.status === 'ok');
  const errors =
    report.plugins.filter((p) => p.status === 'error').length + report.notes.filter((n) => n.level === 'error').length;
  const shown = report.plugins.filter((p) => p.status !== 'skipped');
  const skipped = report.plugins.filter((p) => p.status === 'skipped');
  const repo = report.repo;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      className="space-y-4"
    >
      <div className={cn('rounded-2xl border p-5', report.ok ? 'border-up/30 bg-up/5' : 'border-fd-border bg-fd-card')}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <a
              href={repo?.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono text-base break-all hover:text-fd-primary"
            >
              {repo?.fullName}
              {repo?.path && <span className="text-fd-muted-foreground">/{repo.path}</span>}
              <ExternalLink className="size-3.5 shrink-0 text-fd-muted-foreground" aria-hidden="true" />
            </a>
            <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-fd-muted-foreground tabular-nums">
              <span>
                {r.branch} <span className="font-mono text-xs">{repo?.branch}</span>
              </span>
              <span>{r.files(report.stats.files)}</span>
              <span>{r.candidates(report.stats.candidates)}</span>
              <span className={ready.length ? 'text-success-fg' : ''}>{r.ready(ready.length)}</span>
              {errors > 0 && <span className="text-fd-primary">{r.errors(errors)}</span>}
            </p>
          </div>
          {listed ? (
            <Link
              href={localePath(lang, `/marketplace/${repo?.fullName.toLowerCase()}`)}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-fd-border px-4 text-sm hover:bg-fd-accent"
            >
              {r.listed}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : report.ok ? (
            <a
              href={issueUrl(report)}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring active:scale-[0.98]"
            >
              {r.submit}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ) : (
            <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-fd-border px-4 text-sm text-fd-muted-foreground">
              {r.fixFirst}
            </span>
          )}
        </div>
        {listed && <p className="mt-3 text-sm text-fd-muted-foreground">{r.listedNote}</p>}
        {!listed && report.ok && <p className="mt-3 text-sm text-fd-muted-foreground">{r.submitNote}</p>}
      </div>

      {report.notes.length > 0 && (
        <div className="rounded-2xl border border-fd-border bg-fd-card p-4">
          <IssueList issues={report.notes} />
        </div>
      )}

      {shown.length > 0 && (
        <ul className="space-y-2">
          {shown.map((p, i) => (
            <PluginRow key={p.manifestPath} p={p} index={i} expand={shown.length <= 4} lang={lang} m={m} />
          ))}
        </ul>
      )}

      {skipped.length > 0 && (
        <details className="group rounded-2xl border border-dashed border-fd-border px-4 py-3 text-sm">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-fd-muted-foreground marker:hidden">
            <ChevronDown className="size-3.5 -rotate-90 transition-transform group-open:rotate-0" aria-hidden="true" />
            {r.skipped(skipped.length)}
          </summary>
          <ul className="mt-3 space-y-1 font-mono text-xs text-fd-muted-foreground">
            {skipped.map((p) => (
              <li key={p.manifestPath}>
                {p.manifestPath}: {p.issues[0]?.message}
              </li>
            ))}
          </ul>
        </details>
      )}

      {ready.length === 0 && (
        <div className="rounded-2xl border border-dashed border-fd-border p-5">
          <p className="text-sm">{r.startHere}</p>
          <CodePanel
            className="mt-3"
            files={starters}
            label={m.submit.starterLabel}
            copyLabel={m.copy.copy}
            copiedLabel={m.copy.copied}
          />
          <CopyField className="mt-3" label={r.fileName} value="PLUGIN.md" />
        </div>
      )}
    </motion.div>
  );
}
