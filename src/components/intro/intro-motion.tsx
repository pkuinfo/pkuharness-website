'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/logo';
import { useReducedMotionAfterMount } from '@/components/ui/use-reduced-motion-after-mount';
import type { Messages } from '@/lib/messages';
import type { Stage } from './stage';
import { FORMS, formWeight } from './targets';

type IntroMessages = Messages['intro'];

/** Scroll length: viewport heights per change of shape, plus a short hold on the last one. */
const VH_PER_FORM = 1.15;
const SCROLL_VH = (FORMS.length - 1) * VH_PER_FORM + 0.3;
/** Seconds without pointer input before the particles start being stirred on their own. */
const IDLE = 3;
/** The visitor's choice to turn the animation off is kept here (`'off'`). */
const STORE = 'pkuharness.intro.motion';
/** Below this frame rate, measured over a few seconds, the page offers to turn the animation off. */
const SLOW_FPS = 24;

const stored = (): boolean => {
  try {
    return window.localStorage.getItem(STORE) === 'off';
  } catch {
    return false;
  }
};

/**
 * The site root: an interactive WebGL particle piece, not a feature tour (the home page explains
 * the app). Tens of thousands of particles re-form as you scroll: sphere, galaxy, a wave with
 * bouncing glossy balls, 博雅塔, the bird mark, the wordmark. The pointer pushes particles aside
 * and tilts the scene; a click or tap sends a shockwave. With no input at all the particles keep
 * flowing and an invisible hand stirs them.
 *
 * Native scroll, no hijacking: the progress eases toward the scroll position. This component only
 * feeds the stage (stage-gl.ts, or stage-2d.ts without WebGL) and fades in the link at the end.
 */
export function IntroMotion({
  m,
  homeHref,
  otherLangHref,
}: {
  m: IntroMessages;
  homeHref: string;
  otherLangHref: string;
}) {
  const router = useRouter();
  const reduced = useReducedMotionAfterMount();
  const [kind, setKind] = useState<'gl' | '2d' | null>(null);
  const [count, setCount] = useState(0);
  const [form, setForm] = useState(0);
  const [touch, setTouch] = useState(false);
  // Turned off by the visitor: the still frame is shown and three.js is never loaded.
  const [off, setOff] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => setOff(stored()), []);

  const toggle = useCallback(() => {
    setOff((was) => {
      try {
        if (was) window.localStorage.removeItem(STORE);
        else window.localStorage.setItem(STORE, 'off');
      } catch {
        // Private mode: the choice lasts for this visit only.
      }
      return !was;
    });
    setSlow(false);
    window.scrollTo(0, 0);
  }, []);

  const canvas = useRef<HTMLCanvasElement>(null);
  const el = useRef<Record<string, HTMLElement | null>>({});
  const ref = useCallback(
    (key: string) => (node: HTMLElement | null) => {
      el.current[key] = node;
    },
    [],
  );

  useEffect(() => {
    router.prefetch(homeHref);
  }, [router, homeHref]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push(homeHref);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, homeHref]);

  useEffect(() => {
    // Checked directly as well: `reduced` is false on the first render, and three.js must not load.
    if (reduced || off || stored() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = canvas.current;
    if (!cv) return;
    let disposed = false;
    let raf = 0;
    let stage: Stage | null = null;
    let shown = -1;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    setTouch(coarse);
    const max = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const target = () => (window.scrollY / max()) * (FORMS.length - 1);
    const clock = { u: target(), time: 0, last: 0 };
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, push: 0, moved: -100 };
    // Frame-rate watch: starts once the stage is running, reports once.
    const fps = { frames: 0, since: 0, told: false };

    const cache = new Map<string, string>();
    const write = (key: string, prop: 'opacity' | 'transform', value: string) => {
      const node = el.current[key];
      const id = `${key}.${prop}`;
      if (!node || cache.get(id) === value) return;
      cache.set(id, value);
      node.style[prop] = value;
    };

    const size = () => stage?.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);

    // A capture script may supply the clock (`window.__introNow`, in ms) to render a video frame by
    // frame; normally this is undefined and the frame time is used.
    const external = (window as { __introNow?: () => number }).__introNow;
    const frame = (rafNow: number) => {
      const now = external ? external() : rafNow;
      const dt = clock.last ? Math.min((now - clock.last) / 1000, 0.1) : 0;
      clock.last = now;
      clock.time += dt;
      // Progress eases toward the scroll position: smooth when the scroll stops or jumps.
      const goal = target();
      clock.u += (goal - clock.u) * (1 - Math.exp(-dt * 6));
      if (Math.abs(goal - clock.u) < 1e-4) clock.u = goal;

      // With no input, an invisible hand wanders across the particles.
      const idle = clock.time - ptr.moved > IDLE;
      if (idle) {
        ptr.tx = Math.sin(clock.time * 0.42) * 0.55;
        ptr.ty = Math.sin(clock.time * 0.31 + 1.3) * 0.38;
      }
      const k = 1 - Math.exp(-dt * (idle ? 1.5 : 7));
      ptr.x += (ptr.tx - ptr.x) * k;
      ptr.y += (ptr.ty - ptr.y) * k;
      ptr.push += ((idle ? 0.55 : 1) - ptr.push) * (1 - Math.exp(-dt * 3));

      stage?.frame({ u: clock.u, time: clock.time, dt, px: ptr.x, py: ptr.y, push: ptr.push });
      if (stage && !external && !fps.told && !document.hidden) {
        if (!fps.since) fps.since = now;
        fps.frames++;
        const span = now - fps.since;
        if (span > 4000) {
          if ((fps.frames / span) * 1000 < SLOW_FPS) {
            fps.told = true;
            setSlow(true);
          }
          fps.frames = 0;
          fps.since = now;
        }
      }

      // The link at the end.
      const u = clock.u;
      const end = formWeight(u, FORMS.length - 1);
      write('end', 'opacity', end.toFixed(3));
      write('end', 'transform', `translate3d(-50%,${((1 - end) * 30).toFixed(1)}px,0)`);
      const endNode = el.current.end;
      if (endNode) endNode.dataset.on = end > 0.6 ? '1' : '0';
      write('hint', 'opacity', Math.max(0, 1 - u * 4).toFixed(3));
      write('progress', 'transform', `scaleX(${Math.min(1, window.scrollY / max()).toFixed(4)})`);
      const current = Math.round(u);
      if (current !== shown) {
        shown = current;
        setForm(current);
      }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (x: number, y: number) => {
      ptr.tx = (x / window.innerWidth) * 2 - 1;
      ptr.ty = (y / window.innerHeight) * 2 - 1;
      ptr.moved = clock.time;
    };
    const onPointer = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest('a,button')) return;
      onMove(e.clientX, e.clientY);
      stage?.shock((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('resize', size);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('click', onClick);

    import('./stage')
      .then(({ createStage }) =>
        createStage({
          canvas: cv,
          light: coarse || window.innerWidth < 700,
          fontFamily: getComputedStyle(document.body).fontFamily || 'sans-serif',
        }),
      )
      .then((s) => {
        if (disposed) {
          s.dispose();
          return;
        }
        stage = s;
        setKind(s.kind);
        setCount(s.count);
        size();
      });
    raf = requestAnimationFrame(frame);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      stage?.dispose();
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('click', onClick);
    };
  }, [reduced, off]);

  return (
    <div
      className="ih-root"
      data-mode={reduced || off ? 'static' : 'motion'}
      data-stage={kind ?? 'none'}
      style={{ '--ih-scroll': `${(SCROLL_VH + 1) * 100}svh` } as CSSProperties}
    >
      <h1 className="sr-only">PKU harness</h1>
      <p className="sr-only">{m.label}</p>

      <div ref={ref('progress')} className="ih-progress" aria-hidden="true" />
      <canvas ref={canvas} className="ih-stage" />

      <div ref={ref('end')} className="ih-end">
        <Link href={homeHref} className="ih-enter-link">
          {m.enter}
        </Link>
      </div>

      <div ref={ref('hint')} className="ih-hint" aria-hidden="true">
        <span>{touch ? m.hintTouch : m.hint}</span>
        <span className="ih-hint-scroll">
          {m.scroll}
          <ChevronDown aria-hidden="true" />
        </span>
      </div>

      <p className="ih-hud" aria-hidden="true">
        {count > 0 && (
          <>
            <span>
              {count.toLocaleString('en-US')} {m.particles}
            </span>
            <span>
              {String(form + 1).padStart(2, '0')}/{String(FORMS.length).padStart(2, '0')} {m.forms[form]}
            </span>
            <span>{kind === 'gl' ? 'WebGL 2' : 'Canvas 2D'}</span>
          </>
        )}
      </p>

      {/* The scroll track: its height is the length of the piece. */}
      <div className="ih-track-scroll" />

      {/* Reduced motion and no JavaScript: a still frame. */}
      <div className="ih-still">
        <Logo size={112} />
        <p className="ih-still-name">PKU harness</p>
        <Link href={homeHref} className="ih-enter-link">
          {m.enter}
        </Link>
      </div>

      {slow && !off && (
        <div className="ih-slow" role="status">
          <span>{m.slow}</span>
          <button type="button" className="ih-btn" onClick={toggle}>
            {m.motionOff}
          </button>
        </div>
      )}

      <header className="ih-top">
        <Link href={homeHref} className="ih-brand">
          <Logo size={22} />
          <span>PKU harness</span>
        </Link>
        <div className="ih-actions">
          {!reduced && (
            <button type="button" className="ih-btn ih-btn-quiet" onClick={toggle} aria-pressed={off}>
              {off ? m.motionOn : m.motionOff}
            </button>
          )}
          <Link href={otherLangHref} className="ih-btn ih-btn-quiet" prefetch={false}>
            {m.otherLang}
          </Link>
          <Link href={homeHref} className="ih-btn">
            {m.enter}
            <kbd className="ih-kbd">Esc</kbd>
          </Link>
        </div>
      </header>
    </div>
  );
}
