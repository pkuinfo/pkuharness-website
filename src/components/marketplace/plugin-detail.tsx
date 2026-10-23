import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import {
  ArrowUpRight,
  CircleCheck,
  Cloud,
  Globe,
  KeyRound,
  Lock,
  Package,
  Server,
  ShieldCheck,
  Star,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { appServerName, CAPABILITY, CLOUD_SERVICE, visibleTags } from '@/lib/marketplace/labels';
import type { MarketplacePlugin } from '@/lib/marketplace/types';
import { CloudBadge, GitHubIcon, KindBadge, TrustBadge } from './badges';
import { CopyField } from './copy-field';
import { PluginCard } from './plugin-card';
import { PluginIcon } from './plugin-icon';

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

function Section({
  title,
  en,
  children,
  className,
}: {
  title: string;
  en: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border-t border-fd-border pt-8', className)}>
      <h2 className="flex items-baseline gap-2 text-lg font-semibold tracking-tight">
        {title}
        <span className="font-mono text-xs font-normal text-fd-muted-foreground">{en}</span>
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Crumbs({ plugin }: { plugin: MarketplacePlugin }) {
  const [owner, repo, id] = plugin.slug.split('/');
  const parts: [string, string | null][] = [
    ['marketplace', '/marketplace'],
    [owner, `/marketplace/${owner}`],
    [repo, `/marketplace/${owner}/${repo}`],
    [id, null],
  ];
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-fd-muted-foreground"
    >
      {parts.map(([label, href], i) => (
        <span key={label + String(i)} className="inline-flex items-center gap-1.5">
          {i > 0 && <span className="opacity-50">/</span>}
          {href ? (
            <Link href={href} className="hover:text-fd-foreground">
              {label}
            </Link>
          ) : (
            <span className="text-fd-foreground">{label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function InstallCard({ plugin }: { plugin: MarketplacePlugin }) {
  const step = (n: number, body: ReactNode) => (
    <li className="flex gap-3">
      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-fd-border font-mono text-[10px] text-fd-muted-foreground">
        {n}
      </span>
      <span className="text-sm leading-6">{body}</span>
    </li>
  );
  const path = <span className="font-medium text-fd-foreground">设置 → 插件 → 插件市场</span>;
  return (
    <div className="relative overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-bright/70 to-transparent"
      />
      <div className="p-5">
        <p className="font-mono text-[11px] tracking-wider text-fd-primary">ADD TO PKU HARNESS</p>
        {plugin.kind === 'builtin' ? (
          <>
            <p className="mt-3 flex items-center gap-2 font-medium">
              <Package className="size-4 text-fd-muted-foreground" />随 App 内置
            </p>
            <ol className="mt-3 space-y-2 text-fd-muted-foreground">
              {step(1, <>安装或更新 PKU Harness。</>)}
              {step(
                2,
                <>
                  打开 {path}，找到「{plugin.name}」并启用。
                </>,
              )}
            </ol>
          </>
        ) : plugin.endpoint ? (
          <>
            <ol className="mt-3 space-y-2 text-fd-muted-foreground">
              {step(
                1,
                <>
                  在 App 中打开 {path}，搜索「{plugin.name}」。
                </>,
              )}
              {step(2, <>或选择添加远程插件，粘贴下面的地址。</>)}
              {plugin.auth === 'bearer' && step(3, <>向插件作者获取令牌并粘贴；令牌只保存在你手机的钥匙串里。</>)}
            </ol>
            <CopyField className="mt-4" label="MCP endpoint" value={plugin.endpoint} />
          </>
        ) : (
          <>
            <p className="mt-3 flex items-center gap-2 font-medium">
              <Server className="size-4 text-fd-muted-foreground" />
              自行部署 · Self-hosted
            </p>
            <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
              作者没有提供公共服务。按源码部署到你自己的 HTTPS 服务器，再在 {path} 中粘贴你的地址。
            </p>
            <a
              href={plugin.source}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-fd-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              查看部署说明 <ArrowUpRight className="size-3.5" />
            </a>
          </>
        )}
        <CopyField className="mt-4" label="Handle" value={plugin.slug} />
        {plugin.kind === 'remote' && (
          <p className="mt-3 font-mono text-[11px] text-fd-muted-foreground">
            installs as <span className="text-fd-foreground">{appServerName(plugin)}</span>
            {plugin.auth === 'bearer' && (
              <>
                {' '}
                · <KeyRound className="inline size-3" /> bearer token
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function Meta({ plugin }: { plugin: MarketplacePlugin }) {
  const rows: [string, ReactNode][] = [
    ['作者', <span key="a">@{plugin.author}</span>],
    [
      '仓库',
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
    ['目录', plugin.path || '/'],
  ];
  if (plugin.version) rows.push(['版本', plugin.version]);
  if (plugin.license) rows.push(['许可', plugin.license]);
  if (plugin.stars !== undefined && !plugin.official)
    rows.push([
      'Stars',
      <span key="s" className="inline-flex items-center gap-1">
        <Star className="size-3" />
        {plugin.stars}
      </span>,
    ]);
  if (plugin.addedAt) rows.push(['收录', plugin.addedAt]);
  if (plugin.updatedAt) rows.push(['更新', plugin.updatedAt.slice(0, 10)]);
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-xl border border-fd-border p-5 font-mono text-xs">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-fd-muted-foreground">{k}</dt>
          <dd className="min-w-0 truncate text-right text-fd-foreground">{v}</dd>
        </div>
      ))}
      <div className="col-span-2 mt-2 flex gap-2 border-t border-dashed border-fd-border pt-3">
        <a
          href={plugin.source}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-fd-border py-1.5 font-sans text-xs transition-colors hover:bg-fd-accent"
        >
          <GitHubIcon className="size-3.5" /> 源码
        </a>
        {plugin.homepage && (
          <a
            href={plugin.homepage}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-fd-border py-1.5 font-sans text-xs transition-colors hover:bg-fd-accent"
          >
            <Globe className="size-3.5" /> 主页
          </a>
        )}
      </div>
    </dl>
  );
}

function Checks({ plugin }: { plugin: MarketplacePlugin }) {
  const items: { ok: boolean; text: ReactNode }[] = [];
  if (plugin.official) items.push({ ok: true, text: '由 pkuinfo 维护，源码在官方插件仓库' });
  else if (plugin.verified) items.push({ ok: true, text: '维护者已阅读源码并标记为已审核' });
  else items.push({ ok: false, text: '尚未人工审核：清单已通过自动检查，但没有人读过它的源码' });
  if (plugin.kind === 'remote') {
    items.push({ ok: true, text: '代码运行在作者的服务器上，不在你的手机上运行' });
    items.push({ ok: true, text: '拿不到你的校园账号密码（App 从不把密码交给远程插件）' });
  }
  if (plugin.cloud?.uses.length) items.push({ ok: true, text: '已声明发送到 PKU Harness Cloud 的数据（见下方）' });
  for (const w of plugin.warnings ?? [])
    items.push({ ok: false, text: <span className="font-mono text-xs">{w}</span> });
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={String(i)} className="flex gap-2.5 text-sm leading-6">
          {it.ok ? (
            <CircleCheck className="mt-1 size-4 shrink-0 text-up" />
          ) : (
            <TriangleAlert className="mt-1 size-4 shrink-0 text-pku-amber" />
          )}
          <span className={it.ok ? '' : 'text-fd-muted-foreground'}>{it.text}</span>
        </li>
      ))}
    </ul>
  );
}

export async function PluginDetail({ plugin, siblings }: { plugin: MarketplacePlugin; siblings: MarketplacePlugin[] }) {
  const manifest = JSON.stringify(normalizedManifest(plugin), null, 2);
  const tags = visibleTags(plugin);
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-24 md:px-6">
      <Crumbs plugin={plugin} />

      <header className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start">
        <PluginIcon id={plugin.id} icon={plugin.icon} name={plugin.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{plugin.name}</h1>
            <TrustBadge plugin={plugin} />
            <KindBadge kind={plugin.kind} endpoint={plugin.endpoint} />
            <CloudBadge plugin={plugin} />
          </div>
          {plugin.nameEn && <p className="mt-1 font-mono text-sm text-fd-muted-foreground">{plugin.nameEn}</p>}
          <p className="mt-4 max-w-2xl text-[15px] leading-7">{plugin.description}</p>
          {plugin.descriptionEn && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-fd-muted-foreground">{plugin.descriptionEn}</p>
          )}
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Link
                  key={t}
                  href={`/marketplace?tag=${encodeURIComponent(t)}`}
                  className="rounded-md border border-fd-border px-2 py-0.5 font-mono text-xs text-fd-muted-foreground hover:text-fd-foreground"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="order-2 min-w-0 space-y-10 lg:order-1">
          <Section title="它能做什么" en="Capabilities">
            {plugin.requires.length === 0 ? (
              <p className="text-sm text-fd-muted-foreground">不需要任何额外能力：不联网、不发通知、不在后台运行。</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {plugin.requires.map((c) => {
                  const cap = CAPABILITY[c];
                  return (
                    <li key={c} className="rounded-lg border border-fd-border p-3.5">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            cap.tone === 'warn'
                              ? 'bg-brand-bright'
                              : cap.tone === 'notice'
                                ? 'bg-pku-amber'
                                : 'bg-fd-muted-foreground',
                          )}
                        />
                        {cap.zh}
                        <span className="font-mono text-[11px] font-normal text-fd-muted-foreground">{c}</span>
                      </p>
                      <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{cap.explainZh}</p>
                      <p className="mt-0.5 text-xs leading-5 text-fd-muted-foreground/70">{cap.explain}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section title="会连到哪里" en="Scopes">
            {plugin.scopes.length ? (
              <ul className="flex flex-wrap gap-2">
                {plugin.scopes.map((s) => (
                  <li
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-md bg-fd-muted px-2.5 py-1 font-mono text-xs"
                  >
                    <Globe className="size-3 text-fd-muted-foreground" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-fd-muted-foreground">
                {plugin.requires.some((r) => r === 'network' || r === 'campus-network')
                  ? '清单没有列出具体的主机。'
                  : '不访问外部主机。'}
              </p>
            )}
            {plugin.kind === 'remote' && plugin.endpoint && (
              <p className="mt-3 text-sm text-fd-muted-foreground">
                App 只和插件服务器 <span className="font-mono text-fd-foreground">{new URL(plugin.endpoint).host}</span>{' '}
                通信；上面的主机由插件服务器访问。
              </p>
            )}
          </Section>

          <Section title="云端数据" en="Cloud disclosure">
            {plugin.cloud?.uses.length ? (
              <div className="rounded-xl border border-pku-amber/30 bg-pku-amber/5 p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Cloud className="size-4 text-pku-amber" />
                  使用
                  {plugin.cloud.uses.map((u) => (
                    <span key={u} className="rounded bg-pku-amber/15 px-1.5 py-0.5 font-mono text-xs">
                      {CLOUD_SERVICE[u]?.zh ?? u} · {u}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 text-xs text-fd-muted-foreground">
                    <Lock className="size-3" />
                    {plugin.cloud.e2e ? '端到端加密' : '非端到端加密'}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plugin.cloud.disclosure.zh.map((line, i) => (
                    <li key={line} className="text-sm leading-6">
                      <span className="mr-2 font-mono text-xs text-pku-amber">→</span>
                      {line}
                      {plugin.cloud?.disclosure.en?.[i] && (
                        <span className="block pl-5 text-xs text-fd-muted-foreground">
                          {plugin.cloud.disclosure.en[i]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-fd-muted-foreground">
                <ShieldCheck className="size-4 text-up" />
                不使用 PKU Harness Cloud。
              </p>
            )}
          </Section>

          <Section title="检查" en="Checks">
            <Checks plugin={plugin} />
          </Section>

          <Section title="清单" en="Manifest">
            <p className="mb-3 text-xs text-fd-muted-foreground">
              市场读到的内容（规范化后）。来源：
              <span className="font-mono">{plugin.manifestPath}</span> ·{' '}
              <Link href="/docs/marketplace/manifest" className="text-fd-primary hover:underline">
                字段说明
              </Link>
            </p>
            <ServerCodeBlock code={manifest} lang="json" />
          </Section>
        </div>

        <aside className="order-1 space-y-4 lg:sticky lg:top-20 lg:order-2 lg:self-start">
          <InstallCard plugin={plugin} />
          <Meta plugin={plugin} />
        </aside>
      </div>

      {siblings.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-semibold tracking-tight">同一仓库的插件</h2>
            <Link
              href={`/marketplace/${plugin.repo.toLowerCase()}`}
              className="font-mono text-xs text-fd-muted-foreground hover:text-fd-foreground"
            >
              {plugin.repo} →
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.slice(0, 6).map((p) => (
              <li key={p.slug}>
                <PluginCard plugin={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
