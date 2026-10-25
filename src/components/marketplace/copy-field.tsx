'use client';

import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { Check, Copy } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Fragment } from 'react';
import { cn } from '@/lib/cn';
import { toLang } from '@/lib/i18n';
import { t } from '@/lib/messages';

/** A mono value with a copy button (install link, endpoint, handle). */
export function CopyField({ label, value, className }: { label?: string; value: string; className?: string }) {
  const m = t(toLang(useParams<{ lang?: string }>()?.lang)).marketplace.copy;
  const [checked, onClick] = useCopyButton(() => navigator.clipboard.writeText(value));
  return (
    <div className={cn('min-w-0', className)}>
      {label && <p className="mb-1.5 text-xs text-fd-muted-foreground">{label}</p>}
      <div className="flex items-center gap-2 rounded-lg border border-fd-border bg-fd-background/60 py-1 ps-3 pe-1 font-mono text-[12.5px]">
        <span className="min-w-0 flex-1 select-all [overflow-wrap:anywhere]" title={value}>
          {/* break lines after a slash or other separator, not inside a word */}
          {value.split(/(?<=[/?&=.])/).map((part, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed split of one string
            <Fragment key={i}>
              {i > 0 && <wbr />}
              {part}
            </Fragment>
          ))}
        </span>
        <button
          type="button"
          onClick={onClick}
          aria-label={checked ? m.copied : m.copyValue(label ?? '')}
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-fd-ring',
            checked ? 'text-up' : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground',
          )}
        >
          {checked ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
