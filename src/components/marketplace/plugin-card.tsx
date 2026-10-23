'use client';

import { ArrowUpRight, Star } from 'lucide-react';
import Link from 'next/link';
import type { PointerEvent } from 'react';
import { cn } from '@/lib/cn';
import { marketplaceHref } from '@/lib/marketplace/labels';
import type { MarketplacePlugin } from '@/lib/marketplace/types';
import { CapabilityChip, CloudBadge, KindBadge, TrustBadge } from './badges';
import { PluginIcon } from './plugin-icon';

function spotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

/** Marketplace card. `href={null}` renders a static preview (submit page). */
export function PluginCard({
  plugin,
  href,
  className,
}: {
  plugin: MarketplacePlugin;
  href?: string | null;
  className?: string;
}) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), color-mix(in oklab, var(--color-brand-bright) 13%, transparent), transparent 70%)',
        }}
      />
      <div className="relative flex items-start gap-3">
        <PluginIcon id={plugin.id} icon={plugin.icon} name={plugin.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold tracking-tight text-fd-foreground">{plugin.name}</h3>
            {href !== null && (
              <ArrowUpRight className="size-3.5 shrink-0 -translate-x-1 text-fd-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
            )}
          </div>
          <p className="truncate font-mono text-[11px] text-fd-muted-foreground">{plugin.nameEn ?? plugin.id}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <TrustBadge plugin={plugin} />
        </div>
      </div>
      <p className="relative mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-fd-muted-foreground">
        {plugin.description}
      </p>
      <div className="relative mt-3 mb-3 flex flex-wrap items-center gap-1">
        <KindBadge kind={plugin.kind} endpoint={plugin.endpoint} />
        <CloudBadge plugin={plugin} />
        {plugin.requires.slice(0, 3).map((c) => (
          <CapabilityChip key={c} cap={c} />
        ))}
        {plugin.requires.length > 3 && (
          <span className="font-mono text-[11px] text-fd-muted-foreground">+{plugin.requires.length - 3}</span>
        )}
      </div>
      <div className="relative mt-auto flex items-center justify-between gap-2 border-t border-dashed border-fd-border pt-3 font-mono text-[11px] text-fd-muted-foreground">
        <span className="truncate">{plugin.official ? `@${plugin.author}` : plugin.repo}</span>
        {!plugin.official && plugin.stars !== undefined && (
          <span className="inline-flex shrink-0 items-center gap-1">
            <Star className="size-3" />
            {plugin.stars}
          </span>
        )}
      </div>
    </>
  );
  const cls = cn(
    'group relative flex h-full flex-col rounded-xl border border-fd-border bg-fd-card p-4 transition-[border-color,box-shadow,transform] duration-300 ease-out-strong',
    href !== null &&
      'hover:-translate-y-0.5 hover:border-brand-bright/40 hover:shadow-[0_8px_30px_-12px] hover:shadow-brand/40 focus-visible:outline-2 focus-visible:outline-fd-ring',
    className,
  );
  if (href === null)
    return (
      <div className={cls} onPointerMove={spotlight}>
        {body}
      </div>
    );
  return (
    <Link href={href ?? marketplaceHref(plugin)} className={cls} onPointerMove={spotlight}>
      {body}
    </Link>
  );
}
