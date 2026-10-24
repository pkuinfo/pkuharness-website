import type { LucideIcon } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/cn';

/**
 * Short points (icon, title, one paragraph) as quiet panels whose border lights up near the
 * pointer (`GlowingEffect`). Used for the plugin and privacy points on the home page.
 */
export function SpotlightList({
  items,
  className,
  columns = 1,
}: {
  items: { key: string; title: string; body: string; icon: LucideIcon }[];
  className?: string;
  columns?: 1 | 3;
}) {
  return (
    <ul className={cn('grid gap-3', columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map(({ key, title, body, icon: Icon }) => (
        <li
          key={key}
          className="relative grid grid-cols-[auto_1fr] gap-x-4 rounded-[18px] border border-fd-border bg-fd-foreground/[0.015] p-5 dark:bg-fd-foreground/[0.02]"
        >
          <GlowingEffect />
          <span className="mt-0.5 grid size-8 place-items-center rounded-[9px] bg-brand/10 dark:bg-brand/25">
            <Icon className="size-[18px] text-fd-primary" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-lg leading-snug">{title}</h3>
            <p className="mt-1.5 text-pretty text-fd-muted-foreground leading-[1.75]">{body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
