import { Check } from 'lucide-react';
import Link from 'next/link';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { Section, SectionHeading } from './bits';

/** Where the account and data go, in a few plain facts, with links to the full policies. */
export function Privacy({ lang }: { lang: Lang }) {
  const m = t(lang).home.privacy;
  return (
    <Section labelledBy="privacy-title" className="border-fd-border border-t py-16 md:py-20">
      <SectionHeading id="privacy-title" title={m.title} size="md" />
      <ul className="mt-8 max-w-3xl space-y-4">
        {m.points.map((p) => (
          <li key={p} className="flex gap-3 text-[16px] leading-[1.65]">
            <Check className="mt-1 size-4 shrink-0 text-up" aria-hidden="true" />
            {p}
          </li>
        ))}
      </ul>
      <p className="mt-8 flex gap-6 text-sm">
        <Link href={localePath(lang, '/terms')} className="text-fd-primary underline-offset-4 hover:underline">
          {m.terms}
        </Link>
        <Link href={localePath(lang, '/privacy')} className="text-fd-primary underline-offset-4 hover:underline">
          {m.policy}
        </Link>
      </p>
    </Section>
  );
}
