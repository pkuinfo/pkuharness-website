import Link from 'next/link';
import { type Lang, localePath } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { Section, SectionHeading } from './bits';
import { pluginIcon } from './plugin-icon';
import { CORE_PLUGIN_IDS, type LandingPlugin } from './registry';

/** The campus-service plugins that come with the app, as a plain list. */
export function Services({ lang, plugins }: { lang: Lang; plugins: LandingPlugin[] }) {
  const m = t(lang).home.services;
  const campus = plugins.filter((p) => p.kind === 'builtin' && !CORE_PLUGIN_IDS.has(p.id));
  return (
    <Section labelledBy="services-title" className="border-fd-border border-t py-16 md:py-20">
      <SectionHeading id="services-title" title={m.title} size="md">
        <p>{m.lead}</p>
      </SectionHeading>
      <ul className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {campus.map((p) => {
          const Icon = pluginIcon(p.icon);
          return (
            <li key={p.id} className="flex gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-fd-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-medium">{p.name}</p>
                {p.description && (
                  <p className="mt-0.5 text-fd-muted-foreground text-sm leading-relaxed">{p.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <Link
        href={localePath(lang, '/marketplace')}
        className="mt-10 inline-block text-fd-primary text-sm underline-offset-4 hover:underline"
      >
        {m.marketplace}
      </Link>
    </Section>
  );
}
