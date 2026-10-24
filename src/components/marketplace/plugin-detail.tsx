import { Markdown } from 'fumadocs-core/content/md';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import {
  ArrowUpRight,
  CircleCheck,
  Cloud,
  Globe,
  Hand,
  KeyRound,
  LayoutGrid,
  Lock,
  Package,
  Server,
  ShieldCheck,
  Smartphone,
  Star,
  TriangleAlert,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import type { ReactNode } from 'react';
import { CodePanel, type CodePanelFile } from '@/components/ui/code-panel';
import { cn } from '@/lib/cn';
import { type Lang, localePath } from '@/lib/i18n';
import {
  ABILITY,
  appServerName,
  CAMPUS_SERVICE,
  CAPABILITY,
  CLOUD_SERVICE,
  capabilityExplain,
  EFFECT,
  MODE,
  pluginDescription,
  pluginName,
  visibleTags,
} from '@/lib/marketplace/labels';
import type { MarketplacePlugin } from '@/lib/marketplace/types';
import { t } from '@/lib/messages';
import { CloudBadge, GitHubIcon, KindBadge, TrustBadge } from './badges';
import { CopyField } from './copy-field';
import { highlight } from './highlight';
import { PluginCard } from './plugin-card';
import { PluginIcon } from './plugin-icon';

type M = ReturnType<typeof t>['marketplace'];

/** The manifest as the marketplace understood it (derived fields removed, empty fields dropped). */
export function normalizedManifest(p: MarketplacePlugin) {
  const m: Record<string, unknown> = {
    id: p.id,
    name: p.name,
    description: p.description,
    author: p.author,
    kind: p.kind,
    endpoint: p.endpoint,
    auth: p.auth,
    icon: p.icon,
    requires: p.requires,
    scopes: p.scopes,
    tags: p.tags,
    cloud: p.cloud,
    version: p.version,
    license: p.license,
    homepage: p.homepage,
    i18n: p.nameEn || p.descriptionEn ? { en: { name: p.nameEn, description: p.descriptionEn } } : undefined,
  };
  for (const k of Object.keys(m))
    if (m[k] === undefined || (Array.isArray(m[k]) && !(m[k] as unknown[]).length && k !== 'requires')) delete m[k];
  return m;
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24">
      <h2 id={id} className="text-xl font-semibold tracking-[-0.02em]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Crumbs({ plugin, lang, m }: { plugin: MarketplacePlugin; lang: Lang; m: M }) {
  const [owner, repo, id] = plugin.slug.split('/');
  const parts: [string, string | null, boolean][] = [
    [m.root, localePath(lang, '/marketplace'), false],
    [owner, localePath(lang, `/marketplace/${owner}`), true],
    [repo, localePath(lang, `/marketplace/${owner}/${repo}`), true],
    [id, null, true],
  ];
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fd-muted-foreground">
        {parts.map(([label, href, mono], i) => (
          <li key={label + String(i)} className="inline-flex min-w-0 items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="opacity-40">
                /
              </span>
            )}
            {href ? (
              <Link href={href} className={cn('truncate hover:text-fd-foreground', mono && 'font-mono text-xs')}>
                {label}
              </Link>
            ) : (
              <span aria-current="page" className={cn('truncate text-fd-foreground', mono && 'font-mono text-xs')}>
                {label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

const EFFECT_TONE = {
  neutral: 'bg-fd-muted text-fd-muted-foreground',
  notice: 'bg-pku-amber/12 text-pku-gold dark:text-pku-amber',
  warn: 'bg-brand-bright/12 text-brand dark:text-fd-primary',
};

function Row({
  icon,
  label,
  hint,
  tone = 'neutral',
  children,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  tone?: 'neutral' | 'warn';
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 px-5 py-4 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-6">
      <dt className="flex items-start gap-2.5 text-sm font-medium">
        <span
          aria-hidden="true"
          className={cn(
            'mt-px flex size-6 shrink-0 items-center justify-center rounded-md [&_svg]:size-3.5',
            tone === 'warn'
              ? 'bg-brand-bright/12 text-brand dark:text-fd-primary'
              : 'bg-fd-muted text-fd-muted-foreground',
          )}
        >
          {icon}
        </span>
        <span className="pt-0.5">
          {label}
          {hint && <span className="block text-xs font-normal text-fd-muted-foreground">{hint}</span>}
        </span>
      </dt>
      <dd className="min-w-0 sm:pt-0.5">{children}</dd>
    </div>
  );
}

/** What the app's permission sheet will show before install (spec §9), in plain words. */
function Permissions({ plugin, lang, m }: { plugin: MarketplacePlugin; lang: Lang; m: M }) {
  const p = m.detail.permissions;
  const none = <p className="text-sm text-fd-muted-foreground">{p.none}</p>;
  const tools = plugin.tools ?? [];
  const sep = lang === 'zh' ? '、' : ', ';
  return (
    <Section id="permissions" title={p.title}>
      <p className="mb-5 max-w-[65ch] text-sm leading-6 text-fd-muted-foreground">{p.lede}</p>
      <dl className="divide-y divide-fd-border overflow-hidden rounded-2xl border border-fd-border bg-fd-card">
        <Row icon={<KeyRound />} label={p.campus} hint={p.campusHint} tone={plugin.campus?.length ? 'warn' : 'neutral'}>
          {plugin.campus?.length ? (
            <>
              <ul className="flex flex-wrap gap-2">
                {plugin.campus.map((c) => (
                  <li key={c} className="rounded-lg bg-brand-bright/10 px-2.5 py-1 text-sm">
                    <span className="font-medium">{CAMPUS_SERVICE[c]?.[lang] ?? c}</span>
                    {CAMPUS_SERVICE[c]?.host && (
                      <span className="ms-1.5 font-mono text-[11px] text-fd-muted-foreground">
                        {CAMPUS_SERVICE[c]?.host}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 text-xs leading-5 text-fd-muted-foreground">{p.campusNote}</p>
            </>
          ) : (
            none
          )}
        </Row>
        <Row icon={<Globe />} label={p.network}>
          {plugin.network?.length ? (
            <ul className="flex flex-wrap gap-2">
              {plugin.network.map((h) => (
                <li key={h} className="rounded-lg bg-fd-muted px-2.5 py-1 font-mono text-xs">
                  {h}
                </li>
              ))}
            </ul>
          ) : (
            none
          )}
        </Row>
        <Row icon={<Smartphone />} label={p.abilities}>
          {plugin.abilities?.length ? (
            <ul className="space-y-1 text-sm">
              {plugin.abilities.map((a) => (
                <li key={a}>{ABILITY[a]?.[lang] ?? a}</li>
              ))}
            </ul>
          ) : (
            none
          )}
        </Row>
        <Row icon={<Wrench />} label={p.tools}>
          {tools.length ? (
            <ul className="divide-y divide-fd-border/60">
              {tools.map((tool) => {
                const e = tool.effect ? EFFECT[tool.effect] : undefined;
                return (
                  <li key={tool.name} className="flex items-center gap-3 py-2 text-sm first:pt-0 last:pb-0">
                    <span className="min-w-0 flex-1">
                      {(lang === 'en' ? tool.titleEn : undefined) ?? tool.title ?? tool.name}
                      <span className="ms-2 font-mono text-[11px] text-fd-muted-foreground">
                        {plugin.id}.{tool.name}
                      </span>
                      {(() => {
                        const summary = (lang === 'en' ? tool.summaryEn : undefined) ?? tool.summary;
                        return summary ? (
                          <span className="mt-0.5 block text-xs text-fd-muted-foreground">{summary}</span>
                        ) : null;
                      })()}
                    </span>
                    {tool.userOnly && <span className="text-xs text-fd-muted-foreground">{p.manualOnly}</span>}
                    <span
                      className={cn(
                        'shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                        e ? EFFECT_TONE[e.tone] : EFFECT_TONE.neutral,
                      )}
                    >
                      {e ? e[lang] : p.effectUnknown}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : plugin.kind === 'remote' ? (
            <p className="text-sm text-fd-muted-foreground">{p.toolsRemote}</p>
          ) : (
            none
          )}
        </Row>
        {Boolean(plugin.widgets?.length || plugin.screens?.length || plugin.commands?.length) && (
          <Row icon={<LayoutGrid />} label={p.ui}>
            <ul className="space-y-1 text-sm">
              {plugin.widgets?.length ? (
                <li>
                  <span className="text-fd-muted-foreground">{p.widgets}: </span>
                  {plugin.widgets.join(sep)}
                </li>
              ) : null}
              {plugin.screens?.length ? (
                <li>
                  <span className="text-fd-muted-foreground">{p.screens}: </span>
                  {plugin.screens.join(sep)}
                </li>
              ) : null}
              {plugin.commands?.map((c) => (
                <li key={c.name}>
                  <span className="font-mono">/{c.name}</span>{' '}
                  <span className="text-fd-muted-foreground">{c.description}</span>
                </li>
              ))}
            </ul>
          </Row>
        )}
        {plugin.defaultModes && Object.keys(plugin.defaultModes).length > 0 && (
          <Row icon={<Hand />} label={p.modes}>
            <ul className="flex flex-wrap gap-2 text-xs">
              {Object.entries(plugin.defaultModes).map(([k, v]) => (
                <li key={k} className="rounded-md bg-fd-muted px-2 py-1">
                  {EFFECT[k]?.[lang] ?? k}
                  <span className="text-fd-muted-foreground">{lang === 'zh' ? '：' : ': '}</span>
                  {v ? MODE[v]?.[lang] : ''}
                </li>
              ))}
            </ul>
            {!plugin.verified && <p className="mt-2 text-xs leading-5 text-fd-muted-foreground">{p.modesUnverified}</p>}
          </Row>
        )}
      </dl>
    </Section>
  );
}

/** QR code of a link, rendered on the server (dark on white so any camera reads it). */
async function Qr({ value, alt }: { value: string; alt: string }) {
  const svg = await QRCode.toString(value, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#0a0a0a', light: '#ffffff' },
  });
  return (
    // biome-ignore lint/performance/noImgElement: inline SVG data URI, nothing to optimise
    <img
      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
      alt={alt}
      width={112}
      height={112}
      className="size-28 shrink-0 rounded-lg bg-white p-2"
    />
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-2.5">
      {items.map((body, i) => (
        <li key={String(i)} className="grid grid-cols-[20px_1fr] gap-3 text-sm leading-6 text-fd-muted-foreground">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-5 items-center justify-center rounded-full border border-fd-border text-[11px] tabular-nums"
          >
            {i + 1}
          </span>
          <span>{body}</span>
        </li>
      ))}
    </ol>
  );
}

function InstallCard({ plugin, lang, m }: { plugin: MarketplacePlugin; lang: Lang; m: M }) {
  const d = m.detail.install;
  const name = pluginName(plugin, lang);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-fd-border bg-fd-card">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-bright/70 to-transparent"
      />
      <div className="p-5">
        <h2 className="font-semibold">{d.title}</h2>
        {plugin.installUrl && plugin.deepLink && plugin.kind !== 'builtin' ? (
          <>
            <a
              href={plugin.deepLink}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-10px] shadow-brand/80 transition-[transform,background-color] hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring active:scale-[0.98]"
            >
              <Smartphone className="size-4" aria-hidden="true" />
              {d.open}
            </a>
            <div className="mt-4 flex items-center gap-4">
              <Qr value={plugin.deepLink} alt={d.qrAlt(name)} />
              <p className="text-xs leading-5 text-fd-muted-foreground">{d.qr}</p>
            </div>
            <div className="mt-5">
              <Steps items={d.steps} />
            </div>
            <CopyField className="mt-5" label={d.link} value={plugin.installUrl} />
            {plugin.endpoint && <CopyField className="mt-3" label={d.endpoint} value={plugin.endpoint} />}
          </>
        ) : plugin.kind === 'builtin' ? (
          <>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium">
              <Package className="size-4 text-fd-muted-foreground" aria-hidden="true" />
              {d.builtin}
            </p>
            <div className="mt-4">
              <Steps items={d.builtinSteps(name)} />
            </div>
          </>
        ) : plugin.endpoint ? (
          <>
            <div className="mt-4">
              <Steps items={[...d.remoteSteps(name), ...(plugin.auth === 'bearer' ? [d.bearerStep] : [])]} />
            </div>
            <CopyField className="mt-5" label={d.endpoint} value={plugin.endpoint} />
          </>
        ) : (
          <>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium">
              <Server className="size-4 text-fd-muted-foreground" aria-hidden="true" />
              {d.selfHosted}
            </p>
            <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{d.selfHostedBody}</p>
            <a
              href={plugin.source}
              className="mt-3 inline-flex items-center gap-1 text-sm text-fd-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {d.deploy}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </>
        )}
        <CopyField className="mt-4" label={m.detail.handle} value={plugin.handle ?? plugin.slug} />
        {plugin.kind === 'remote' && (
          <p className="mt-3 text-xs text-fd-muted-foreground">
            {d.installsAs} <span className="font-mono text-fd-foreground">{appServerName(plugin)}</span>
            {plugin.auth === 'bearer' && (
              <span className="ms-2 inline-flex items-center gap-1">
                <KeyRound className="size-3" aria-hidden="true" />
                {d.bearer}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function Meta({ plugin, m }: { plugin: MarketplacePlugin; m: M }) {
  const d = m.detail.meta;
  const rows: [string, ReactNode][] = [
    [d.author, `@${plugin.author}`],
    [
      d.repo,
      <a
        key="r"
        href={`https://github.com/${plugin.repo}`}
        target="_blank"
        rel="noreferrer"
        className="hover:text-fd-primary"
      >
        {plugin.repo}
      </a>,
    ],
    [d.folder, plugin.path || '/'],
  ];
  if (plugin.version) rows.push([d.version, plugin.version]);
  if (plugin.license) rows.push([d.license, plugin.license]);
  if (plugin.stars !== undefined && !plugin.official)
    rows.push([
      d.stars,
      <span key="s" className="inline-flex items-center gap-1">
        <Star className="size-3" aria-hidden="true" />
        {plugin.stars}
      </span>,
    ]);
  if (plugin.addedAt) rows.push([d.added, plugin.addedAt]);
  if (plugin.updatedAt) rows.push([d.updated, plugin.updatedAt.slice(0, 10)]);
  const btn =
    'inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-fd-border text-sm transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-ring';
  return (
    <div className="rounded-2xl border border-fd-border p-5">
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-fd-muted-foreground">{k}</dt>
            <dd className="truncate text-right font-mono text-xs leading-5 text-fd-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex gap-2">
        <a href={plugin.source} target="_blank" rel="noreferrer" className={btn}>
          <GitHubIcon className="size-3.5" />
          {d.source}
        </a>
        {plugin.homepage && (
          <a href={plugin.homepage} target="_blank" rel="noreferrer" className={btn}>
            <Globe className="size-3.5" aria-hidden="true" />
            {d.homepage}
          </a>
        )}
      </div>
    </div>
  );
}

function Checks({ plugin, m }: { plugin: MarketplacePlugin; m: M }) {
  const c = m.detail.checks;
  const items: { ok: boolean; text: ReactNode }[] = [];
  if (plugin.official) items.push({ ok: true, text: c.official });
  else if (plugin.verified) items.push({ ok: true, text: c.verified });
  else items.push({ ok: false, text: c.unverified });
  if (plugin.kind === 'declarative') {
    items.push({ ok: true, text: c.declarative });
    items.push({ ok: true, text: c.scoped });
    if (!plugin.verified) items.push({ ok: true, text: c.unverifiedAsk });
  }
  if (plugin.kind === 'remote') {
    items.push({ ok: true, text: c.remoteServer });
    items.push({ ok: true, text: c.remoteNoPassword });
  }
  if (plugin.cloud?.uses.length) items.push({ ok: true, text: c.cloud });
  for (const w of plugin.warnings ?? [])
    items.push({ ok: false, text: <span className="font-mono text-xs">{w}</span> });
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={String(i)} className="flex gap-2.5 text-sm leading-6">
          {it.ok ? (
            <CircleCheck className="mt-1 size-4 shrink-0 text-up" aria-hidden="true" />
          ) : (
            <TriangleAlert className="mt-1 size-4 shrink-0 text-pku-gold dark:text-pku-amber" aria-hidden="true" />
          )}
          <span className={it.ok ? '' : 'text-fd-muted-foreground'}>{it.text}</span>
        </li>
      ))}
    </ul>
  );
}

export async function PluginDetail({
  plugin,
  siblings,
  lang,
}: {
  plugin: MarketplacePlugin;
  siblings: MarketplacePlugin[];
  lang: Lang;
}) {
  const m = t(lang).marketplace;
  const d = m.detail;
  const json = JSON.stringify(normalizedManifest(plugin), null, 2);
  const files: CodePanelFile[] = [];
  if (plugin.manifestSource)
    files.push({
      id: 'raw',
      label: d.manifest.tabRaw,
      code: plugin.manifestSource,
      html: await highlight(plugin.manifestSource, 'yaml'),
    });
  files.push({ id: 'json', label: d.manifest.tabJson, code: json, html: await highlight(json, 'json') });
  const tags = visibleTags(plugin);
  const name = pluginName(plugin, lang);
  const desc = pluginDescription(plugin, lang);
  const isPluginMd = plugin.format === 'plugin-md';

  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-10 pb-24 md:px-8">
      <Crumbs plugin={plugin} lang={lang} m={m} />

      <header className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start">
        <PluginIcon id={plugin.id} icon={plugin.icon} name={plugin.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{name}</h1>
          <p className="mt-1 font-mono text-xs text-fd-muted-foreground">{plugin.handle ?? plugin.slug}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <TrustBadge plugin={plugin} lang={lang} />
            <KindBadge kind={plugin.kind} endpoint={plugin.endpoint} lang={lang} />
            <CloudBadge plugin={plugin} lang={lang} />
          </div>
          <p lang={desc.lang === 'zh' ? 'zh-CN' : 'en'} className="mt-4 max-w-[65ch] text-base leading-7">
            {desc.text}
          </p>
          {lang === 'en' && desc.lang === 'zh' && (
            <p className="mt-1 text-xs text-fd-muted-foreground">{d.descriptionInZh}</p>
          )}
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tg) => (
                <Link
                  key={tg}
                  href={`${localePath(lang, '/marketplace')}?tag=${encodeURIComponent(tg)}`}
                  className="rounded-md border border-fd-border px-2 py-0.5 font-mono text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
                >
                  #{tg}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:order-2 lg:self-start">
          <InstallCard plugin={plugin} lang={lang} m={m} />
          <Meta plugin={plugin} m={m} />
        </aside>

        <div className="min-w-0 space-y-14 lg:order-1">
          {isPluginMd && <Permissions plugin={plugin} lang={lang} m={m} />}

          <Section id="capabilities" title={d.capabilities.title}>
            {plugin.requires.length === 0 ? (
              <p className="text-sm text-fd-muted-foreground">{d.capabilities.none}</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {plugin.requires.map((c) => {
                  const cap = CAPABILITY[c];
                  return (
                    <li key={c} className="rounded-xl border border-fd-border p-4">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <span
                          aria-hidden="true"
                          className={cn(
                            'size-1.5 rounded-full',
                            cap.tone === 'warn'
                              ? 'bg-brand-bright'
                              : cap.tone === 'notice'
                                ? 'bg-pku-amber'
                                : 'bg-fd-muted-foreground',
                          )}
                        />
                        {cap[lang]}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{capabilityExplain(c, lang)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          {!isPluginMd && (
            <Section id="scopes" title={d.scopes.title}>
              {plugin.scopes.length ? (
                <ul className="flex flex-wrap gap-2">
                  {plugin.scopes.map((s) => (
                    <li
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-fd-muted px-2.5 py-1 font-mono text-xs"
                    >
                      <Globe className="size-3 text-fd-muted-foreground" aria-hidden="true" />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-fd-muted-foreground">
                  {plugin.requires.some((r) => r === 'network' || r === 'campus-network')
                    ? d.scopes.notListed
                    : d.scopes.none}
                </p>
              )}
              {plugin.kind === 'remote' && plugin.endpoint && (
                <p className="mt-3 text-sm text-fd-muted-foreground">
                  {d.scopes.remote(new URL(plugin.endpoint).host)}
                </p>
              )}
            </Section>
          )}

          <Section id="cloud" title={d.cloud.title}>
            {plugin.cloud?.uses.length ? (
              <div className="rounded-2xl border border-pku-amber/30 bg-pku-amber/5 p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Cloud className="size-4 text-pku-gold dark:text-pku-amber" aria-hidden="true" />
                  {d.cloud.uses}
                  {plugin.cloud.uses.map((u) => (
                    <span key={u} className="rounded-md bg-pku-amber/15 px-1.5 py-0.5 text-xs">
                      {CLOUD_SERVICE[u]?.[lang] ?? u}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 text-xs text-fd-muted-foreground">
                    <Lock className="size-3" aria-hidden="true" />
                    {plugin.cloud.e2e ? d.cloud.e2e : d.cloud.notE2e}
                  </span>
                </div>
                <ul className="mt-4 list-disc space-y-1.5 ps-5 text-sm leading-6 marker:text-pku-amber">
                  {(lang === 'en' && plugin.cloud.disclosure.en?.length
                    ? plugin.cloud.disclosure.en
                    : plugin.cloud.disclosure.zh
                  ).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-fd-muted-foreground">
                <ShieldCheck className="size-4 text-up" aria-hidden="true" />
                {d.cloud.none}
              </p>
            )}
          </Section>

          <Section id="checks" title={d.checks.title}>
            <Checks plugin={plugin} m={m} />
          </Section>

          {plugin.instructions && (
            <Section id="instructions" title={d.instructions.title}>
              <p className="mb-3 text-sm text-fd-muted-foreground">{d.instructions.note}</p>
              <div className="prose prose-sm max-w-none rounded-2xl border border-fd-border bg-fd-card/50 p-5 text-sm leading-7 dark:prose-invert [&_code]:font-mono [&_code]:text-[12.5px]">
                <Markdown remarkPlugins={[remarkGfm]}>{plugin.instructions}</Markdown>
              </div>
            </Section>
          )}

          <Section id="manifest" title={d.manifest.title}>
            <p className="mb-3 text-sm text-fd-muted-foreground">
              {plugin.manifestSource ? d.manifest.raw : d.manifest.normalized}{' '}
              {plugin.manifestPath && (
                <>
                  {d.manifest.from}: <span className="font-mono text-xs">{plugin.manifestPath}</span>.{' '}
                </>
              )}
              <Link
                href={localePath(lang, '/docs/marketplace/manifest')}
                className="text-fd-primary underline-offset-4 hover:underline"
              >
                {d.manifest.fields}
              </Link>
            </p>
            <CodePanel
              files={files}
              label={d.manifest.title}
              copyLabel={m.copy.copyValue(d.manifest.title)}
              copiedLabel={m.copy.copied}
            />
          </Section>
        </div>
      </div>

      {siblings.length > 0 && (
        <section aria-labelledby="siblings" className="mt-20 border-t border-fd-border pt-12">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="siblings" className="text-xl font-semibold tracking-[-0.02em]">
              {d.siblings}
            </h2>
            <Link
              href={localePath(lang, `/marketplace/${plugin.repo.toLowerCase()}`)}
              className="inline-flex items-center gap-1 font-mono text-xs text-fd-muted-foreground hover:text-fd-foreground"
            >
              {plugin.repo}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.slice(0, 6).map((p) => (
              <li key={p.slug}>
                <PluginCard plugin={p} lang={lang} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
