'use client';

import { ChevronRight, Pause, Play } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { type CSSProperties, Fragment, useEffect, useRef, useState } from 'react';
import { useReducedMotionAfterMount } from '@/components/ui/use-reduced-motion-after-mount';
import { cn } from '@/lib/cn';
import type { Lang } from '@/lib/i18n';
import { PERSPECTIVE_CSS, PHONE_SVH, poseAt, poseToCss, REST_CSS } from './hero-pose';
import type { BeadKind } from './phone-scene';
import type { MediaPair } from './showcase/device-media';
import { useThemeTone } from './use-theme-tone';

const PhoneScene = dynamic(() => import('./phone-scene'), { ssr: false, loading: () => null });

const VIDEO_ID = 'lp-hero-video';
/** The intro (CSS) is over by then; the 3D phone never fades in during it. */
const INTRO_MS = { full: 1700, quick: 600 };

interface LinkProps {
  href: string;
  label: string;
}

/**
 * The first screen and its scroll sequence, in the manner of Apple's product pages.
 *
 * First paint (no JavaScript needed): a short kicker, the headline, two pill buttons, and a phone
 * in HTML/CSS playing the app's real chat recording. Wide screens put the copy in a left column and
 * the phone in the right half, turned toward it; narrow screens stack them, the phone low in the
 * frame and leaning back. A short
 * intro (CSS) raises the phone, turns it toward you and lights its screen while the headline
 * rises word by word; the full intro plays once per session (`hero.tsx` sets
 * `data-lp-intro`).
 *
 * After the intro, a three.js phone (`phone-scene.tsx`) fades in over the HTML one at the same pose
 * and takes over. The section is tall and its content sticky: scrolling raises the phone to the
 * centre and enlarges it, then turns it aside as the introduction paragraph appears beside it.
 * The scroll mapping follows 21st.dev: manuarora700/container-scroll-animation (Aceternity UI):
 * the device starts tilted back and rotates into place as the title moves away. Changes: a 3D
 * phone instead of a card, a three-step path (rise, zoom, turn aside), pose shared with the static
 * frame, only transform and opacity animate.
 *
 * Reduced motion: no intro, no sticky sequence, no 3D; the phone stands still under the headline
 * with its poster frame, and the paragraph follows below.
 */
export function HeroSequence({
  lang,
  title,
  lead,
  download,
  docs,
  source,
  meta,
  media,
  labels,
  beads,
}: {
  beads: BeadKind[];
  lang: Lang;
  title: string;
  lead: string;
  download: LinkProps;
  docs: LinkProps;
  source: LinkProps;
  meta: (LinkProps | string | null)[];
  media?: MediaPair;
  labels: { play: string; pause: string };
}) {
  const section = useRef<HTMLElement>(null);
  const pose = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotionAfterMount();
  const tone = useThemeTone();
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const [narrow, setNarrow] = useState(false);
  const [load3d, setLoad3d] = useState(false);
  const [ready3d, setReady3d] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [want, setWant] = useState<boolean | null>(null);

  const rec = media?.dark.kind === 'video' ? media.dark : undefined;
  const poster = rec ? rec.poster : media?.dark.src;

  // breakpoint + when to start the 3D scene (after the intro, when the browser is idle)
  useEffect(() => {
    // same breakpoint as the CSS in landing.css: phones and portrait tablets use the narrow path
    const mq = window.matchMedia('(max-width: 767px), (max-aspect-ratio: 9/10)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    if (reduce) return () => mq.removeEventListener('change', on);
    const intro = document.documentElement.dataset.lpIntro === 'quick' ? INTRO_MS.quick : INTRO_MS.full;
    const wait = Math.max(0, intro - performance.now());
    let idle = 0;
    const timer = window.setTimeout(() => {
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
      idle = ric(() => setLoad3d(supportsWebGL()));
    }, wait);
    return () => {
      mq.removeEventListener('change', on);
      window.clearTimeout(timer);
      window.cancelIdleCallback?.(idle);
    };
  }, [reduce]);

  // the recording: load it after first paint; play while the hero is on screen
  useEffect(() => {
    const v = video.current;
    if (!v || !rec) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(Boolean(e?.isIntersecting)), { threshold: 0 });
    if (section.current) io.observe(section.current);
    return () => io.disconnect();
  }, [rec]);
  useEffect(() => {
    const v = video.current;
    if (!v || !rec) return;
    const shouldPlay = onScreen && (want ?? (!reduce && !slowConnection()));
    if (!shouldPlay) {
      v.pause();
      return;
    }
    // first time: fetch the recording only once the page is idle, so it never delays first paint
    const start = () => v.play().catch(() => setPlaying(false));
    if (v.src) {
      start();
      return;
    }
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const id = ric(() => {
      v.src = rec.src;
      start();
    });
    return () => window.cancelIdleCallback?.(id);
  }, [onScreen, want, reduce, rec]);

  // scroll: the HTML phone follows the same path as the 3D one (in case 3D is late or missing)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (reduce || !pose.current) return;
    pose.current.style.transform = poseToCss(poseAt(p, narrow, window.innerWidth / window.innerHeight));
  });
  const copyOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.2], [0, -80]);
  const leadOpacity = useTransform(scrollYProgress, [0.6, 0.76], [0, 1]);
  const leadY = useTransform(scrollYProgress, [0.6, 0.8], [40, 0]);
  const still = Boolean(reduce);

  const words = segment(title, lang);
  const playLabel = playing ? labels.pause : labels.play;

  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className="lp-hero relative -mt-14"
      style={
        {
          '--lp-hero-f': PERSPECTIVE_CSS,
          '--lp-rest-wide': REST_CSS.wide,
          '--lp-rest-narrow': REST_CSS.narrow,
          '--lp-phone-h': `${PHONE_SVH}svh`,
        } as CSSProperties
      }
    >
      <div className="lp-hero-pin">
        {/* the stage: spotlight, HTML phone, 3D phone */}
        <div className="lp-hero-stage" aria-hidden="true">
          <div ref={pose} className="lp-hero-pose">
            <div className="lp-hero-intro">
              <div className="lp-hero-light" />
              <div className={cn('lp-phone', ready3d && 'lp-phone-handed-off')}>
                <div className="lp-phone-glass" />
                <div className="lp-phone-screen">
                  {rec ? (
                    <video
                      id={VIDEO_ID}
                      ref={video}
                      poster={poster}
                      muted
                      loop
                      playsInline
                      preload="none"
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                    />
                  ) : (
                    poster && (
                      // biome-ignore lint/performance/noImgElement: the screen of the static phone; sized by CSS
                      <img src={poster} alt="" fetchPriority="high" />
                    )
                  )}
                </div>
                <span className="lp-phone-hole" />
              </div>
            </div>
          </div>
          {load3d && (
            <div className={cn('lp-hero-canvas', ready3d && 'is-ready')}>
              <PhoneScene
                progress={scrollYProgress}
                beads={beads}
                tone={tone}
                narrow={narrow}
                running={onScreen}
                videoId={VIDEO_ID}
                poster={poster}
                onReady={() => setReady3d(true)}
              />
            </div>
          )}
        </div>

        {/* headline and actions */}
        <motion.div className="lp-hero-copy" style={still ? { opacity: 1, y: 0 } : { opacity: copyOpacity, y: copyY }}>
          <p className="lp-hero-kicker">PKU Harness</p>
          <h1 id="hero-title" aria-label={title} className="lp-hero-title">
            {words.map((w, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed headline split once; position is the identity
              <Fragment key={i}>
                {w === ' ' ? (
                  ' '
                ) : (
                  <span aria-hidden="true" className="lp-cut" style={{ '--i': i } as CSSProperties}>
                    <span>{w}</span>
                  </span>
                )}
              </Fragment>
            ))}
          </h1>
          <div className="lp-hero-actions">
            <Link href={download.href} className="lp-pill lp-pill-primary">
              {download.label}
            </Link>
            <Link href={docs.href} className="lp-pill lp-pill-secondary">
              {docs.label}
            </Link>
            <a href={source.href} className="lp-text-link max-sm:hidden">
              {source.label}
              <ChevronRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          <ul className="lp-hero-meta">
            {meta.map((x) =>
              !x ? null : typeof x === 'string' ? (
                <li key={x}>{x}</li>
              ) : (
                <li key={x.href}>
                  <a
                    href={x.href}
                    className="hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-fd-ring"
                  >
                    {x.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </motion.div>

        {/* what the app is, beside the phone at the end of the sequence */}
        <motion.p className="lp-hero-lead" style={still ? { opacity: 1, y: 0 } : { opacity: leadOpacity, y: leadY }}>
          {lead}
        </motion.p>

        {rec && (
          <button
            type="button"
            onClick={() => setWant(!playing)}
            aria-label={playLabel}
            title={playLabel}
            className="lp-hero-play"
          >
            {playing ? (
              <Pause className="size-3.5" aria-hidden="true" />
            ) : (
              <Play className="size-3.5 translate-x-px" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </section>
  );
}

/** Words for the headline reveal; Chinese is split into characters, Latin words stay whole. */
function segment(text: string, lang: Lang): string[] {
  const out: string[] = [];
  text.split(' ').forEach((word, i) => {
    if (i > 0) out.push(' ');
    if (lang === 'zh' && /[㐀-鿿]/.test(word)) out.push(...(word.match(/[㐀-鿿]|[^㐀-鿿]+/g) ?? [word]));
    else out.push(word);
  });
  return out;
}

/** Data saver or a slow connection: keep the poster still; the visitor can press play. */
function slowConnection() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(c?.saveData || (c?.effectiveType && /(^|-)(2g|3g)$/.test(c.effectiveType)));
}

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
