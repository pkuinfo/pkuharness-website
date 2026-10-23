'use client';

import { Check } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { orbitD, orbitPoint } from '@/components/brand/logo';

/**
 * The brand mark performing, as the app's <Logo intro orbiting>: the stem rises, the orbit draws
 * on, the agent bead arrives and keeps travelling round its orbit. A dial of ticks lights up
 * under the bead, and each time it passes a station a tool call "lands" next to the mark.
 * Geometry comes from `components/brand/logo.tsx` (viewBox 0 0 120 120). Reduced motion: the
 * finished mark, bead at home, one result shown.
 */

const CX = 62;
const CY = 53;
const HOME = -38;
const REV_MS = 9000;
const TICKS = 72;
const DIAL_R = 44;

type Station = { at: number; title: string; value: string; place: string };
// Fake data for illustration only.
const STATIONS: Station[] = [
  { at: -10, title: '校园卡余额', value: '¥ 186.40', place: 'right-0 top-[18%] md:-right-6' },
  { at: 95, title: '今天的课', value: '3 节 · 首节 08:00', place: 'right-[6%] bottom-[4%]' },
  { at: 200, title: '创建提醒', value: '每天 08:00', place: 'left-0 bottom-[22%] md:-left-8' },
  { at: 285, title: '食堂人流', value: '学五 · 空闲', place: 'left-[8%] top-[2%]' },
];

const ease = [0.23, 1, 0.32, 1] as const;
/** Rounded so server and client render identical attributes. */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

export function HeroMark() {
  const id = useId().replace(/:/g, '');
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const beadRef = useRef<SVGGElement>(null);
  const gapRef = useRef<SVGCircleElement>(null);
  const trailRefs = useRef<(SVGCircleElement | null)[]>([]);
  const tickRefs = useRef<(SVGLineElement | null)[]>([]);
  const [station, setStation] = useState<number>(reduce ? 0 : -1);

  useEffect(() => {
    const place = (deg: number) => {
      const p = orbitPoint(deg);
      beadRef.current?.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
      gapRef.current?.setAttribute('cx', p.x.toFixed(2));
      gapRef.current?.setAttribute('cy', p.y.toFixed(2));
      trailRefs.current.forEach((c, i) => {
        if (!c) return;
        const t = orbitPoint(deg - (i + 1) * 7);
        c.setAttribute('cx', t.x.toFixed(2));
        c.setAttribute('cy', t.y.toFixed(2));
      });
      const norm = (((deg % 360) + 360) % 360) / 360;
      tickRefs.current.forEach((line, i) => {
        if (!line) return;
        let d = norm - i / TICKS;
        d = d - Math.round(d);
        const lit = d >= 0 ? Math.max(0, 1 - d * 9) : 0;
        line.style.opacity = String(0.16 + lit * 0.84);
      });
    };

    if (reduce) {
      place(HOME);
      setStation(0);
      return;
    }

    let frame = 0;
    let running = false;
    let visible = true;
    let elapsed = 0;
    let last = 0;
    let current = -1;
    const startDelay = 1250;
    const begin = performance.now();
    place(HOME);

    const tick = (now: number) => {
      frame = 0;
      if (!running) return;
      if (now - begin > startDelay) {
        elapsed += last ? Math.min(64, now - last) : 0;
        last = now;
      }
      const deg = HOME + (elapsed / REV_MS) * 360;
      place(deg);
      if (elapsed > 0) {
        const n = (((deg % 360) + 360) % 360) as number;
        let next = current;
        for (let i = 0; i < STATIONS.length; i++) {
          const s = (((STATIONS[i].at % 360) + 360) % 360) as number;
          const delta = (n - s + 360) % 360;
          if (delta < 6) next = i;
        }
        if (next !== current) {
          current = next;
          setStation(next);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      if (visible) start();
      else stop();
    });
    if (rootRef.current) io.observe(rootRef.current);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    start();
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduce]);

  const raw = orbitPoint(HOME);
  const home = { x: r3(raw.x), y: r3(raw.y) };
  const intro = !reduce;

  return (
    <div ref={rootRef} className="relative mx-auto aspect-square w-full max-w-[460px]">
      <svg viewBox="-8 -19 140 140" className="size-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={`ink-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="100">
            <stop offset="0" stopColor="var(--color-fd-foreground)" />
            <stop
              offset="1"
              stopColor="color-mix(in oklab, var(--color-fd-foreground) 82%, var(--color-fd-background))"
            />
          </linearGradient>
          <radialGradient id={`glow-${id}`}>
            <stop offset="0" stopColor="#ff5a6a" stopOpacity="0.85" />
            <stop offset="0.45" stopColor="#c42236" stopOpacity="0.28" />
            <stop offset="1" stopColor="#8b0012" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`halo-${id}`}>
            <stop offset="0" stopColor="#c42236" stopOpacity="0.22" />
            <stop offset="1" stopColor="#c42236" stopOpacity="0" />
          </radialGradient>
          <mask id={`gap-${id}`} maskUnits="userSpaceOnUse" x="-40" y="-40" width="200" height="200">
            <rect x="-40" y="-40" width="200" height="200" fill="#fff" />
            <circle ref={gapRef} cx={home.x} cy={home.y} r={10.7} fill="#000" />
          </mask>
        </defs>

        <circle cx={CX} cy={CY} r={58} fill={`url(#halo-${id})`} />

        {/* Dial: ticks light up under the bead */}
        <motion.g
          initial={intro ? { opacity: 0, scale: 0.94 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease, delay: 0.2 }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          {Array.from({ length: TICKS }, (_, i) => {
            const a = (i / TICKS) * Math.PI * 2;
            const major = i % 6 === 0;
            const r1 = DIAL_R;
            const r2 = DIAL_R + (major ? 4.2 : 2.4);
            return (
              <line
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed dial
                key={i}
                ref={(el) => {
                  tickRefs.current[i] = el;
                }}
                x1={r3(CX + r1 * Math.cos(a))}
                y1={r3(CY + r1 * Math.sin(a))}
                x2={r3(CX + r2 * Math.cos(a))}
                y2={r3(CY + r2 * Math.sin(a))}
                stroke={major ? '#ff5a6a' : 'var(--color-fd-foreground)'}
                strokeWidth={major ? 0.7 : 0.45}
                strokeLinecap="round"
                style={{ opacity: 0.16 }}
              />
            );
          })}
          <circle
            cx={CX}
            cy={CY}
            r={23}
            fill="none"
            stroke="var(--color-fd-foreground)"
            strokeOpacity={0.1}
            strokeWidth={0.4}
            strokeDasharray="0.6 2.2"
          />
        </motion.g>

        {/* The mark */}
        <g mask={`url(#gap-${id})`}>
          <motion.rect
            x={33}
            y={23.5}
            width={15}
            height={72}
            rx={4.5}
            fill={`url(#ink-${id})`}
            initial={intro ? { scaleY: 0 } : false}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.75, ease }}
            style={{ transformOrigin: '40.5px 95.5px' }}
          />
          <motion.path
            d={orbitD}
            fill="none"
            stroke={`url(#ink-${id})`}
            strokeWidth={13}
            initial={intro ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.35 }}
          />
        </g>

        {/* Bead + comet trail */}
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            ref={(el) => {
              trailRefs.current[i] = el;
            }}
            cx={home.x}
            cy={home.y}
            r={7.5 - i * 1.5}
            fill="#ff5a6a"
            opacity={reduce ? 0 : 0.22 - i * 0.05}
          />
        ))}
        <motion.g
          initial={intro ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease, delay: 0.95 }}
        >
          <g ref={beadRef} transform={`translate(${home.x} ${home.y})`}>
            <circle r={22} fill={`url(#glow-${id})`} />
            <circle r={8.5} fill="#c42236" />
            <circle r={8.5} fill="#ff5a6a" opacity={0.55} />
            <circle r={3.2} cx={-2.2} cy={-2.4} fill="#fff" opacity={0.75} />
          </g>
        </motion.g>
      </svg>

      {/* Tool results landing next to the mark */}
      <AnimatePresence>
        {station >= 0 && (
          <motion.div
            key={station}
            initial={{ opacity: 0, y: 10, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(4px)', transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className={`lp-glass absolute ${STATIONS[station].place} flex items-center gap-2.5 rounded-[10px] py-2 ps-2.5 pe-3.5 text-[13px] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]`}
          >
            <span className="grid size-5 place-items-center rounded-full bg-[color-mix(in_oklab,var(--color-up)_18%,transparent)] text-(--color-up)">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span className="text-fd-muted-foreground">{STATIONS[station].title}</span>
            <span className="font-semibold tabular-nums">{STATIONS[station].value}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
