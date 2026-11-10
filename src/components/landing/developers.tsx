import Link from 'next/link';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { github, repos } from '@/lib/shared';
import { Section, SectionHeading } from './bits';

/** A short note for people who want to connect another campus service. */
export function Developers({ lang }: { lang: Lang }) {
  const m = t(lang).home.developers;
  return (
    <Section labelledBy="dev-title" className="border-fd-border border-t py-16 md:py-20">
      <SectionHeading id="dev-title" title={m.title} size="md">
        <p>{m.lead}</p>
      </SectionHeading>
      <p className="mt-8 flex gap-6 text-sm">
        <Link href={localePath(lang, '/docs/build')} className="text-fd-primary underline-offset-4 hover:underline">
          {m.docs}
        </Link>
        <a href={github(repos.plugins)} className="text-fd-primary underline-offset-4 hover:underline">
          {m.repo}
        </a>
      </p>
    </Section>
  );
}
