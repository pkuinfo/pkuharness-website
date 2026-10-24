'use client';

import { Pause, Play } from 'lucide-react';
import { useInView, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { DeviceFrame } from '@/components/ui/device-frame';
import { cn } from '@/lib/cn';
import type { ShowcaseMedia } from './media';

export interface MediaPair {
  dark: ShowcaseMedia;
  light?: ShowcaseMedia;
}

interface Props {
  media: MediaPair;
  /** `sizes` for the screen image, e.g. `(min-width: 1024px) 320px, 70vw`. */
  sizes: string;
  labels: { play: string; pause: string };
  caption?: boolean;
  /** Ambient light behind the device, sampled from the capture (YouTube-style ambient mode). */
  glow?: boolean;
  /** Above the fold: fetch the screen image early. */
  eager?: boolean;
  className?: string;
  frameClassName?: string;
}

/**
 * One real capture in a device frame, with its caption. Stills use `next/image` (a light-theme
 * capture swaps in on the light page when there is one). Recordings are muted, looping, inline
 * videos that only load near the viewport, play while at least a third is visible, pause when
 * scrolled away, never autoplay with reduced motion, and always have a play/pause button.
 */
export function DeviceMedia({
  media,
  sizes,
  labels,
  caption = true,
  glow = false,
  eager,
  className,
  frameClassName,
}: Props) {
  const { dark, light } = media;
  const isVideo = dark.kind === 'video';
  return (
    <figure className={cn('relative', className)}>
      {isVideo ? (
        <VideoDevice media={dark} labels={labels} glow={glow} frameClassName={frameClassName} />
      ) : (
        <div className="relative isolate">
          {glow && <StillGlow dark={dark} light={light} />}
          <DeviceFrame className={frameClassName}>
            <Image
              src={dark.src}
              width={dark.width}
              height={dark.height}
              sizes={sizes}
              alt={dark.caption}
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={eager ? 'high' : undefined}
              className={cn('absolute inset-0 size-full object-cover', light && 'dark:block hidden')}
            />
            {light && (
              <Image
                src={light.src}
                width={light.width}
                height={light.height}
                sizes={sizes}
                alt={light.caption}
                loading="lazy"
                className="absolute inset-0 size-full object-cover dark:hidden"
              />
            )}
          </DeviceFrame>
        </div>
      )}
      {caption && !isVideo && dark.caption && (
        <figcaption className="mt-5 text-pretty text-center text-fd-muted-foreground text-sm leading-relaxed">
          {dark.caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Blurred, enlarged copy of the capture behind the frame: the screen's own light. */
function StillGlow({ dark, light: lightMedia }: { dark: ShowcaseMedia; light?: ShowcaseMedia }) {
  const cls =
    'pointer-events-none absolute inset-[4%_-8%] -z-10 h-[92%] w-[116%] scale-110 object-cover opacity-60 blur-[56px] saturate-150 dark:opacity-70';
  return (
    <div aria-hidden="true">
      <Image
        src={dark.src}
        width={64}
        height={142}
        sizes="64px"
        alt=""
        className={cn(cls, lightMedia && 'hidden dark:block')}
      />
      {lightMedia && (
        <Image src={lightMedia.src} width={64} height={142} sizes="64px" alt="" className={cn(cls, 'dark:hidden')} />
      )}
    </div>
  );
}

function VideoDevice({
  media,
  labels,
  glow,
  frameClassName,
}: {
  media: ShowcaseMedia;
  labels: Props['labels'];
  glow: boolean;
  frameClassName?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const near = useInView(wrapRef, { margin: '400px 0px', once: true });
  const visible = useInView(wrapRef, { amount: 0.35 });
  const [want, setWant] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const shouldPlay = near && visible && (want ?? !reduce);

  const poster = media.poster;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (shouldPlay) v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [shouldPlay]);

  // Ambient light (adapted from 21st.dev: unlumen/video-ambient): paint the current frame into a
  // tiny canvas a few times a second, only while the video plays; CSS blur does the rest.
  useEffect(() => {
    if (!glow || !playing) return;
    const v = videoRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!v || !ctx) return;
    const paint = () => {
      try {
        ctx.drawImage(v, 0, 0, 24, 54);
      } catch {
        // not decodable yet
      }
    };
    paint();
    const id = window.setInterval(paint, 125);
    return () => window.clearInterval(id);
  }, [glow, playing]);

  const label = playing ? labels.pause : labels.play;
  return (
    <>
      <div ref={wrapRef} className="relative isolate">
        {glow && (
          <div aria-hidden="true">
            {poster && (
              // biome-ignore lint/performance/noImgElement: tiny decorative backdrop under the canvas
              <img
                alt=""
                src={poster}
                className="pointer-events-none absolute inset-[4%_-8%] -z-10 h-[92%] w-[116%] scale-110 object-cover opacity-60 blur-[56px] saturate-150 dark:opacity-70"
              />
            )}
            <canvas
              ref={canvasRef}
              width={24}
              height={54}
              className={cn(
                'pointer-events-none absolute inset-[4%_-8%] -z-10 h-[92%] w-[116%] scale-110 opacity-0 blur-[56px] saturate-150 transition-opacity duration-700',
                playing && 'opacity-60 dark:opacity-70',
              )}
            />
          </div>
        )}
        <DeviceFrame className={frameClassName}>
          <video
            ref={videoRef}
            src={near ? media.src : undefined}
            poster={poster}
            muted
            loop
            playsInline
            preload="none"
            aria-label={media.caption}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="absolute inset-0 size-full object-cover"
          />
        </DeviceFrame>
      </div>
      <figcaption className="mt-5 flex items-start justify-center gap-3 text-fd-muted-foreground text-sm leading-relaxed">
        <button
          type="button"
          onClick={() => setWant(!playing)}
          aria-label={label}
          title={label}
          className="lp-glass grid size-8 shrink-0 place-items-center rounded-full text-fd-foreground transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2 active:scale-95"
        >
          {playing ? (
            <Pause className="size-3.5" aria-hidden="true" />
          ) : (
            <Play className="size-3.5 translate-x-px" aria-hidden="true" />
          )}
        </button>
        <span className="max-w-[34ch] text-pretty pt-1">{media.caption}</span>
      </figcaption>
    </>
  );
}
