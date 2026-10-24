/**
 * Empty state: icon, title, a line of direction and actions. Ported from 21st.dev: shadcn/empty
 * (as used by olewandowski1/empty-states-1). Changes: one component with slots instead of six,
 * site tokens, and a `tone` for the brand-tinted variant.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function EmptyState({
  icon,
  title,
  children,
  actions,
  className,
  headingLevel: H = 'h3',
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headingLevel?: 'h2' | 'h3';
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-fd-border px-6 py-14 text-center text-balance md:py-16',
        className,
      )}
    >
      <div className="flex max-w-md flex-col items-center gap-2">
        {icon && (
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-fd-muted text-fd-foreground [&_svg]:size-5">
            {icon}
          </div>
        )}
        <H className="text-lg font-semibold tracking-tight">{title}</H>
        {children && <div className="text-sm leading-6 text-fd-muted-foreground">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
