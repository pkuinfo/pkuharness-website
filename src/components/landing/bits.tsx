import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.64 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.33-2.64 5.28-5.15 5.56.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.78.54a11.26 11.26 0 0 0 7.68-10.67C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}

const focus = 'focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2';

/** Button looks shared by the landing sections (links styled as buttons). */
export const button = {
  primary: cn(
    'inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-brand px-5 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(139,0,18,0.8),inset_0_1px_0_rgba(255,255,255,0.18)] transition-[transform,background-color] duration-150 ease-out hover:bg-brand-bright/90 active:scale-[0.97] dark:hover:bg-[#9e0016]',
    focus,
  ),
  glass: cn(
    'lp-glass inline-flex h-12 items-center justify-center gap-2 rounded-[10px] px-5 font-medium transition-transform duration-150 ease-out active:scale-[0.97]',
    focus,
  ),
  ghost: cn(
    'inline-flex h-12 items-center justify-center gap-2 rounded-[10px] px-3 font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground',
    focus,
  ),
};

/** A string with `\n` as lines (deliberate breaks in short headings). */
export function lines(text: string): ReactNode {
  const parts = text.split('\n');
  return parts.map((p, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: static text lines
    <span key={i}>
      {p}
      {i < parts.length - 1 && <br />}
    </span>
  ));
}

/** Section heading: one large title (`\n` = line break) and an optional lead paragraph. */
export function SectionHeading({
  id,
  title,
  children,
  align = 'left',
  size = 'lg',
  className,
}: {
  id?: string;
  title: ReactNode;
  children?: ReactNode;
  align?: 'left' | 'center';
  /** `md` for headings that share the row with a figure */
  size?: 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <h2
        id={id}
        className={cn(
          'lp-display text-balance text-[2rem] leading-[1.1]',
          size === 'lg' ? 'md:text-[2.75rem]' : 'md:text-[2.25rem]',
        )}
      >
        {typeof title === 'string' ? lines(title) : title}
      </h2>
      {children && (
        <div className="mt-4 max-w-[38rem] text-pretty text-[17px] text-[var(--color-lp-ink-2)] leading-[1.6] [.text-center_&]:mx-auto">
          {children}
        </div>
      )}
    </div>
  );
}

export function Section({
  children,
  className,
  labelledBy,
  id,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('relative mx-auto w-full max-w-[1200px] px-4 md:px-8', className)}
    >
      {children}
    </section>
  );
}
