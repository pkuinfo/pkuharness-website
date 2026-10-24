'use client';

/**
 * Tabs with a hover highlight that glides between items and a sliding active underline. Ported from
 * 21st.dev: yadwinder/vercel-tabs. Changes: controlled (`value` / `onValueChange`), real
 * `role="tab"` buttons with roving focus and arrow-key navigation, optional counts, indicator
 * positions tracked with a ResizeObserver (fonts and labels change width), site tokens instead of
 * hex colours, and no transitions under reduced motion.
 */

import { type KeyboardEvent, type ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface HoverTab<T extends string> {
  id: T;
  label: ReactNode;
  count?: number;
}

interface Box {
  left: number;
  width: number;
}

export function HoverTabs<T extends string>({
  tabs,
  value,
  onValueChange,
  label,
  className,
  controls,
}: {
  tabs: HoverTab<T>[];
  value: T;
  onValueChange: (id: T) => void;
  /** Accessible name of the tab list. */
  label: string;
  className?: string;
  /** id of the panel the tabs control. */
  controls?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const active = Math.max(
    0,
    tabs.findIndex((t) => t.id === value),
  );

  const measure = useCallback(() => {
    setBoxes(refs.current.map((el) => (el ? { left: el.offsetLeft, width: el.offsetWidth } : { left: 0, width: 0 })));
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    for (const el of refs.current) if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    let next: number | undefined;
    if (e.key in keys) next = (active + keys[e.key] + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    onValueChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  const hoverBox = hover !== null ? boxes[hover] : undefined;
  const activeBox = boxes[active];

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerLeave={() => setHover(null)}
      className={cn('relative flex items-center gap-1.5 pb-1.5', className)}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 h-8 rounded-md bg-fd-foreground/[0.07] transition-[left,width,opacity] duration-300 ease-out-strong motion-reduce:transition-none"
        style={{ left: hoverBox?.left ?? activeBox?.left ?? 0, width: hoverBox?.width ?? 0, opacity: hoverBox ? 1 : 0 }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-fd-primary transition-[left,width] duration-300 ease-out-strong motion-reduce:transition-none"
        style={{ left: activeBox?.left ?? 0, width: activeBox?.width ?? 0 }}
      />
      {tabs.map((t, i) => {
        const selected = i === active;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={selected}
            aria-controls={controls}
            tabIndex={selected ? 0 : -1}
            onPointerEnter={() => setHover(i)}
            onClick={() => onValueChange(t.id)}
            className={cn(
              'relative inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring',
              selected ? 'text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="text-xs font-normal tabular-nums text-fd-muted-foreground">{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
