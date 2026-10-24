import { BadgeCheck, Cloud, FileText, Package, Radio, Server, ShieldQuestion } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Lang } from '@/lib/i18n';
import { CAPABILITY, capabilityExplain } from '@/lib/marketplace/labels';
import type { Capability, MarketplacePlugin } from '@/lib/marketplace/types';
import { t } from '@/lib/messages';

const base =
  'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap [&_svg]:size-3';

export function Badge({ className, children, title }: { className?: string; children: ReactNode; title?: string }) {
  return (
    <span className={cn(base, className)} title={title}>
      {children}
    </span>
  );
}

export function TrustBadge({ plugin, lang }: { plugin: Pick<MarketplacePlugin, 'official' | 'verified'>; lang: Lang }) {
  const m = t(lang).marketplace.badges;
  if (plugin.official && plugin.verified)
    return (
      <Badge
        className="bg-brand-bright/12 text-brand ring-1 ring-inset ring-brand-bright/25 dark:text-fd-primary"
        title={m.officialTitle}
      >
        <BadgeCheck />
        {m.official}
      </Badge>
    );
  if (plugin.verified)
    return (
      <Badge className="bg-up/10 text-success-fg ring-1 ring-inset ring-up/25" title={m.verifiedTitle}>
        <BadgeCheck />
        {m.verified}
      </Badge>
    );
  return (
    <Badge className="bg-fd-muted text-fd-muted-foreground ring-1 ring-inset ring-fd-border" title={m.communityTitle}>
      <ShieldQuestion />
      {plugin.official ? m.example : m.community}
    </Badge>
  );
}

export function KindBadge({
  kind,
  endpoint,
  lang,
}: {
  kind: MarketplacePlugin['kind'];
  endpoint?: string | null;
  lang: Lang;
}) {
  const m = t(lang).marketplace.badges;
  if (kind === 'remote' && endpoint === null)
    return (
      <Badge className="bg-fd-muted text-fd-muted-foreground" title={m.selfHostedTitle}>
        <Server />
        {m.selfHosted}
      </Badge>
    );
  if (kind === 'declarative')
    return (
      <Badge className="bg-brand-bright/10 font-mono text-brand dark:text-fd-primary" title={m.declarativeTitle}>
        <FileText />
        {m.declarative}
      </Badge>
    );
  return kind === 'builtin' ? (
    <Badge className="bg-fd-muted text-fd-muted-foreground" title={m.builtinTitle}>
      <Package />
      {m.builtin}
    </Badge>
  ) : (
    <Badge className="bg-pku-slate/15 text-info-fg" title={m.remoteTitle}>
      <Radio />
      {m.remote}
    </Badge>
  );
}

export function CloudBadge({ plugin, lang }: { plugin: Pick<MarketplacePlugin, 'cloud'>; lang: Lang }) {
  if (!plugin.cloud?.uses.length) return null;
  const m = t(lang).marketplace.badges;
  return (
    <Badge
      className="bg-pku-amber/12 text-pku-gold ring-1 ring-inset ring-pku-amber/25 dark:text-pku-amber"
      title={m.cloudTitle}
    >
      <Cloud />
      {plugin.cloud.e2e ? m.cloudE2e : m.cloud}
    </Badge>
  );
}

const TONE = {
  neutral: 'bg-fd-muted/70 text-fd-muted-foreground',
  notice: 'bg-pku-amber/10 text-pku-gold dark:text-pku-amber/90',
  warn: 'bg-brand-bright/10 text-brand dark:text-fd-primary',
};

export function CapabilityChip({ cap, lang, className }: { cap: Capability; lang: Lang; className?: string }) {
  const c = CAPABILITY[cap];
  if (!c) return null;
  return (
    <Badge className={cn('font-normal', TONE[c.tone], className)} title={capabilityExplain(cap, lang)}>
      {c[lang]}
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
