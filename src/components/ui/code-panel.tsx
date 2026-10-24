'use client';

/**
 * A code panel with a header (file name or tabs) and a copy button. Ported from 21st.dev:
 * ibelick/code-block (prompt-kit), with the tab header idea from manuarora700/code-block. Changes:
 * the code arrives already highlighted (Shiki on the server, light and dark themes), tabs are
 * real `role="tab"` buttons, panels stay mounted (no layout shift when switching), site tokens.
 */

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

const BODY =
  'max-h-[480px] overflow-auto py-3.5 text-[12.5px] leading-6 [&_.line]:px-4 [&_pre]:!bg-transparent [&_pre]:font-mono';

export interface CodePanelFile {
  id: string;
  label: string;
  /** Plain text, for copying. */
  code: string;
  /** Shiki HTML for the same text. */
  html: string;
}

export function CodePanel({
  files,
  label,
  copyLabel,
  copiedLabel,
  className,
}: {
  files: CodePanelFile[];
  /** Accessible name for the tab list. */
  label: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const file = files[active];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(file.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable: the code stays selectable
    }
  };
  return (
    <div className={cn('not-prose overflow-hidden rounded-xl border border-fd-border bg-fd-card', className)}>
      <div className="flex items-center gap-1 border-b border-fd-border py-1.5 ps-2 pe-1.5">
        {files.length > 1 ? (
          <div role="tablist" aria-label={label} className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {files.map((f, i) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                id={`code-tab-${f.id}`}
                aria-selected={i === active}
                aria-controls={`code-panel-${f.id}`}
                onClick={() => setActive(i)}
                className={cn(
                  'shrink-0 rounded-md px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-fd-ring',
                  i === active
                    ? 'bg-fd-foreground/[0.07] text-fd-foreground'
                    : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-fd-muted-foreground">{file.label}</span>
        )}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? copiedLabel : copyLabel}
          className={cn(
            'inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-fd-ring',
            copied ? 'text-up' : 'text-fd-muted-foreground hover:bg-fd-foreground/[0.06] hover:text-fd-foreground',
          )}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      {files.map((f, i) =>
        files.length > 1 ? (
          <div
            key={f.id}
            id={`code-panel-${f.id}`}
            role="tabpanel"
            aria-labelledby={`code-tab-${f.id}`}
            hidden={i !== active}
            className={BODY}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output generated on the server; Shiki escapes the source text
            dangerouslySetInnerHTML={{ __html: f.html }}
          />
        ) : (
          <div
            key={f.id}
            className={BODY}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output generated on the server; Shiki escapes the source text
            dangerouslySetInnerHTML={{ __html: f.html }}
          />
        ),
      )}
    </div>
  );
}
