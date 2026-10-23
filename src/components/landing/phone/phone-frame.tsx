'use client';

import { CalendarDays, LayoutDashboard, MessagesSquare, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const PHONE_TABS = [
  { id: 'chat', label: '对话', icon: MessagesSquare },
  { id: 'dashboard', label: '看板', icon: LayoutDashboard },
  { id: 'schedule', label: '日程', icon: CalendarDays },
  { id: 'settings', label: '设置', icon: Settings },
] as const;

export type PhoneTabId = (typeof PHONE_TABS)[number]['id'];

/**
 * An Android phone drawn in CSS: bezel, punch-hole camera, status bar, the app's drifting-light
 * backdrop and its glass tab bar with the sliding active pill.
 */
export function PhoneFrame({
  active,
  onSelect,
  children,
  className,
}: {
  active: PhoneTabId;
  onSelect?: (id: PhoneTabId) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative mx-auto aspect-[9/19.5] w-[300px] rounded-[46px] bg-[#0b0b0d] p-[9px] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_0_1.5px_rgba(255,255,255,0.06)] dark:shadow-[0_40px_140px_-30px_rgba(139,0,18,0.45),0_0_0_1px_rgba(255,255,255,0.1),inset_0_0_0_1.5px_rgba(255,255,255,0.06)]',
        className,
      )}
    >
      <div className="relative flex size-full flex-col overflow-hidden rounded-[38px] bg-[#f7f3f3] text-[#121214] dark:bg-[#07080a] dark:text-[#f4f4f5]">
        {/* app backdrop: dim drifting light */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -left-20 size-64 rounded-full bg-[radial-gradient(closest-side,rgba(196,34,54,0.22),transparent)] dark:bg-[radial-gradient(closest-side,rgba(139,0,18,0.55),transparent)]" />
          <div className="absolute top-1/3 -right-24 size-64 rounded-full bg-[radial-gradient(closest-side,rgba(71,92,135,0.16),transparent)] dark:bg-[radial-gradient(closest-side,rgba(14,52,99,0.5),transparent)]" />
          <div className="absolute -bottom-20 left-6 size-56 rounded-full bg-[radial-gradient(closest-side,rgba(186,149,112,0.18),transparent)] dark:bg-[radial-gradient(closest-side,rgba(137,94,67,0.3),transparent)]" />
        </div>
        {/* status bar */}
        <div className="relative z-10 flex h-9 shrink-0 items-center justify-between px-6 pt-1 font-semibold text-[11px] tabular-nums">
          <span>9:41</span>
          <span
            aria-hidden="true"
            className="absolute top-2.5 left-1/2 size-[11px] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10"
          />
          <span className="flex items-center gap-1" aria-hidden="true">
            <SignalIcon />
            <span className="h-[9px] w-[18px] rounded-[3px] border border-current p-px opacity-90">
              <span className="block h-full w-[72%] rounded-[1.5px] bg-current" />
            </span>
          </span>
        </div>
        <div className="relative z-10 min-h-0 flex-1">{children}</div>
        {/* tab bar */}
        <div className="relative z-10 shrink-0 px-3 pt-1 pb-3">
          <div className="grid grid-cols-4 rounded-[18px] border border-black/[0.06] bg-white/60 p-1 backdrop-blur-md dark:border-white/[0.07] dark:bg-white/[0.04]">
            {PHONE_TABS.map((t) => {
              const on = t.id === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onSelect?.(t.id)}
                  className="relative flex flex-col items-center gap-0.5 rounded-[14px] py-1.5 text-[10px]"
                >
                  {on && (
                    <motion.span
                      layoutId="phone-tab-pill"
                      className="absolute inset-0 rounded-[14px] bg-[#8b0012]/10 dark:bg-[#ff5a6a]/12"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <t.icon
                    className={cn(
                      'relative size-[17px] transition-colors',
                      on ? 'text-[#8b0012] dark:text-[#ff5a6a]' : 'opacity-50',
                    )}
                    strokeWidth={on ? 2.3 : 1.8}
                  />
                  <span className={cn('relative font-medium', on ? '' : 'opacity-50')}>{t.label}</span>
                </button>
              );
            })}
          </div>
          <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-current opacity-25" />
        </div>
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor" aria-hidden="true">
      <rect x="0" y="7" width="2.4" height="3" rx="0.6" />
      <rect x="3.8" y="5" width="2.4" height="5" rx="0.6" />
      <rect x="7.6" y="2.5" width="2.4" height="7.5" rx="0.6" />
      <rect x="11.4" y="0" width="2.4" height="10" rx="0.6" />
    </svg>
  );
}

/** Glass card inside the phone. */
export function PCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-[16px] border border-black/[0.05] bg-white/55 shadow-[inset_0_1px_0_white] dark:border-white/[0.06] dark:bg-white/[0.035] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
