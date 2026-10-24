'use client';

import { Check, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

/** Icon button that copies `text`; labels come from the page's messages. */
export function CopyButton({
  text,
  label,
  copiedLabel,
  className,
}: {
  text: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          // clipboard unavailable (insecure context): leave the text selectable
        }
      }}
      aria-label={done ? copiedLabel : label}
      title={label}
      className={cn(
        'relative grid size-8 shrink-0 place-items-center rounded-lg text-fd-muted-foreground transition-colors hover:bg-fd-foreground/[0.06] hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-fd-ring',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={done ? 'done' : 'copy'}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {done ? (
            <Check className="size-4 text-up" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {done ? copiedLabel : ''}
      </span>
    </button>
  );
}
