import Link from 'next/link';
import { Marquee } from '@/components/ui/marquee';
import { pluginIcon } from './plugin-icon';
import type { LandingPlugin } from './registry';

/** The registry as a slow ticker tape, two rows in opposite directions. */
export function PluginMarquee({ plugins }: { plugins: LandingPlugin[] }) {
  const half = Math.ceil(plugins.length / 2);
  const rows = [plugins.slice(0, half), plugins.slice(half)];
  return (
    <section aria-labelledby="plugins-strip" className="relative py-6">
      <div className="mx-auto mb-6 flex max-w-[1200px] flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 md:px-8">
        <h2 id="plugins-strip" className="font-semibold text-lg">
          {plugins.length} 个插件，内置与社区一律平等
        </h2>
        <Link
          href="/marketplace"
          className="text-fd-muted-foreground text-sm underline-offset-4 transition-colors hover:text-fd-foreground hover:underline"
        >
          Every capability is a plugin. Browse the marketplace
        </Link>
      </div>
      <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {rows.map((row, r) => (
          <Marquee
            // biome-ignore lint/suspicious/noArrayIndexKey: two fixed rows
            key={r}
            reverse={r === 1}
            pauseOnHover
            className="py-1.5 [--duration:70s] [--gap:0.75rem]"
          >
            {row.map((p) => {
              const Icon = pluginIcon(p.icon);
              return (
                <div
                  key={p.id}
                  title={p.description}
                  className="lp-glass flex h-11 shrink-0 items-center gap-2.5 rounded-[10px] ps-2 pe-4 text-sm"
                >
                  <span className="grid size-7 place-items-center rounded-[7px] bg-fd-foreground/[0.06]">
                    <Icon className="size-4 text-fd-muted-foreground" aria-hidden="true" />
                  </span>
                  <span className="font-medium">{p.name}</span>
                  {p.kind === 'remote' && (
                    <span className="rounded-[5px] border border-pku-slate/40 px-1.5 py-px text-[11px] text-pku-slate dark:text-[#9fb2da]">
                      MCP
                    </span>
                  )}
                </div>
              );
            })}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
