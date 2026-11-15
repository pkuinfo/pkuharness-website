import { Bot, Cpu, LayoutDashboard, MessagesSquare, Puzzle, ShieldCheck } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { Section, SectionHeading } from './bits';

const ICONS = {
  chat: MessagesSquare,
  today: LayoutDashboard,
  copilot: Bot,
  plugins: Puzzle,
  permissions: ShieldCheck,
  model: Cpu,
} as const;

/** What the app does, in six short blocks (copy follows the pku-harness README). */
export function Features({ lang }: { lang: Lang }) {
  const m = t(lang).home.features;
  return (
    <Section labelledBy="features-title" className="border-fd-border border-t py-16 md:py-20">
      <SectionHeading id="features-title" title={m.title} size="md">
        {m.lead}
      </SectionHeading>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {m.items.map((item) => {
          const Icon = ICONS[item.id];
          return (
            <li key={item.id} className="rounded-2xl border border-fd-border bg-fd-card p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-brand text-white">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold text-lg">{item.title}</h3>
              <p className="mt-2 text-pretty text-[15px] text-[var(--color-lp-ink-2)] leading-[1.65]">{item.body}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
