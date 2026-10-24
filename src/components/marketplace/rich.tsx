import { Fragment } from 'react';

/** Renders a UI string, turning `backticked` parts into <code>. Strings come from src/lib/messages. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 ? (
          <code key={String(i)} className="font-mono text-[0.9em] text-fd-foreground">
            {part}
          </code>
        ) : (
          <Fragment key={String(i)}>{part}</Fragment>
        ),
      )}
    </>
  );
}
