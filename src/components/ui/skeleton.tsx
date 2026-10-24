/** Loading placeholder. Ported from 21st.dev: shadcn/skeleton (site tokens; static under reduced motion). */

import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-fd-foreground/[0.07] motion-reduce:animate-none', className)}
      {...props}
    />
  );
}
