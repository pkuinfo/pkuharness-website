'use client';

import { ArrowUpRight, Hand } from 'lucide-react';
import { useInView, useReducedMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from '@/components/brand/logo';
import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/cn';
import { pluginIcon } from './plugin-icon';
import type { OrbitGroup, OrbitPlugin } from './plugin-orbit-scene';
import { useThemeTone } from './use-theme-tone';

const Scene = dynamic(() => import('./plugin-orbit-scene'), { ssr: false, loading: () => null });

export interface OrbitLabels {
  label: string;
  hint: string;
  countLabel: string;
  groups: Record<OrbitGroup, string>;
  groupBody: Record<OrbitGroup, string>;
  open: string;
  browse: string;
}

const GROUP_ORDER: OrbitGroup[] = ['campus', 'core', 'remote'];
const DOT: Record<OrbitGroup, string> = {
  campus: 'bg-brand-bright dark:bg-[#ff5a6a]',
  core: 'bg-pku-gold dark:bg-pku-sand',
  remote: 'bg-pku-slate dark:bg-[#9fb3dc]',
};

/**
 * The marketplace as a small solar system: the app in the middle, each plugin a bead on a ring.
 * The 3D scene (`plugin-orbit-scene.tsx`) loads only when the section comes near the viewport.
 * Everything it shows is also in the DOM: a panel with the chosen plugin and, below, every plugin
 * as a button grouped by ring. The buttons drive the scene (hover or focus to highlight, press to
 * choose), so the diagram works with a keyboard and a screen reader, and without WebGL.
 */
export function PluginOrbit({
  plugins,
  labels,
  hrefs,
  browseHref,
  initial,
}: {
  plugins: OrbitPlugin[];
  labels: OrbitLabels;
  /** Marketplace page per plugin id. */
  hrefs: Record<string, string>;
  browseHref: string;
  initial?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const near = useInView(wrap, { once: true, margin: '600px 0px' });
  const visible = useInView(wrap, { margin: '80px 0px' });
  const reduce = Boolean(useReducedMotion());
  const tone = useThemeTone();
  const [pageVisible, setPageVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const shownId = hoverId ?? activeId ?? initial ?? plugins[0]?.id;
  const shown = plugins.find((p) => p.id === shownId);
  const drag = useRef<{ yaw: number; pitch: number; kick?: () => void }>({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const on = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  useEffect(() => {
    if (near) {
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [near]);

  // Horizontal drag turns the system; the page keeps vertical scrolling (touch-action: pan-y).
  const last = useRef<{ x: number; y: number } | null>(null);
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!last.current || (e.pointerType === 'mouse' && e.buttons !== 1)) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    drag.current.yaw += dx * 0.006;
    if (e.pointerType === 'mouse')
      drag.current.pitch = Math.max(-0.35, Math.min(0.45, drag.current.pitch + dy * 0.003));
    drag.current.kick?.();
  };
  const onUp = () => {
    last.current = null;
  };

  const groups = useMemo(
    () => GROUP_ORDER.map((g) => ({ g, items: plugins.filter((p) => p.group === g) })).filter((x) => x.items.length),
    [plugins],
  );
  const pick = (id: string) => setActiveId((cur) => (cur === id ? null : id));

  const ShownIcon = pluginIcon(shown?.icon);
  return (
    <div>
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-12">
        <div
          ref={wrap}
          role="img"
          aria-label={labels.label}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
          className="relative -mx-4 aspect-[4/3.4] cursor-grab touch-pan-y select-none active:cursor-grabbing md:mx-0 md:aspect-[16/10]"
        >
          {/* static stand-in until (and unless) WebGL arrives */}
          <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand)_30%,transparent),transparent)] blur-2xl dark:bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand)_55%,transparent),transparent)]" />
            <div
              className={cn(
                'absolute aspect-[2.6/1] w-[78%] rounded-[50%] border border-fd-foreground/10 transition-opacity duration-700',
                ready && 'opacity-0',
              )}
            />
            <div
              className={cn(
                'absolute aspect-[2.6/1] w-[52%] rounded-[50%] border border-fd-foreground/10 transition-opacity duration-700',
                ready && 'opacity-0',
              )}
            />
            <Logo size={64} className={cn('relative transition-opacity duration-700', ready && 'opacity-0')} />
          </div>
          {ready && (
            <div className="lp-fade-in absolute inset-0">
              <Scene
                plugins={plugins}
                activeId={activeId}
                hoverId={hoverId}
                onHover={setHoverId}
                onPick={pick}
                tone={tone}
                reduce={reduce}
                running={visible && pageVisible}
                drag={drag}
              />
            </div>
          )}
          <p className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-1.5 text-fd-muted-foreground text-xs md:left-0">
            <Hand className="size-3.5" aria-hidden="true" />
            {labels.hint}
          </p>
        </div>

        <aside className="flex flex-col gap-6">
          <p className="flex items-baseline gap-3">
            <NumberTicker
              value={plugins.length}
              className="lp-display font-semibold text-6xl leading-none md:text-7xl"
            />
            <span className="text-fd-muted-foreground">{labels.countLabel}</span>
          </p>
          {shown && (
            <div aria-live="polite" className="lp-glass relative overflow-hidden rounded-[20px] p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-brand/10 dark:bg-brand/30">
                  <ShownIcon className="size-5 text-fd-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-lg leading-tight">{shown.name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-fd-muted-foreground text-xs">
                    <span className={cn('size-1.5 rounded-full', DOT[shown.group])} aria-hidden="true" />
                    {labels.groups[shown.group]}
                  </p>
                </div>
              </div>
              <p className="mt-4 min-h-[3lh] text-pretty text-fd-muted-foreground text-sm leading-relaxed">
                {shown.description || labels.groupBody[shown.group]}
              </p>
              {hrefs[shown.id] && (
                <Link
                  href={hrefs[shown.id]}
                  className="group mt-3 inline-flex items-center gap-1 font-medium text-fd-primary text-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-fd-ring"
                >
                  {labels.open}
                  <ArrowUpRight
                    className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
          )}
          <Link
            href={browseHref}
            className="group inline-flex items-center gap-1 self-start font-medium text-fd-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-fd-ring"
          >
            {labels.browse}
            <ArrowUpRight
              className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </aside>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] md:gap-10">
        {groups.map(({ g, items }) => (
          <div key={g} className={cn(g === 'remote' && 'md:col-span-2')}>
            <h3 className="flex items-center gap-2 font-medium text-fd-muted-foreground text-sm">
              <span className={cn('size-2 rounded-full', DOT[g])} aria-hidden="true" />
              {labels.groups[g]}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {items.map((p) => {
                const Icon = pluginIcon(p.icon);
                const on = activeId === p.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => pick(p.id)}
                      onPointerEnter={() => setHoverId(p.id)}
                      onPointerLeave={() => setHoverId(null)}
                      onFocus={() => setHoverId(p.id)}
                      onBlur={() => setHoverId(null)}
                      className={cn(
                        'inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-sm transition-[background-color,border-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2',
                        on
                          ? 'border-brand/50 bg-brand/10 text-fd-foreground dark:bg-brand/30'
                          : 'border-fd-border text-fd-muted-foreground hover:border-fd-foreground/25 hover:text-fd-foreground',
                      )}
                    >
                      <Icon className={cn('size-3.5', on && 'text-fd-primary')} aria-hidden="true" />
                      {p.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
