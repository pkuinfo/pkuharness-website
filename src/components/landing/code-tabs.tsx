'use client';

import { motion } from 'motion/react';
import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/** A glass code panel with file tabs (arrow keys move between them). Code is highlighted on the server. */
export function CodeTabs({
  label,
  tabs,
}: {
  label: string;
  tabs: { id: string; label: string; file: string; node: ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  function onKey(e: KeyboardEvent, i: number) {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (i + d + tabs.length) % tabs.length;
    setActive(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div className="lp-glass lp-code overflow-hidden rounded-[20px]">
      <div
        role="tablist"
        aria-label={label}
        className="flex items-center gap-1 overflow-x-auto overflow-y-hidden border-fd-border border-b px-3 pt-3 [scrollbar-width:none]"
      >
        {tabs.map((t, i) => {
          const on = t.id === current.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${uid}-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`${uid}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'relative whitespace-nowrap rounded-t-[8px] px-3 pt-1.5 pb-2.5 font-mono text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-fd-ring',
                on ? 'text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {t.label}
              {on && (
                <motion.span
                  layoutId={`${uid}-line`}
                  className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-fd-primary"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
            </button>
          );
        })}
        <span className="ms-auto hidden truncate pe-2 font-mono text-[11px] text-fd-muted-foreground xl:block">
          {current.file}
        </span>
      </div>
      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${current.id}`}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable code must be reachable by keyboard
        tabIndex={0}
        className="max-h-[640px] overflow-auto focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:-outline-offset-2"
      >
        {current.node}
      </div>
    </div>
  );
}
