'use client';

import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';

/** A mono value with a copy button (endpoint URL, handle, install command). */
export function CopyField({ label, value, className }: { label?: string; value: string; className?: string }) {
  const [checked, onClick] = useCopyButton(() => navigator.clipboard.writeText(value));
  return (
    <div className={cn('min-w-0', className)}>
      {label && <p className="mb-1.5 text-xs text-fd-muted-foreground">{label}</p>}
      <div className="group flex items-center gap-2 rounded-lg border border-fd-border bg-fd-background/60 py-1.5 pr-1.5 pl-3 font-mono text-[12.5px]">
        <span className="min-w-0 flex-1 break-all select-all" title={value}>
          {value}
        </span>
        <button
          type="button"
          onClick={onClick}
          aria-label={checked ? 'Copied' : `Copy ${label ?? 'value'}`}
          className={cn(
            'inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors',
            checked ? 'text-up' : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground',
          )}
        >
          {checked ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
