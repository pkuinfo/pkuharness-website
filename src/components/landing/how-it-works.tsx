'use client';

import { Eye, Globe, type LucideIcon, Pencil, ShieldCheck, Wallet as WalletIcon } from 'lucide-react';
import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/logo';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { cn } from '@/lib/cn';
import { pluginIcon } from './plugin-icon';

const PLUGINS = [
  { name: '校园钱包', icon: 'wallet' },
  { name: '课表', icon: 'timetable' },
  { name: '树洞', icon: 'chat' },
  { name: '教学网', icon: 'school' },
  { name: '远程插件', icon: 'globe', remote: true },
] as const;

const EFFECTS: { label: string; icon: LucideIcon }[] = [
  { label: '读取', icon: Eye },
  { label: '修改', icon: Pencil },
  { label: '花钱', icon: WalletIcon },
  { label: '公开', icon: Globe },
];

const STEPS = [
  {
    title: '你说一句话',
    body: '「明早理教有空教室吗？」不用找入口，也不用记哪个系统在哪个网址。',
  },
  {
    title: '助手挑选工具',
    body: '每个插件把能力声明为带类型的工具，并标明效果：读取、修改、花钱或公开。',
  },
  {
    title: '按你的授权执行',
    body: '允许的直接做；设为「先问我」的会弹出确认，写明插件、操作和参数；禁止的不会被调用。',
  },
  {
    title: '插件直连学校',
    body: '登录由 App 完成，插件只拿到按服务划分的会话。请求从你的手机直接发往学校，不经过我们的服务器。',
  },
];

function useLg() {
  const [lg, setLg] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setLg(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return lg;
}

function Node({
  nodeRef,
  children,
  className,
}: {
  nodeRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div ref={nodeRef} className={cn('lp-glass relative z-10 rounded-[14px]', className)}>
      {children}
    </div>
  );
}

export function HowItWorks() {
  const lg = useLg();
  const container = useRef<HTMLDivElement>(null);
  const you = useRef<HTMLDivElement>(null);
  const agent = useRef<HTMLDivElement>(null);
  const gate = useRef<HTMLDivElement>(null);
  const campus = useRef<HTMLDivElement>(null);
  const mcp = useRef<HTMLDivElement>(null);
  const p0 = useRef<HTMLDivElement>(null);
  const p1 = useRef<HTMLDivElement>(null);
  const p2 = useRef<HTMLDivElement>(null);
  const p3 = useRef<HTMLDivElement>(null);
  const p4 = useRef<HTMLDivElement>(null);
  const plugins = [p0, p1, p2, p3, p4];
  const group = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div
        ref={container}
        className="relative grid items-center gap-y-10 text-fd-foreground lg:grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto] lg:gap-y-0"
      >
        <Node nodeRef={you} className="mx-auto flex items-center gap-3 px-4 py-3 lg:mx-0">
          <span className="grid size-9 place-items-center rounded-full bg-fd-foreground/[0.06] font-semibold text-sm">
            你
          </span>
          <span className="text-sm leading-tight">
            一句话
            <span className="block text-fd-muted-foreground text-xs">You</span>
          </span>
        </Node>
        <span className="hidden lg:block" />
        <Node nodeRef={agent} className="mx-auto flex flex-col items-center gap-2 px-5 py-4 lg:mx-0">
          <Logo size={44} />
          <span className="text-center font-medium text-sm leading-tight">
            手机上的助手
            <span className="block font-normal text-fd-muted-foreground text-xs">On-device agent</span>
          </span>
        </Node>
        <span className="hidden lg:block" />
        <Node nodeRef={gate} className="mx-auto px-4 py-3.5 lg:mx-0">
          <span className="flex items-center gap-2 font-medium text-sm">
            <ShieldCheck className="size-4 text-fd-primary" aria-hidden="true" />
            你的授权
          </span>
          <span className="mt-2.5 grid grid-cols-2 gap-1.5">
            {EFFECTS.map((e) => (
              <span
                key={e.label}
                className="inline-flex items-center gap-1 rounded-[6px] bg-fd-foreground/[0.05] px-2 py-1 text-fd-muted-foreground text-xs"
              >
                <e.icon className="size-3" aria-hidden="true" />
                {e.label}
              </span>
            ))}
          </span>
        </Node>
        <span className="hidden lg:block" />
        <div ref={group} className="flex flex-wrap justify-center gap-2.5 lg:flex-col lg:gap-3">
          {PLUGINS.map((p, i) => {
            const Icon = pluginIcon(p.icon);
            return (
              <Node key={p.name} nodeRef={plugins[i]} className="flex items-center gap-2 px-3 py-2 text-sm">
                <Icon
                  className={cn(
                    'size-4',
                    'remote' in p ? 'text-pku-slate dark:text-[#9fb2da]' : 'text-fd-muted-foreground',
                  )}
                  aria-hidden="true"
                />
                {p.name}
              </Node>
            );
          })}
        </div>
        <span className="hidden lg:block" />
        <div className="flex flex-wrap justify-center gap-3 lg:flex-col">
          <Node nodeRef={campus} className="px-4 py-3">
            <span className="font-medium text-sm">学校服务</span>
            <span className="mt-1 block font-mono text-[11px] text-fd-muted-foreground leading-relaxed">
              iaaa · portal
              <br />
              treehole · course
            </span>
          </Node>
          <Node nodeRef={mcp} className="px-4 py-3">
            <span className="font-medium text-sm">MCP 服务器</span>
            <span className="mt-1 block text-[11px] text-fd-muted-foreground">社区部署</span>
          </Node>
        </div>

        <AnimatedBeam containerRef={container} fromRef={you} toRef={agent} vertical={!lg} edges duration={4} />
        <AnimatedBeam
          containerRef={container}
          fromRef={agent}
          toRef={gate}
          vertical={!lg}
          edges
          duration={4}
          delay={0.5}
        />
        {lg ? (
          <>
            {plugins.map((p, i) => (
              <AnimatedBeam
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed list
                key={i}
                containerRef={container}
                fromRef={gate}
                toRef={p}
                edges
                curvature={(i - 2) * -18}
                duration={4}
                delay={1 + i * 0.15}
              />
            ))}
            {plugins.slice(0, 4).map((p, i) => (
              <AnimatedBeam
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed list
                key={i}
                containerRef={container}
                fromRef={p}
                toRef={campus}
                edges
                duration={4}
                delay={1.6 + i * 0.15}
              />
            ))}
            <AnimatedBeam
              containerRef={container}
              fromRef={p4}
              toRef={mcp}
              edges
              duration={4}
              delay={2.2}
              gradientStartColor="#475c87"
              gradientStopColor="#9fb2da"
            />
          </>
        ) : (
          // Narrow screens: plugins wrap into rows, so beams join the group instead of each chip.
          <>
            <AnimatedBeam containerRef={container} fromRef={gate} toRef={group} vertical edges duration={4} delay={1} />
            <AnimatedBeam
              containerRef={container}
              fromRef={group}
              toRef={campus}
              vertical
              edges
              curvature={30}
              duration={4}
              delay={1.6}
            />
            <AnimatedBeam
              containerRef={container}
              fromRef={group}
              toRef={mcp}
              vertical
              edges
              curvature={-30}
              duration={4}
              delay={2}
              gradientStartColor="#475c87"
              gradientStopColor="#9fb2da"
            />
          </>
        )}
      </div>

      <ol className="mt-16 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="border-fd-border border-t pt-5">
            <span className="font-mono text-fd-primary text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-2 font-semibold">{s.title}</h3>
            <p className="mt-2 text-fd-muted-foreground text-sm leading-[1.75]">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
