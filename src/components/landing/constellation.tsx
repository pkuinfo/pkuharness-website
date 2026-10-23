'use client';

import { ArrowUpRight, Hand, Plus } from 'lucide-react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ConstellationRing } from './constellation-scene';
import { pluginIcon } from './plugin-icon';
import { CORE_PLUGIN_IDS, type LandingPlugin } from './registry';
import { useThemeTone } from './use-theme-tone';

const Scene = dynamic(() => import('./constellation-scene'), { ssr: false, loading: () => <SceneFallback /> });

const YOURS: LandingPlugin = {
  id: '__yours',
  name: '+ 你的插件',
  description: '用 TypeScript 写内置插件，或者用任何语言部署一个 MCP 服务器。上架后和内置插件一样平等。',
  kind: 'remote',
  icon: 'puzzle',
};

function SceneFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <div className="relative size-[min(70%,420px)]">
        {[1, 0.72, 0.44].map((s) => (
          <div
            key={s}
            className="absolute inset-0 m-auto rounded-full border border-fd-foreground/10"
            style={{ width: `${s * 100}%`, height: `${s * 40}%` }}
          />
        ))}
        <div className="absolute inset-0 m-auto size-14 rounded-full bg-[radial-gradient(circle_at_40%_35%,#e0364a,#52000a)] shadow-[0_0_60px_10px_rgba(196,34,54,0.35)]" />
      </div>
    </div>
  );
}

export function PluginConstellation({ plugins }: { plugins: LandingPlugin[] }) {
  const tone = useThemeTone();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: '300px 0px' });
  const visible = useInView(ref, { margin: '0px' });
  const [hidden, setHidden] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  const rings = useMemo<ConstellationRing[]>(() => {
    const core = plugins.filter((p) => CORE_PLUGIN_IDS.has(p.id) && p.kind !== 'remote');
    const campus = plugins.filter((p) => !CORE_PLUGIN_IDS.has(p.id) && p.kind !== 'remote');
    const remote = plugins.filter((p) => p.kind === 'remote');
    return [
      { id: 'core', radius: 1.6, tilt: [0.12, 0, 0.1], speed: 0.09, color: '#ba9570', plugins: core },
      { id: 'campus', radius: 2.85, tilt: [-0.06, 0, -0.12], speed: -0.05, color: '#ff5a6a', plugins: campus },
      {
        id: 'remote',
        radius: 4,
        tilt: [0.16, 0, 0.06],
        speed: 0.035,
        color: '#9fb2da',
        plugins: [...remote, YOURS],
        ghost: true,
      },
    ];
  }, [plugins]);

  const all = useMemo(() => [...plugins, YOURS], [plugins]);
  const activeId = hover ?? picked;
  const active = all.find((p) => p.id === activeId) ?? null;
  const ActiveIcon = pluginIcon(active?.icon);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
      <div
        ref={ref}
        className="relative -mx-5 h-[440px] sm:h-[520px] md:mx-0 lg:h-[600px]"
        role="img"
        aria-label={`插件星座：${plugins.length} 个插件环绕 PKU Harness 核心，内圈是助手和界面能力，中圈是校园服务，外圈是社区远程插件。`}
      >
        {near ? (
          <Scene
            rings={rings}
            tone={tone}
            active={activeId}
            animate={!reduce}
            running={visible && !hidden}
            onHover={setHover}
            onSelect={(id) => setPicked((cur) => (cur === id ? null : id))}
          />
        ) : (
          <SceneFallback />
        )}
      </div>

      <div className="lg:min-h-[260px]">
        <div className="lp-glass min-h-[184px] rounded-[20px] p-5" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-[10px] bg-fd-foreground/[0.06]">
                    {active.id === '__yours' ? (
                      <Plus className="size-5" aria-hidden="true" />
                    ) : (
                      <ActiveIcon className="size-5" aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <p className="font-semibold">{active.name.replace(/^\+ /, '')}</p>
                    <p className="text-fd-muted-foreground text-xs">
                      {active.kind === 'remote'
                        ? '远程插件 · MCP'
                        : CORE_PLUGIN_IDS.has(active.id)
                          ? '内置 · 助手能力'
                          : '内置 · 校园服务'}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-fd-muted-foreground text-sm leading-[1.75]">{active.description}</p>
              </motion.div>
            ) : (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-fd-muted-foreground text-sm leading-[1.75]"
              >
                <Hand className="mb-3 size-5 text-fd-primary" aria-hidden="true" />
                <span className="pointer-coarse:hidden">拖动旋转，把指针放在任意一颗星上查看插件。</span>
                <span className="hidden pointer-coarse:inline">点按任意一颗星查看插件。</span>
                <span className="mt-1 block text-xs">
                  <span className="pointer-coarse:hidden">Drag to orbit. Hover or click a plugin.</span>
                  <span className="hidden pointer-coarse:inline">Tap a plugin to see what it does.</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          {[
            ['#ba9570', '内圈', '助手本身的能力：界面生成、看板、提醒、记忆、模型服务'],
            ['#ff5a6a', '中圈', '连接学校服务的插件'],
            ['#9fb2da', '外圈', '社区的远程插件，通过 MCP 接入'],
          ].map(([c, k, d]) => (
            <div key={k} className="flex gap-3">
              <dt className="flex shrink-0 items-center gap-2 font-medium">
                <span className="size-2 rounded-full" style={{ background: c }} />
                {k}
              </dt>
              <dd className="text-fd-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
        <Link
          href="/marketplace"
          className="mt-6 inline-flex items-center gap-1.5 font-medium text-fd-primary text-sm underline-offset-4 hover:underline"
        >
          浏览插件市场
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="sr-only">
        {plugins.map((p) => (
          <li key={p.id}>
            {p.name}：{p.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
