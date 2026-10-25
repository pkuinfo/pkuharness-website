import { ArrowUpRight, BadgeCheck, KeyRound, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { Lang } from '@/lib/i18n';
import { CAMPUS_SERVICE, marketplaceHref, pluginDescription, pluginName } from '@/lib/marketplace/labels';
import type { MarketplacePlugin } from '@/lib/marketplace/types';
import { t } from '@/lib/messages';
import { CloudBadge, KindBadge, TrustBadge } from './badges';
import { PluginIcon } from './plugin-icon';

/**
 * Marketplace card. The footer is the plugin's "permission strip": which campus services it uses
 * with your session, or that it needs none, so plugins can be compared at a glance.
 * `href={null}` renders a static preview (submit page). Linked cards lift a little on hover.
 */
export function PluginCard({
  plugin,
  lang,
  href,
  className,
}: {
  plugin: MarketplacePlugin;
  lang: Lang;
  href?: string | null;
  className?: string;
}) {
  const m = t(lang).marketplace;
  const name = pluginName(plugin, lang);
  const desc = pluginDescription(plugin, lang);
  const campus = plugin.campus ?? [];
  // English page without an English name: show the original Chinese name under the fallback.
  const original = lang === 'en' && !plugin.nameEn && name !== plugin.name;
  const sub = original ? plugin.name : plugin.official ? plugin.id : plugin.repo;
  const body = (
    <>
      <div className="flex items-start gap-3">
        <span className="shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.04]">
          <PluginIcon id={plugin.id} icon={plugin.icon} name={plugin.name} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="flex items-center gap-1.5 font-semibold tracking-tight text-fd-foreground">
            <span className="truncate">{name}</span>
            {plugin.official && plugin.verified && (
              <span title={m.card.official} className="shrink-0">
                <BadgeCheck className="size-4 text-fd-muted-foreground" aria-hidden="true" />
                <span className="sr-only">{m.card.official}</span>
              </span>
            )}
          </h3>
          <p
            lang={original ? 'zh-CN' : undefined}
            className={cn('truncate text-fd-muted-foreground', original ? 'text-xs' : 'font-mono text-[11px]')}
          >
            {sub}
          </p>
        </div>
        {href !== null && (
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 shrink-0 text-fd-muted-foreground opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        )}
      </div>
      <p
        lang={desc.lang === 'zh' ? 'zh-CN' : 'en'}
        className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-fd-muted-foreground"
      >
        {desc.text}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1">
        {(!plugin.official || !plugin.verified) && <TrustBadge plugin={plugin} lang={lang} />}
        {plugin.kind !== 'builtin' && <KindBadge kind={plugin.kind} endpoint={plugin.endpoint} lang={lang} />}
        <CloudBadge plugin={plugin} lang={lang} />
      </div>
      <div className="mt-auto flex items-center gap-2 pt-4 text-xs">
        {campus.length ? (
          <p className="flex min-w-0 flex-1 items-center gap-1.5" title={m.card.campusLabel}>
            <KeyRound className="size-3.5 shrink-0 text-brand dark:text-fd-primary" aria-hidden="true" />
            <span className="sr-only">{m.card.campusLabel}</span>
            <span className="truncate text-fd-foreground">
              {campus
                .slice(0, 2)
                .map((c) => CAMPUS_SERVICE[c]?.[lang] ?? c)
                .join(lang === 'zh' ? '、' : ', ')}
            </span>
            {campus.length > 2 && (
              <span className="shrink-0 text-fd-muted-foreground">{m.card.more(campus.length - 2)}</span>
            )}
          </p>
        ) : plugin.requires.includes('campus-session') ? (
          <p className="flex min-w-0 flex-1 items-center gap-1.5 text-fd-foreground">
            <KeyRound className="size-3.5 shrink-0 text-brand dark:text-fd-primary" aria-hidden="true" />
            {m.card.usesSession}
          </p>
        ) : (
          <p className="flex min-w-0 flex-1 items-center gap-1.5 text-fd-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0 text-up" aria-hidden="true" />
            {m.card.noCampus}
          </p>
        )}
        {!plugin.official && plugin.stars !== undefined && (
          <span className="inline-flex shrink-0 items-center gap-1 text-fd-muted-foreground tabular-nums">
            <Star className="size-3" aria-hidden="true" />
            {plugin.stars}
            <span className="sr-only">{m.stars}</span>
          </span>
        )}
      </div>
    </>
  );
  const cls = cn(
    'group relative flex h-full flex-col rounded-2xl border border-fd-border bg-fd-card p-4 transition-[border-color,background-color,transform,box-shadow] duration-300 ease-out',
    href !== null &&
      'hover:-translate-y-0.5 hover:border-fd-foreground/20 hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring motion-reduce:hover:translate-y-0',
    className,
  );
  if (href === null) return <div className={cls}>{body}</div>;
  return (
    <Link href={href ?? marketplaceHref(plugin, lang)} className={cls}>
      {body}
    </Link>
  );
}
