'use client';

import { motion } from 'motion/react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/cn';

/** A glass code panel with file tabs. The code itself is highlighted on the server. */
export function CodeTabs({
  tabs,
}: {
  tabs: { id: string; label: string; file: string; node: ReactNode; note?: string }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className="lp-glass lp-code overflow-hidden rounded-[20px]">
      <div
        role="tablist"
        aria-label="插件示例"
        className="flex items-center gap-1 overflow-x-auto border-fd-border border-b px-3 pt-3"
      >
        {tabs.map((t) => {
          const on = t.id === current.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="code-panel"
              onClick={() => setActive(t.id)}
              className={cn(
                'relative whitespace-nowrap rounded-t-[8px] px-3 pt-1.5 pb-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-fd-ring',
                on ? 'text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {t.label}
              {on && (
                <motion.span
                  layoutId="code-tab-line"
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
      <div id="code-panel" role="tabpanel" className="max-h-[520px] overflow-auto">
        {current.note && (
          <p className="mx-5 mt-4 rounded-[10px] border border-pku-amber/30 bg-pku-amber/10 px-3 py-2 text-[13px] text-fd-foreground/80">
            {current.note}
          </p>
        )}
        {current.node}
      </div>
    </div>
  );
}
