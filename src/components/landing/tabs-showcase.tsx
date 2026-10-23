'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { PHONE_TABS, PhoneFrame, type PhoneTabId } from './phone/phone-frame';
import { ChatScreen, DashboardScreen, ScheduleScreen, SettingsScreen } from './phone/screens';

const COPY: Record<PhoneTabId, { title: string; en: string; body: string; screen: () => ReactNode }> = {
  chat: {
    title: '对话',
    en: 'Chat',
    body: '用一句话说需求。助手调用插件去查、去办，需要你确认或补充信息时，直接在对话里生成原生的表单、选择器和卡片。',
    screen: ChatScreen,
  },
  dashboard: {
    title: '看板',
    en: 'Dashboard',
    body: '想盯着哪个数，就让 AI 把它放上看板：校园卡余额、网费、下一节课。数据实时刷新，你随时可以在对话里改。',
    screen: DashboardScreen,
  },
  schedule: {
    title: '日程',
    en: 'Schedule',
    body: '课表从学校同步，待办和提醒随口创建，支持「每 3 天，共 16 次」这样的自由重复，系统闹钟准时送达。',
    screen: ScheduleScreen,
  },
  settings: {
    title: '设置',
    en: 'Settings',
    body: '设置只留必须的：北大账号、AI 服务、插件。每个插件按「读取、修改、花钱、公开」分开授权：允许、先问我，或禁止。',
    screen: SettingsScreen,
  },
};

const DWELL = 8000;

export function TabsShowcase() {
  const [active, setActive] = useState<PhoneTabId>('chat');
  const [auto, setAuto] = useState(true);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const running = auto && inView && !reduce;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      const i = PHONE_TABS.findIndex((x) => x.id === active);
      setActive(PHONE_TABS[(i + 1) % PHONE_TABS.length].id);
    }, DWELL);
    return () => clearTimeout(t);
  }, [active, running]);

  const pick = (id: PhoneTabId) => {
    setAuto(false);
    setActive(id);
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const dir =
      e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (i + dir + PHONE_TABS.length) % PHONE_TABS.length;
    pick(PHONE_TABS[n].id);
    tabRefs.current[n]?.focus();
  };

  const Screen = COPY[active].screen;

  return (
    <div ref={ref} className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
      <div
        role="tablist"
        aria-label="App 的四个标签页"
        aria-orientation="vertical"
        className="flex flex-col gap-1.5 lg:max-w-xl"
      >
        {PHONE_TABS.map((t, i) => {
          const on = t.id === active;
          const c = COPY[t.id];
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls="phone-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => pick(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'group relative overflow-hidden rounded-[16px] px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-fd-ring',
                on ? 'lp-glass' : 'hover:bg-fd-foreground/[0.03]',
              )}
            >
              <div className="flex items-center gap-3">
                <t.icon
                  className={cn('size-5 transition-colors', on ? 'text-fd-primary' : 'text-fd-muted-foreground')}
                  aria-hidden="true"
                />
                <span className="font-semibold text-lg">{c.title}</span>
                <span className="text-fd-muted-foreground text-sm">{c.en}</span>
              </div>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 34 }}
                    className="overflow-hidden ps-8 text-fd-muted-foreground text-[15px] leading-[1.75]"
                  >
                    <span className="block pt-2">{c.body}</span>
                  </motion.p>
                )}
              </AnimatePresence>
              {on && running && (
                <motion.span
                  key={`${t.id}-progress`}
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[2px] bg-fd-primary/70"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: DWELL / 1000, ease: 'linear' }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div
        id="phone-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        aria-label={`${COPY[active].title}页面示意（演示数据）`}
        onPointerEnter={() => setAuto(false)}
        className="relative"
      >
        <PhoneFrame active={active} onSelect={pick}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(3px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.01, filter: 'blur(3px)', transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            >
              {inView || active !== 'chat' ? <Screen /> : null}
            </motion.div>
          </AnimatePresence>
        </PhoneFrame>
        <p className="mt-4 text-center text-fd-muted-foreground text-xs">界面示意，数据为演示</p>
      </div>
    </div>
  );
}
