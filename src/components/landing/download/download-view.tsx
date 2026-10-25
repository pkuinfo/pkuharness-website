import { Markdown } from 'fumadocs-core/content/md';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import {
  ArrowDownToLine,
  ArrowUpRight,
  ChevronDown,
  Cpu,
  FlaskConical,
  KeyRound,
  Network,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Logo } from '@/components/brand/logo';
import { GitHubIcon } from '@/components/marketplace/badges';
import { Rich } from '@/components/marketplace/rich';
import { ShineBorder } from '@/components/ui/shine-border';
import { Timeline } from '@/components/ui/timeline';
import { cn } from '@/lib/cn';
import { htmlLang, type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { formatBytes, pickLatest, type Release, type ReleasesResult } from '@/lib/releases';
import { github, repos } from '@/lib/shared';
import { CopyButton } from './copy-button';

type M = ReturnType<typeof t>['download'];

const RELEASES_URL = `${github(repos.app)}/releases`;

function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(htmlLang[lang], {
    year: 'numeric',
    month: lang === 'zh' ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(iso));
}

/** Facts from the release notes' key/value table (signing certificate, versionCode, OTA runtime, commit). */
function releaseFacts(body: string) {
  const facts: Record<string, string> = {};
  for (const line of body.split('\n')) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|\s*`?([^|`]+?)`?\s*\|\s*$/);
    if (m && !/^-+$/.test(m[1])) facts[m[1].toLowerCase()] = m[2].trim();
  }
  const hex = (v?: string, len = 64) =>
    v && new RegExp(`^[a-f0-9]{${len}}$`, 'i').test(v) ? v.toLowerCase() : undefined;
  return {
    cert: hex(facts['signing certificate sha-256']),
    versionCode: facts.versioncode,
    runtime: hex(facts['runtime fingerprint (ota)'], 40),
    commit: hex(facts.commit, 40),
  };
}

const archOf = (file: string) => file.match(/(arm64-v8a|armeabi-v7a|x86_64|x86)/)?.[1];

/** A hash in groups of four, so two copies can be compared by eye. */
function Hash({ value }: { value: string }) {
  return (
    <code className="block font-mono text-[13px] leading-6 tracking-wide break-all text-fd-foreground">
      {value.match(/.{1,4}/g)?.map((g, i) => (
        <span key={String(i)} className={cn('inline-block', i % 2 ? 'text-fd-muted-foreground' : '')}>
          {g}
          {i < value.length / 4 - 1 && ' '}
        </span>
      ))}
    </code>
  );
}

export async function DownloadView({ data, lang, preview }: { data: ReleasesResult; lang: Lang; preview?: boolean }) {
  const m = t(lang).download;
  const latest = pickLatest(data.releases);
  const withApk = data.releases.filter((r) => r.apks.length > 0);
  return (
    <div className="flex flex-col">
      <header className="relative isolate -mt-14 overflow-hidden pt-14">
        <div className="mx-auto w-full max-w-[1200px] px-4 pt-14 pb-10 md:px-8 md:pt-20">
          {preview && (
            <p className="mb-6 inline-flex items-center gap-2 rounded-lg border border-pku-amber/30 bg-pku-amber/10 px-3 py-1.5 text-sm">
              <FlaskConical className="size-4 text-pku-gold dark:text-pku-amber" aria-hidden="true" />
              {m.previewBanner}
            </p>
          )}
          <h1 className="lp-display text-5xl leading-[1.05] md:text-8xl">{m.title}</h1>
          <p className="mt-5 max-w-2xl text-xl text-[var(--color-lp-ink-2)] md:text-2xl">{m.lede}</p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] space-y-20 px-4 pb-24 md:px-8">
        {latest ? (
          <LatestRelease release={latest} lang={lang} m={m} />
        ) : (
          <ComingSoon unreachable={Boolean(data.error)} m={m} />
        )}

        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          <Needs m={m} />
          <Updates m={m} />
        </div>

        {withApk.length > 0 && <History releases={withApk} latest={latest} lang={lang} m={m} />}

        <BuildFromSource lang={lang} m={m} collapsed={Boolean(latest)} />
      </div>
    </div>
  );
}

async function LatestRelease({ release, lang, m }: { release: Release; lang: Lang; m: M }) {
  const primary = release.apks[0];
  const facts = releaseFacts(release.body);
  const svg = await QRCode.toString(primary.url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#0a0a0a', light: '#ffffff' },
  });
  const arch = archOf(primary.name);
  return (
    <section aria-labelledby="latest-title" className="relative rounded-3xl border border-fd-border bg-fd-card">
      <ShineBorder width={1} duration={16} />
      <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Logo size={36} />
            <h2
              id="latest-title"
              className="font-mono text-3xl font-semibold tracking-[-0.03em] tabular-nums md:text-4xl"
            >
              {release.tag}
            </h2>
            <span
              className={cn(
                'rounded-md px-2 py-0.5 text-xs font-medium',
                release.prerelease ? 'bg-pku-amber/15 text-warn-fg' : 'bg-up/12 text-success-fg',
              )}
            >
              {release.prerelease ? m.latest.prerelease : m.latest.stable}
            </span>
          </div>
          <p className="mt-2 text-sm text-fd-muted-foreground">
            {m.latest.released(formatDate(release.publishedAt, lang))}
          </p>

          <ul className="mt-7 space-y-4">
            {release.apks.map((a, i) => (
              <li key={a.url} className="flex flex-wrap items-center gap-x-4 gap-y-3">
                {i === 0 ? (
                  <a href={a.url} className="lp-pill lp-pill-primary">
                    <ArrowDownToLine className="size-[18px]" aria-hidden="true" />
                    {m.latest.download}
                  </a>
                ) : (
                  <a
                    href={a.url}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-fd-border px-4 font-semibold transition-[transform,background-color] duration-150 hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring active:scale-[0.97]"
                  >
                    <ArrowDownToLine className="size-[18px]" aria-hidden="true" />
                    {m.latest.download}
                  </a>
                )}
                <span className="min-w-0 text-sm text-fd-muted-foreground">
                  <span className="block truncate font-mono text-fd-foreground">{a.name}</span>
                  <span className="tabular-nums">{formatBytes(a.size)}</span>
                  {archOf(a.name) && <span className="ms-3">{m.latest.arch(archOf(a.name) ?? '')}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[62ch] text-sm leading-6 text-fd-muted-foreground">{m.latest.installNote}</p>
          <a
            href={release.htmlUrl}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-fd-primary underline-offset-4 hover:underline"
          >
            {m.latest.github}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>

        <figure className="hidden flex-row items-center gap-4 sm:flex md:flex-col md:justify-center md:gap-3">
          {/* biome-ignore lint/performance/noImgElement: inline SVG data URI, nothing to optimise */}
          <img
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
            alt={m.latest.qrAlt(primary.name)}
            width={168}
            height={168}
            className="size-28 rounded-2xl bg-white p-3 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] md:size-[168px]"
          />
          <figcaption className="text-sm text-fd-muted-foreground">
            {m.latest.qr}
            {arch && (
              <span className="mt-1 flex items-center gap-1 text-xs md:justify-center">
                <Cpu className="size-3" aria-hidden="true" />
                {arch}
              </span>
            )}
          </figcaption>
        </figure>
      </div>

      <div className="border-t border-fd-border p-5 sm:px-8 sm:py-7">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-up" aria-hidden="true" />
          <h3 className="font-semibold">{m.verify.title}</h3>
        </div>
        <p className="mt-1.5 text-sm text-fd-muted-foreground">
          <Rich text={m.verify.lede} />
        </p>
        <dl className="mt-5 grid gap-5 lg:grid-cols-2 lg:gap-8">
          <HashRow label={m.verify.sha256} value={primary.sha256} m={m} empty={m.verify.noSha} />
          {facts.cert && <HashRow label={m.verify.cert} value={facts.cert} m={m} note={m.verify.certNote} />}
        </dl>
        {(facts.versionCode || facts.runtime || facts.commit) && (
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-dashed border-fd-border pt-5 text-sm">
            {facts.versionCode && <Fact label={m.facts.versionCode} value={facts.versionCode} />}
            {facts.runtime && <Fact label={m.facts.runtime} value={facts.runtime.slice(0, 12)} title={facts.runtime} />}
            {facts.commit && (
              <Fact
                label={m.facts.commit}
                value={
                  <a
                    href={`${github(repos.app)}/commit/${facts.commit}`}
                    className="underline decoration-fd-border underline-offset-4 hover:text-fd-primary"
                  >
                    {facts.commit.slice(0, 7)}
                  </a>
                }
              />
            )}
          </dl>
        )}
      </div>
    </section>
  );
}

function HashRow({
  label,
  value,
  m,
  note,
  empty,
}: {
  label: string;
  value?: string;
  m: M;
  note?: string;
  empty?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-fd-muted-foreground">{label}</dt>
      <dd className="mt-1.5">
        {value ? (
          <div className="flex items-start gap-2 rounded-xl bg-fd-foreground/[0.04] py-2 ps-3 pe-1.5">
            <div className="min-w-0 flex-1">
              <Hash value={value} />
            </div>
            <CopyButton text={value} label={m.verify.copy(label)} copiedLabel={m.verify.copied} />
          </div>
        ) : (
          <p className="text-sm text-fd-muted-foreground">{empty}</p>
        )}
        {note && <p className="mt-2 text-xs leading-5 text-fd-muted-foreground">{note}</p>}
      </dd>
    </div>
  );
}

function Fact({ label, value, title }: { label: string; value: React.ReactNode; title?: string }) {
  return (
    <div>
      <dt className="text-xs text-fd-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-[13px]" title={title}>
        {value}
      </dd>
    </div>
  );
}

function ComingSoon({ unreachable, m }: { unreachable: boolean; m: M }) {
  return (
    <section aria-labelledby="soon-title" className="rounded-3xl border border-fd-border bg-fd-card p-6 md:p-10">
      <p className="flex items-center gap-2.5 text-sm font-medium">
        <span aria-hidden="true" className="size-2 rounded-full bg-pku-amber" />
        {unreachable ? m.soon.unreachable : m.soon.preparing}
      </p>
      <h2 id="soon-title" className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
        {m.soon.title}
      </h2>
      <p className="mt-4 max-w-2xl leading-7 text-fd-muted-foreground">
        {unreachable ? m.soon.bodyUnreachable : m.soon.body}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={RELEASES_URL}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-white transition-[transform,background-color] hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring active:scale-[0.97]"
        >
          <GitHubIcon className="size-[18px]" />
          {m.soon.watch}
        </a>
        <a
          href="#build"
          className="inline-flex h-12 items-center rounded-xl border border-fd-border px-5 font-medium transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
        >
          {m.soon.build}
        </a>
      </div>
    </section>
  );
}

const NEED_ICONS = [Smartphone, KeyRound, Sparkles, Network];

function Needs({ m }: { m: M }) {
  return (
    <section aria-labelledby="needs-title">
      <h2 id="needs-title" className="text-2xl font-semibold tracking-[-0.02em]">
        {m.needs.title}
      </h2>
      <dl className="mt-6 divide-y divide-fd-border border-y border-fd-border">
        {m.needs.items.map((item, i) => {
          const Icon = NEED_ICONS[i] ?? Smartphone;
          return (
            <div key={item.title} className="grid grid-cols-[32px_1fr] gap-x-3 py-4">
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-lg bg-fd-muted text-fd-foreground"
              >
                <Icon className="size-4" />
              </span>
              <div>
                <dt className="font-medium">{item.title}</dt>
                <dd className="mt-1 text-sm leading-6 text-fd-muted-foreground">{item.body}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function Updates({ m }: { m: M }) {
  return (
    <section aria-labelledby="updates-title">
      <h2 id="updates-title" className="text-2xl font-semibold tracking-[-0.02em]">
        {m.updates.title}
      </h2>
      <p className="mt-2 text-fd-muted-foreground">{m.updates.lede}</p>
      <ol className="relative mt-6 space-y-6">
        {m.updates.steps.map((s, i) => (
          <li key={s.title} className="relative grid grid-cols-[28px_1fr] gap-x-3">
            {i < m.updates.steps.length - 1 && (
              <span aria-hidden="true" className="absolute top-8 -bottom-6 left-[13.5px] w-px bg-fd-border" />
            )}
            <span
              aria-hidden="true"
              className={cn(
                'relative flex size-7 items-center justify-center rounded-full border text-xs font-medium tabular-nums',
                i === 0
                  ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                  : 'border-fd-border bg-fd-background text-fd-muted-foreground',
              )}
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
      <p className="mt-6 rounded-xl bg-fd-muted/60 px-4 py-3 text-sm leading-6 text-fd-muted-foreground">
        {m.updates.ios}
      </p>
    </section>
  );
}

function History({ releases, latest, lang, m }: { releases: Release[]; latest?: Release; lang: Lang; m: M }) {
  return (
    <section aria-labelledby="history-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="history-title" className="text-2xl font-semibold tracking-[-0.02em]">
          {m.history.title}
        </h2>
        <a
          href={RELEASES_URL}
          className="inline-flex items-center gap-1 text-sm text-fd-muted-foreground hover:text-fd-foreground"
        >
          <GitHubIcon className="size-3.5" />
          GitHub Releases
        </a>
      </div>
      <Timeline
        className="mt-8"
        items={releases.map((r) => {
          const current = r === latest;
          return {
            id: r.tag,
            status: current ? 'current' : 'default',
            title: (
              <a href={r.htmlUrl} className="font-mono tabular-nums hover:text-fd-primary">
                {r.tag}
              </a>
            ),
            meta: (
              <>
                {formatDate(r.publishedAt, lang)}
                {current && (
                  <span className="ms-2 rounded-md bg-fd-primary/10 px-1.5 py-0.5 text-xs font-medium text-fd-primary">
                    {m.history.current}
                  </span>
                )}
                {r.prerelease && <span className="ms-2 text-xs">{m.latest.prerelease}</span>}
              </>
            ),
            content: (
              <div className="space-y-4">
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {r.apks.map((a) => (
                    <li key={a.url}>
                      <a
                        href={a.url}
                        className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                      >
                        <ArrowDownToLine className="size-3.5" aria-hidden="true" />
                        <span className="font-mono text-xs">{a.name}</span>
                        <span className="tabular-nums">{formatBytes(a.size)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                {r.body.trim() && (
                  <details open={current} className="group overflow-hidden rounded-2xl border border-fd-border">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium marker:hidden focus-visible:outline-2 focus-visible:outline-fd-ring">
                      <ChevronDown
                        className="size-4 -rotate-90 text-fd-muted-foreground transition-transform group-open:rotate-0"
                        aria-hidden="true"
                      />
                      {m.notes.title}
                      <span className="text-xs font-normal text-fd-muted-foreground">{m.notes.from}</span>
                    </summary>
                    <div className="prose prose-sm max-w-none min-w-0 border-t border-fd-border px-5 py-4 text-sm dark:prose-invert [&_code]:text-[12px] [&_code]:break-all [&_h2]:mt-4 [&_h2]:text-base [&_h2]:first:mt-0 [&_h3]:text-sm [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:my-2 [&_table]:w-full [&_table]:table-fixed [&_td]:py-1.5 [&_td]:align-top [&_td]:break-words [&_th]:break-words [&_td:first-child]:w-[34%] [&_th:first-child]:w-[34%] sm:[&_td:first-child]:w-44 sm:[&_th:first-child]:w-44">
                      <Markdown remarkPlugins={[remarkGfm]}>{r.body}</Markdown>
                    </div>
                  </details>
                )}
              </div>
            ),
          };
        })}
      />
      {releases.length === 1 && <p className="mt-6 text-sm text-fd-muted-foreground">{m.history.firstOnly}</p>}
    </section>
  );
}

function BuildFromSource({ lang, m, collapsed }: { lang: Lang; m: M; collapsed: boolean }) {
  const steps = (
    <>
      <p className="max-w-[65ch] text-fd-muted-foreground">{m.build.lede}</p>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {m.build.steps.map((s, i) => (
          <li key={s.title} className="min-w-0 rounded-2xl border border-fd-border bg-fd-card p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-medium text-fd-primary tabular-nums">{i + 1}</span>
              <h3 className="font-semibold">{s.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
              <Rich text={s.body} />
            </p>
            {s.cmd && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-fd-foreground/[0.05] py-2 ps-3 pe-1">
                <pre className="min-w-0 flex-1 overflow-x-auto py-1 font-mono text-[12.5px] leading-relaxed">
                  <code>{s.cmd}</code>
                </pre>
                <CopyButton text={s.cmd} label={m.build.copy} copiedLabel={m.verify.copied} />
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-5 max-w-[75ch] text-sm leading-6 text-fd-muted-foreground">
        <Rich text={m.build.proxy} /> {m.build.more}{' '}
        <a href={`${github(repos.app)}#readme`} className="text-fd-primary underline-offset-4 hover:underline">
          {m.build.readme}
        </a>
        {m.build.and}
        <Link
          href={localePath(lang, '/docs/getting-started/install')}
          className="text-fd-primary underline-offset-4 hover:underline"
        >
          {m.build.docs}
        </Link>
        {m.build.end}
      </p>
    </>
  );
  if (!collapsed)
    return (
      <section id="build" aria-labelledby="build-title" className="scroll-mt-20">
        <h2 id="build-title" className="mb-3 text-2xl font-semibold tracking-[-0.02em]">
          {m.build.title}
        </h2>
        {steps}
      </section>
    );
  return (
    <details id="build" className="group scroll-mt-20 border-t border-fd-border pt-8">
      <summary className="flex cursor-pointer list-none items-center gap-2 marker:hidden focus-visible:outline-2 focus-visible:outline-fd-ring">
        <ChevronDown
          className="size-5 -rotate-90 text-fd-muted-foreground transition-transform group-open:rotate-0"
          aria-hidden="true"
        />
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">{m.build.title}</h2>
      </summary>
      <div className="mt-4">{steps}</div>
    </details>
  );
}
