import { FileCheck2, KeyRound, ScanEye, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { Section, SectionHeading } from './bits';
import { Reveal } from './reveal';
import { TrustDiagram } from './trust-diagram';

const ICONS = [KeyRound, Sparkles, SlidersHorizontal, ScanEye, FileCheck2, ShieldCheck];

export function Trust({ lang }: { lang: Lang }) {
  const m = t(lang).home.trust;
  return (
    <Section labelledBy="trust-title" className="py-24 md:py-36">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <SectionHeading id="trust-title" title={m.title} size="md">
          <p>{m.lead}</p>
        </SectionHeading>
        <TrustDiagram labels={m.diagram} />
      </div>
      <ul className="mt-20 grid gap-x-12 gap-y-12 sm:grid-cols-2 md:mt-28 lg:grid-cols-3">
        {m.points.map((p, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <Reveal as="li" key={p.title} delay={(i % 3) * 90}>
              <Icon className="size-6 text-fd-primary" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-[17px] tracking-[-0.01em]">{p.title}</h3>
              <p className="mt-2 text-pretty text-[15px] text-[var(--color-lp-ink-2)] leading-[1.6]">{p.body}</p>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
