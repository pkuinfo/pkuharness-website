import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.64 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.33-2.64 5.28-5.15 5.56.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.78.54a11.26 11.26 0 0 0 7.68-10.67C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}

/** Section heading: Chinese title, concise English subline, optional lead paragraph. */
export function SectionHeading({
  id,
  title,
  en,
  children,
  align = 'left',
  className,
}: {
  id?: string;
  title: ReactNode;
  en: ReactNode;
  children?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      <h2
        id={id}
        className="font-semibold text-3xl leading-[1.2] [word-break:keep-all] tracking-[-0.02em] md:text-[2.6rem]"
      >
        {title}
      </h2>
      <p className="mt-2 text-balance font-medium text-fd-muted-foreground text-lg tracking-[-0.01em] md:text-xl">
        {en}
      </p>
      {children && <div className="mt-5 text-pretty text-fd-muted-foreground leading-[1.75]">{children}</div>}
    </div>
  );
}

export function Section({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn('relative mx-auto w-full max-w-[1200px] px-5 md:px-8', className)}
    >
      {children}
    </section>
  );
}
