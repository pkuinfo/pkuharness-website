import { ArrowUp } from 'lucide-react';

interface Item {
  name: string;
  note?: string;
}

/**
 * A layer and what plugs into it: one wide box (the layer, with its parts) and a row of boxes
 * under it, each with an arrow pointing up. Used in the docs instead of ASCII art, which breaks
 * with Chinese text and narrow screens. The props are plain text, so the Markdown copy of the page
 * (`/llms-full.txt`) stays readable.
 */
export function LayerDiagram({ title, parts, below }: { title: string; parts: Item[]; below: Item[] }) {
  return (
    <figure className="not-prose my-6 text-sm">
      <div className="rounded-xl border border-fd-border bg-fd-card p-4">
        <figcaption className="mb-3 text-center font-medium">{title}</figcaption>
        <div className="grid gap-2 sm:grid-cols-3">
          {parts.map((p) => (
            <Box key={p.name} item={p} className="bg-fd-secondary" />
          ))}
        </div>
      </div>
      <div className="mt-1 grid gap-2 sm:grid-cols-3">
        {below.map((b) => (
          <div key={b.name} className="flex flex-col items-center">
            <ArrowUp className="my-1 size-4 text-fd-muted-foreground" aria-hidden="true" />
            <Box item={b} className="w-full border border-dashed border-fd-border" />
          </div>
        ))}
      </div>
    </figure>
  );
}

function Box({ item, className }: { item: Item; className?: string }) {
  return (
    <div className={`rounded-lg px-3 py-2.5 text-center ${className ?? ''}`}>
      <div className="font-medium">{item.name}</div>
      {item.note && <div className="mt-0.5 text-fd-muted-foreground text-xs">{item.note}</div>}
    </div>
  );
}
