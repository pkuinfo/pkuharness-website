import { FileCheck2, KeyRound, ScanEye, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { Section, SectionHeading } from './bits';
import { SpotlightList } from './spotlight-list';
import { TrustDiagram } from './trust-diagram';

const ICONS = [KeyRound, Sparkles, SlidersHorizontal, ScanEye, FileCheck2, ShieldCheck];

export function Trust({ lang }: { lang: Lang }) {
  const m = t(lang).home.trust;
  return (
    <Section labelledBy="trust-title" className="py-16 md:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <SectionHeading id="trust-title" title={m.title}>
          <p>{m.lead}</p>
        </SectionHeading>
        <TrustDiagram labels={m.diagram} />
      </div>
      <SpotlightList
        columns={3}
        className="mt-12 lg:mt-14"
        items={m.points.map((p, i) => ({ key: p.title, title: p.title, body: p.body, icon: ICONS[i] ?? ShieldCheck }))}
      />
    </Section>
  );
}
