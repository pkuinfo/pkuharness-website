import { Faq } from '@/components/ui/faq';
import type { Lang } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { github, repos } from '@/lib/shared';
import { Section, SectionHeading } from './bits';

export function HomeFaq({ lang }: { lang: Lang }) {
  const m = t(lang).home.faq;
  return (
    <Section labelledBy="faq-title" className="py-16 md:py-24">
      <Faq
        header={
          <SectionHeading id="faq-title" title={m.title}>
            <p>
              {m.lead}{' '}
              <a
                href={`${github(repos.app)}/issues`}
                className="font-medium text-fd-foreground underline underline-offset-4 hover:text-fd-primary focus-visible:outline-2 focus-visible:outline-fd-ring"
              >
                {m.ask}
              </a>
            </p>
          </SectionHeading>
        }
        items={m.items.map((i) => ({ id: i.id, question: i.q, answer: i.a }))}
      />
    </Section>
  );
}
