import { BadgeCheck, Cloud, Package, Radio, Server, ShieldQuestion } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CAPABILITY } from '@/lib/marketplace/labels';
import type { Capability, MarketplacePlugin } from '@/lib/marketplace/types';

const base =
  'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap';

export function Badge({ className, children, title }: { className?: string; children: ReactNode; title?: string }) {
  return (
    <span className={cn(base, className)} title={title}>
      {children}
    </span>
  );
}

export function TrustBadge({ plugin }: { plugin: Pick<MarketplacePlugin, 'official' | 'verified'> }) {
  if (plugin.official && plugin.verified)
    return (
      <Badge
        className="bg-brand-bright/12 text-fd-primary ring-1 ring-inset ring-brand-bright/25"
        title="Maintained by pkuinfo, reviewed"
      >
        <BadgeCheck className="size-3" />
        官方
      </Badge>
    );
  if (plugin.verified)
    return (
      <Badge className="bg-up/10 text-up ring-1 ring-inset ring-up/25" title="A maintainer reviewed the source">
        <BadgeCheck className="size-3" />
        已审核
      </Badge>
    );
  return (
    <Badge
      className="bg-fd-muted text-fd-muted-foreground ring-1 ring-inset ring-fd-border"
      title="Listed automatically; not reviewed yet"
    >
      <ShieldQuestion className="size-3" />
      {plugin.official ? '官方 · 示例' : '社区'}
    </Badge>
  );
}

export function KindBadge({ kind, endpoint }: { kind: MarketplacePlugin['kind']; endpoint?: string | null }) {
  if (kind === 'remote' && endpoint === null)
    return (
      <Badge
        className="bg-fd-muted text-fd-muted-foreground"
        title="No public instance: deploy it yourself from source"
      >
        <Server className="size-3" />
        自部署
      </Badge>
    );
  return kind === 'builtin' ? (
    <Badge className="bg-fd-muted text-fd-muted-foreground" title="Ships inside the app">
      <Package className="size-3" />
      内置
    </Badge>
  ) : (
    <Badge className="bg-pku-slate/15 text-pku-navy dark:text-[#9fb3dc]" title="An MCP server you add by URL">
      <Radio className="size-3" />
      远程
    </Badge>
  );
}

export function CloudBadge({ plugin }: { plugin: Pick<MarketplacePlugin, 'cloud'> }) {
  if (!plugin.cloud?.uses.length) return null;
  return (
    <Badge
      className="bg-pku-amber/12 text-pku-gold dark:text-pku-amber ring-1 ring-inset ring-pku-amber/25"
      title="Sends data to PKU Harness Cloud"
    >
      <Cloud className="size-3" />云{plugin.cloud.e2e ? ' · 端到端加密' : ''}
    </Badge>
  );
}

const TONE = {
  neutral: 'bg-fd-muted/70 text-fd-muted-foreground',
  notice: 'bg-pku-amber/10 text-pku-gold dark:text-pku-amber/90',
  warn: 'bg-brand-bright/10 text-brand dark:text-[#ff8a96]',
};

export function CapabilityChip({
  cap,
  lang = 'zh',
  className,
}: {
  cap: Capability;
  lang?: 'zh' | 'en';
  className?: string;
}) {
  const c = CAPABILITY[cap];
  if (!c) return null;
  return (
    <Badge className={cn('font-mono font-normal', TONE[c.tone], className)} title={c.explain}>
      {lang === 'zh' ? c.zh : c.en}
    </Badge>
  );
}

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
