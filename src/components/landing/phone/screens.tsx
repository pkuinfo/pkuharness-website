'use client';

/**
 * The app's four tabs, recreated in HTML for the landing page. Every value here is made-up demo
 * data (no real account, balance, course or person).
 */

import {
  ArrowUp,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleQuestionMark,
  Eye,
  Globe,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  Puzzle,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type ReactNode, useEffect, useState } from 'react';
import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/cn';
import { PCard } from './phone-frame';

const spring = { type: 'spring', stiffness: 300, damping: 30 } as const;

function Rise({ delay = 0, className, children }: { delay?: number; className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Steps through 0..n on a timeline (ms), restarting whenever the screen mounts. Pass a module-level array. */
function useTimeline(times: number[]) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? times.length : 0);
  useEffect(() => {
    if (reduce) return;
    const ids = times.map((t, i) => setTimeout(() => setStep(i + 1), t));
    return () => ids.forEach(clearTimeout);
  }, [reduce, times]);
  return step;
}

const CHAT_TIMES = [200, 900, 1700, 2600, 4300, 5000];
const SCHEDULE_TIMES = [1600];
const SETTINGS_TIMES = [1300, 2300, 3000];

const muted = 'text-black/50 dark:text-white/50';
const faint = 'text-black/35 dark:text-white/35';
const accent = 'text-[#8b0012] dark:text-[#ff5a6a]';

function ScreenTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-5 pt-2 pb-3">
      {sub && <p className={cn('text-[10px] font-medium', muted)}>{sub}</p>}
      <h3 className="font-bold text-[24px] tracking-[-0.02em]">{title}</h3>
    </div>
  );
}

/* ───────────────────────────── Chat ───────────────────────────── */

export function ChatScreen() {
  const step = useTimeline(CHAT_TIMES);
  const answer = '现在余额 ¥86.20，已经低于 100。我可以每天早上 8 点帮你看一次：';
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-1 pb-2">
        <div>
          <p className="font-semibold text-[14px]">校园卡提醒</p>
          <p className={cn('text-[10px]', faint)}>DeepSeek</p>
        </div>
        <Plus className={cn('size-4', muted)} aria-hidden="true" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-4 pt-1">
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, x: 20, y: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={spring}
            style={{ transformOrigin: '100% 100%' }}
            className="ml-auto max-w-[82%] rounded-[16px] rounded-br-[6px] bg-[#8b0012]/12 px-3 py-2 text-[12px] leading-[1.55] dark:bg-[#8b0012]/45"
          >
            卡里钱少了提醒我充值，每天早上看一次
          </motion.div>
        )}
        {step >= 2 && (
          <Rise className="flex">
            <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-black/[0.06] bg-white/50 px-2 py-1 text-[10.5px] dark:border-white/[0.08] dark:bg-white/[0.04]">
              {step >= 3 ? (
                <Check className="size-3 text-[#16a34a] dark:text-[#22c55e]" strokeWidth={3} aria-hidden="true" />
              ) : (
                <span className="size-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent opacity-60" />
              )}
              <span className={muted}>校园钱包</span>
              校园卡余额
            </span>
          </Rise>
        )}
        {step >= 3 && (
          <p className="text-[12px] leading-[1.6]">
            {answer.split('').map((ch, i) => (
              <motion.span
                // biome-ignore lint/suspicious/noArrayIndexKey: characters of a fixed string
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.018, duration: 0.2 }}
              >
                {ch}
              </motion.span>
            ))}
          </p>
        )}
        {step >= 4 && (
          <Rise>
            <PCard className="p-3">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-[7px] bg-[#8b0012]/10 dark:bg-[#ff5a6a]/15">
                  <Bell className={cn('size-3.5', accent)} aria-hidden="true" />
                </span>
                <p className="font-semibold text-[12.5px]">定时检查</p>
              </div>
              <dl className="mt-2.5 space-y-1.5 text-[11px]">
                {[
                  ['数据', '校园卡余额'],
                  ['条件', '低于 ¥100'],
                  ['时间', '每天 08:00'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded-[8px] bg-black/[0.035] px-2.5 py-1.5 dark:bg-white/[0.045]"
                  >
                    <dt className={muted}>{k}</dt>
                    <dd className="font-medium tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <AnimatePresence mode="wait" initial={false}>
                {step < 6 ? (
                  <motion.div
                    key="btn"
                    exit={{ opacity: 0, scale: 0.96 }}
                    animate={{ scale: step === 5 ? 0.96 : 1 }}
                    transition={{ duration: 0.12 }}
                    className="mt-2.5 rounded-[10px] bg-[#8b0012] py-2 text-center font-semibold text-[11.5px] text-white"
                  >
                    创建
                  </motion.div>
                ) : (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={spring}
                    className="mt-2.5 flex items-center justify-center gap-1.5 rounded-[10px] bg-[#16a34a]/10 py-2 font-medium text-[#15803d] text-[11px] dark:bg-[#22c55e]/12 dark:text-[#4ade80]"
                  >
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                    已创建，下次：明天 08:00
                  </motion.div>
                )}
              </AnimatePresence>
            </PCard>
          </Rise>
        )}
      </div>
      <div className="px-3 pb-2">
        <div className="rounded-[18px] border border-black/[0.06] bg-white/55 p-2.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
          <p className={cn('px-1 text-[11px]', faint)}>问点什么，或者让我做点什么…</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={cn('flex items-center gap-2 text-[10px]', muted)}>
              <Plus className="size-3.5" aria-hidden="true" />
              DeepSeek
              <ChevronDown className="size-3" aria-hidden="true" />
            </span>
            <span className="grid size-7 place-items-center rounded-[9px] bg-[#8b0012]/80 text-white">
              <ArrowUp className="size-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Dashboard ─────────────────────────── */

const SPARK = [212, 209.5, 206, 198, 196.8, 190, 214, 207.3, 203, 199.9, 194, 186.4];

function Sparkline() {
  const w = 236;
  const h = 44;
  const min = Math.min(...SPARK) - 4;
  const max = Math.max(...SPARK) + 4;
  const pts = SPARK.map((v, i) => [(i / (SPARK.length - 1)) * w, h - ((v - min) / (max - min)) * h] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h + 4}`} className="mt-2 h-11 w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c42236" stopOpacity="0.25" />
          <stop offset="1" stopColor="#c42236" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${d} L${w} ${h + 4} L0 ${h + 4} Z`}
        fill="url(#spark-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="#e0364a"
        strokeWidth={1.6}
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
      />
      <motion.circle
        cx={last[0]}
        cy={last[1]}
        r={3}
        fill="#e0364a"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ ...spring, delay: 1.3 }}
      />
    </svg>
  );
}

export function DashboardScreen() {
  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden px-4">
      <ScreenTitle title="看板" sub="10月22日 周四" />
      <Rise>
        <PCard className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-[11.5px]">
              <Wallet className={cn('size-3.5', muted)} aria-hidden="true" />
              校园卡
            </span>
            <span className={cn('text-[10px]', faint)}>3 分钟前</span>
          </div>
          <p className="mt-1.5 font-bold text-[34px] leading-none tracking-[-0.03em]">
            <span className="me-0.5 align-[0.45em] font-semibold text-[14px]">¥</span>
            <NumberTicker value={186.4} from={212} decimalPlaces={2} />
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1 rounded-[6px] bg-[#f97350]/12 px-1.5 py-0.5 font-medium text-[#c2410c] text-[10px] tabular-nums dark:text-[#fb9a7c]">
            − ¥25.60 今天
          </p>
          <Sparkline />
        </PCard>
      </Rise>
      <div className="grid grid-cols-2 gap-2.5">
        <Rise delay={0.08}>
          <PCard className="p-3">
            <p className={cn('text-[10.5px]', muted)}>网费余额</p>
            <p className="mt-1 font-bold text-[19px] tabular-nums tracking-[-0.02em]">
              <span className="me-0.5 text-[11px]">¥</span>
              <NumberTicker value={32} decimalPlaces={2} delay={0.1} />
            </p>
          </PCard>
        </Rise>
        <Rise delay={0.12}>
          <PCard className="p-3">
            <p className={cn('text-[10.5px]', muted)}>教学周</p>
            <p className="mt-1 font-bold text-[19px] tracking-[-0.02em]">
              第 <NumberTicker value={7} delay={0.15} /> 周
            </p>
          </PCard>
        </Rise>
      </div>
      <Rise delay={0.18}>
        <PCard className="flex items-center gap-3 p-3">
          <div className="flex h-10 w-1 rounded-full bg-[#8b0012] dark:bg-[#ff5a6a]" />
          <div className="min-w-0 flex-1">
            <p className={cn('text-[10px]', muted)}>下一节 · 还有 25 分钟</p>
            <p className="truncate font-semibold text-[12.5px]">数据结构与算法</p>
            <p className={cn('text-[10.5px] tabular-nums', muted)}>14:00 理教 207</p>
          </div>
        </PCard>
      </Rise>
      <Rise delay={0.24}>
        <PCard className="flex items-center gap-2.5 p-3">
          <Bell className={cn('size-4 shrink-0', accent)} aria-hidden="true" />
          <p className="text-[11px] leading-snug">
            每天 08:00 检查余额
            <span className={cn('block', muted)}>低于 ¥100 时通知我</span>
          </p>
        </PCard>
      </Rise>
    </div>
  );
}

/* ─────────────────────────── Schedule ─────────────────────────── */

const WEEK = [
  ['一', 19],
  ['二', 20],
  ['三', 21],
  ['四', 22],
  ['五', 23],
  ['六', 24],
  ['日', 25],
] as const;

const CLASSES = [
  { time: '08:00', end: '09:50', name: '高等数学 (B)', room: '二教 203', done: true },
  { time: '10:10', end: '12:00', name: '计算概论', room: '理教 107', done: true },
  { time: '14:00', end: '15:50', name: '数据结构与算法', room: '理教 207', next: true },
  { time: '18:40', end: '20:30', name: '大学英语', room: '三教 302' },
];

export function ScheduleScreen() {
  const step = useTimeline(SCHEDULE_TIMES);
  return (
    <div className="flex h-full flex-col overflow-hidden px-4">
      <ScreenTitle title="日程" sub="第 7 周" />
      <Rise className="grid grid-cols-7 gap-1 text-center">
        {WEEK.map(([d, n]) => {
          const today = n === 22;
          return (
            <div
              key={d}
              className={cn(
                'rounded-[10px] py-1.5',
                today ? 'bg-[#8b0012] text-white' : 'bg-black/[0.03] dark:bg-white/[0.04]',
              )}
            >
              <p className={cn('text-[9.5px]', today ? 'text-white/75' : muted)}>{d}</p>
              <p className="font-semibold text-[12px] tabular-nums">{n}</p>
            </div>
          );
        })}
      </Rise>
      <div className="mt-3 space-y-1.5">
        {CLASSES.map((c, i) => (
          <Rise key={c.name} delay={0.06 + i * 0.04}>
            <div
              className={cn(
                'flex items-center gap-3 rounded-[12px] px-3 py-2',
                c.next
                  ? 'bg-[#8b0012]/8 ring-1 ring-[#8b0012]/25 dark:bg-[#ff5a6a]/10 dark:ring-[#ff5a6a]/30'
                  : 'bg-black/[0.025] dark:bg-white/[0.03]',
                c.done && 'opacity-55',
              )}
            >
              <div className="w-9 font-medium text-[10.5px] tabular-nums leading-tight">
                {c.time}
                <span className={cn('block text-[9.5px]', faint)}>{c.end}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[12px]">{c.name}</p>
                <p className={cn('text-[10px]', muted)}>{c.room}</p>
              </div>
            </div>
          </Rise>
        ))}
      </div>
      <p className={cn('mt-4 mb-1.5 px-1 font-medium text-[10.5px]', muted)}>待办</p>
      <Rise delay={0.25}>
        <PCard className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
          <TodoRow title="数据结构作业 3" meta="周五 23:59 截止" checked={step >= 1} />
          <TodoRow title="背单词" meta="每 3 天，共 16 次 · 第 4 次" repeat />
        </PCard>
      </Rise>
    </div>
  );
}

function TodoRow({
  title,
  meta,
  checked,
  repeat,
}: {
  title: string;
  meta: string;
  checked?: boolean;
  repeat?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <motion.span
        animate={checked ? { scale: [1, 0.8, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'grid size-[18px] shrink-0 place-items-center rounded-full border-[1.5px] transition-colors',
          checked ? 'border-[#8b0012] bg-[#8b0012] text-white' : 'border-black/25 dark:border-white/30',
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
      </motion.span>
      <div className="min-w-0">
        <p className={cn('font-medium text-[12px] transition-opacity', checked && 'line-through opacity-50')}>
          {title}
        </p>
        <p className={cn('text-[10px] tabular-nums', repeat ? accent : muted)}>{meta}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── Settings ─────────────────────────── */

type Mode = 'allow' | 'ask' | 'never';
const MODE: Record<Mode, { label: string; dot: string }> = {
  allow: { label: '允许', dot: 'bg-[#22c55e]' },
  ask: { label: '先问我', dot: 'bg-[#efaa3c]' },
  never: { label: '禁止', dot: 'bg-black/30 dark:bg-white/30' },
};

export function SettingsScreen() {
  const step = useTimeline(SETTINGS_TIMES);
  const publicMode: Mode = step >= 3 ? 'ask' : 'allow';
  const rows = [
    { icon: Eye, title: '读取', desc: '浏览、搜索、阅读帖子', mode: 'allow' as Mode },
    { icon: Pencil, title: '修改', desc: '关注帖子', mode: 'allow' as Mode },
    { icon: Globe, title: '公开', desc: '匿名发帖和回复', mode: publicMode, menu: true },
  ];
  return (
    <div className="flex h-full flex-col overflow-hidden px-4">
      <ScreenTitle title="设置" />
      <Rise>
        <PCard className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <span className="grid size-7 place-items-center rounded-[8px] bg-black/[0.04] dark:bg-white/[0.06]">
              <KeyRound className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[12px]">北大账号</p>
              <p className={cn('text-[10px]', muted)}>已登录，凭据只存在本机</p>
            </div>
            <Lock className={cn('size-3.5', faint)} aria-hidden="true" />
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <span className="grid size-7 place-items-center rounded-[8px] bg-black/[0.04] dark:bg-white/[0.06]">
              <Sparkles className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[12px]">AI 服务</p>
              <p className={cn('text-[10px]', muted)}>DeepSeek，自己的 Key</p>
            </div>
          </div>
        </PCard>
      </Rise>
      <p className={cn('mt-4 mb-1.5 px-1 font-medium text-[10.5px]', muted)}>树洞：AI 可以做什么</p>
      <Rise delay={0.08}>
        <PCard className="relative divide-y divide-black/[0.05] dark:divide-white/[0.06]">
          {rows.map((r) => (
            <div key={r.title} className="relative flex items-center gap-2.5 px-3 py-2.5">
              <span className="grid size-7 place-items-center rounded-[8px] bg-black/[0.04] dark:bg-white/[0.06]">
                <r.icon className="size-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[12px]">{r.title}</p>
                <p className={cn('truncate text-[10px]', muted)}>{r.desc}</p>
              </div>
              <motion.span
                layout
                animate={r.menu && step === 1 ? { scale: 0.94 } : { scale: 1 }}
                className="flex items-center gap-1 rounded-full bg-black/[0.045] py-1 ps-2 pe-1.5 text-[10.5px] dark:bg-white/[0.07]"
              >
                <span className={cn('size-1.5 rounded-full', MODE[r.mode].dot)} />
                {MODE[r.mode].label}
                <ChevronDown className="size-3 opacity-50" aria-hidden="true" />
              </motion.span>
            </div>
          ))}
          <AnimatePresence>
            {step >= 1 && step < 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={spring}
                style={{ transformOrigin: '90% 0%' }}
                className="absolute top-[calc(100%-10px)] right-2 z-20 w-[170px] rounded-[14px] border border-black/[0.06] bg-white p-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)] dark:border-white/[0.08] dark:bg-[#17181b]"
              >
                {(
                  [
                    ['allow', Zap, 'AI 直接做'],
                    ['ask', CircleQuestionMark, '每次先确认'],
                    ['never', Lock, 'AI 不能做'],
                  ] as const
                ).map(([m, Icon, hint]) => {
                  const hot = step >= 2 ? m === 'ask' : m === 'allow';
                  return (
                    <div
                      key={m}
                      className={cn(
                        'flex items-center gap-2 rounded-[10px] px-2 py-1.5 transition-colors',
                        hot && 'bg-black/[0.04] dark:bg-white/[0.06]',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-3.5',
                          m === 'allow' && 'text-[#16a34a] dark:text-[#22c55e]',
                          m === 'ask' && 'text-[#c98a1c] dark:text-[#efaa3c]',
                          m === 'never' && muted,
                        )}
                        aria-hidden="true"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-[11px]">{MODE[m].label}</p>
                        <p className={cn('text-[9.5px]', muted)}>{hint}</p>
                      </div>
                      {hot && <Check className={cn('size-3', accent)} strokeWidth={3} aria-hidden="true" />}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </PCard>
      </Rise>
      <p className={cn('mt-2 px-1 text-[10px] leading-relaxed', faint)}>
        花钱和公开发布的操作，可以要求 AI 每次先问你。
      </p>
      <Rise delay={0.16} className="mt-3">
        <PCard className="flex items-center gap-2.5 px-3 py-2.5">
          <span className="grid size-7 place-items-center rounded-[8px] bg-black/[0.04] dark:bg-white/[0.06]">
            <Puzzle className="size-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[12px]">插件与插件市场</p>
            <p className={cn('text-[10px]', muted)}>内置和社区插件，一律平等</p>
          </div>
          <ChevronRight className={cn('size-3.5', faint)} aria-hidden="true" />
        </PCard>
      </Rise>
    </div>
  );
}
