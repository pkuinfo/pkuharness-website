import { Marquee } from '@/components/ui/marquee';
import { pluginIcon } from './plugin-icon';
import type { LandingPlugin } from './registry';

/** The registry as a slow ticker tape, two rows in opposite directions. Pauses on hover. */
export function PluginMarquee({ plugins, remoteLabel }: { plugins: LandingPlugin[]; remoteLabel: string }) {
  const half = Math.ceil(plugins.length / 2);
  const rows = [plugins.slice(0, half), plugins.slice(half)];
  return (
    <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      {rows.map((row, r) => (
        <Marquee
          // biome-ignore lint/suspicious/noArrayIndexKey: two fixed rows
          key={r}
          reverse={r === 1}
          pauseOnHover
          className="py-1.5 [--duration:80s] [--gap:0.75rem]"
        >
          {row.map((p) => {
            const Icon = pluginIcon(p.icon);
            return (
              <div
                key={p.id}
                title={p.description || undefined}
                className="lp-glass flex h-12 shrink-0 items-center gap-3 rounded-[12px] ps-2 pe-4 text-[15px]"
              >
                <span className="grid size-8 place-items-center rounded-[8px] bg-brand/10 dark:bg-brand/30">
                  <Icon className="size-4 text-fd-primary" aria-hidden="true" />
                </span>
                <span className="font-medium">{p.name}</span>
                {p.kind === 'remote' && (
                  <span className="rounded-[6px] border border-pku-slate/40 px-1.5 py-px text-[11px] text-pku-slate dark:text-[#9fb2da]">
                    {remoteLabel}
                  </span>
                )}
              </div>
            );
          })}
        </Marquee>
      ))}
    </div>
  );
}
