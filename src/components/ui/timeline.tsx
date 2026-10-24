/**
 * Vertical timeline. Ported from 21st.dev: preetsuthar17/timeline. Changes: trimmed to the vertical
 * layout, items are an ordered list, the marker and connector use site tokens, a `current` status
 * replaces the pulsing "active" one (no looping motion), and items take arbitrary content.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TimelineItem {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  content?: ReactNode;
  status?: 'current' | 'default';
  marker?: ReactNode;
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn('relative flex flex-col', className)}>
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
          {i < items.length - 1 && (
            <span aria-hidden="true" className="absolute top-8 bottom-0 left-[11px] w-px bg-fd-border" />
          )}
          <span
            aria-hidden="true"
            className={cn(
              'relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium [&_svg]:size-3',
              item.status === 'current'
                ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                : 'border-fd-border bg-fd-background text-fd-muted-foreground',
            )}
          >
            {item.marker ?? <span className="size-1.5 rounded-full bg-current" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-semibold">{item.title}</h3>
              {item.meta && <span className="text-sm text-fd-muted-foreground">{item.meta}</span>}
            </div>
            {item.content && <div className="mt-2">{item.content}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
