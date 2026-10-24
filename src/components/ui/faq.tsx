'use client';

/**
 * Frequently asked questions in an accordion. Ported from 21st.dev: kevingirelli/faq (split
 * layout: header on the left, questions on the right on large screens; each question a button
 * inside an <h3>; Up/Down/Home/End move between questions). Changes: no Radix dependency (a small
 * accessible disclosure list; answers are server-rendered for search engines), no eyebrow,
 * site tokens, the header is passed in by the caller.
 */

import { Plus } from 'lucide-react';
import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface FaqItem {
  id: string;
  question: ReactNode;
  answer: ReactNode;
}

export function Faq({
  header,
  items,
  defaultOpen,
  className,
}: {
  header: ReactNode;
  items: FaqItem[];
  defaultOpen?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent, i: number) {
    const last = items.length - 1;
    const to =
      e.key === 'ArrowDown'
        ? Math.min(last, i + 1)
        : e.key === 'ArrowUp'
          ? Math.max(0, i - 1)
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : -1;
    if (to < 0) return;
    e.preventDefault();
    refs.current[to]?.focus();
  }

  return (
    <div className={cn('grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16', className)}>
      <div>{header}</div>
      <ul className="border-fd-border border-t">
        {items.map((item, i) => {
          const on = open === item.id;
          const btn = `${uid}-q-${item.id}`;
          const panel = `${uid}-a-${item.id}`;
          return (
            <li key={item.id} className="border-fd-border border-b">
              <h3>
                <button
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  id={btn}
                  type="button"
                  aria-expanded={on}
                  aria-controls={panel}
                  onClick={() => setOpen(on ? null : item.id)}
                  onKeyDown={(e) => onKey(e, i)}
                  className="group flex w-full items-center justify-between gap-6 py-5 text-start font-medium text-lg transition-colors hover:text-fd-primary focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2"
                >
                  {item.question}
                  <Plus
                    aria-hidden="true"
                    className={cn(
                      'size-5 shrink-0 text-fd-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]',
                      on && 'rotate-45 text-fd-primary',
                    )}
                  />
                </button>
              </h3>
              <section id={panel} aria-labelledby={btn} hidden={!on ? true : undefined} className="lp-faq-answer">
                <p className="max-w-[60ch] pb-6 text-pretty text-fd-muted-foreground leading-[1.8]">{item.answer}</p>
              </section>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
