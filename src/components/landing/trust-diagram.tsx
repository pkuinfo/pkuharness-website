'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { orbitD, orbitPoint } from '@/components/brand/logo';
import { useReducedMotionAfterMount } from '@/components/ui/use-reduced-motion-after-mount';

export interface TrustDiagramLabels {
  label: string;
  direct: string;
  chat: string;
  vault: string;
  campus: string;
  model: string;
  modelSub: string;
  ours: string;
  oursSub: string;
}

const bead = orbitPoint(-38);
const EASE = [0.23, 1, 0.32, 1] as const;

const CAMPUS = 'M150 112 C 240 112, 270 58, 352 58';
const MODEL = 'M150 160 C 250 160, 260 150, 352 150';
const OURS = 'M160 228 C 200 231, 214 233, 234 234';

/**
 * Phone ↔ campus (direct), phone ↔ your model provider, and no line to "our server", told once
 * when the diagram scrolls into view: the phone appears, the vault's shackle closes, the two
 * real connections draw out to their services and start carrying light, and the third line
 * stops short at a cross before it reaches our server. The light along the lines is the
 * gradient-dash technique of 21st.dev: dillionverma/animated-beam (Magic UI), done in SVG/CSS.
 * Under reduced motion the finished diagram is shown as is.
 */
export function TrustDiagram({ labels }: { labels: TrustDiagramLabels }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduce = useReducedMotionAfterMount();
  const play = inView || Boolean(reduce);
  const t = (delay: number, duration = 0.8) => (reduce ? { duration: 0 } : { delay, duration, ease: EASE });
  const ink = 'var(--color-fd-foreground)';

  const draw = (delay: number, duration = 0.9) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: play ? { pathLength: 1, opacity: 1 } : undefined,
    transition: t(delay, duration),
  });
  const appear = (delay: number, x = 0) => ({
    initial: { opacity: 0, x },
    animate: play ? { opacity: 1, x: 0 } : undefined,
    transition: t(delay, 0.7),
  });

  return (
    <svg ref={ref} viewBox="0 0 520 300" className="mx-auto w-full max-w-[560px]" role="img" aria-label={labels.label}>
      <defs>
        <linearGradient id="trust-flow" x1="0" x2="1">
          <stop offset="0" stopColor="#ff5a6a" />
          <stop offset="1" stopColor="#efaa3c" />
        </linearGradient>
        <radialGradient id="trust-glow">
          <stop offset="0" stopColor="#c42236" stopOpacity="0.35" />
          <stop offset="1" stopColor="#c42236" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* connections: rails draw out, then light travels along them */}
      <motion.path d={CAMPUS} fill="none" stroke={ink} strokeOpacity="0.16" strokeWidth="1.5" {...draw(0.55)} />
      <motion.path d={MODEL} fill="none" stroke={ink} strokeOpacity="0.16" strokeWidth="1.5" {...draw(0.75)} />
      <motion.g initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : undefined} transition={t(1.4, 0.6)}>
        <path
          d={CAMPUS}
          fill="none"
          stroke="url(#trust-flow)"
          strokeWidth="2"
          strokeLinecap="round"
          className="lp-flow"
        />
        <path
          d={MODEL}
          fill="none"
          stroke="url(#trust-flow)"
          strokeWidth="2"
          strokeLinecap="round"
          className="lp-flow [animation-delay:-1.2s]"
        />
        <circle r="3" fill="#ff5a6a" className="lp-endpoint" cx="352" cy="58" />
        <circle r="3" fill="#efaa3c" className="lp-endpoint [animation-delay:-1.2s]" cx="352" cy="150" />
      </motion.g>
      <motion.text x="246" y="114" fontSize="11" fill={ink} fillOpacity="0.55" textAnchor="middle" {...appear(1.1)}>
        {labels.direct}
      </motion.text>
      <motion.text x="246" y="184" fontSize="11" fill={ink} fillOpacity="0.55" textAnchor="middle" {...appear(1.25)}>
        {labels.chat}
      </motion.text>

      {/* phone */}
      <motion.g {...appear(0)}>
        <circle cx="96" cy="140" r="96" fill="url(#trust-glow)" />
        <rect
          x="44"
          y="34"
          width="106"
          height="212"
          rx="22"
          fill={ink}
          fillOpacity="0.04"
          stroke={ink}
          strokeOpacity="0.28"
          strokeWidth="1.5"
        />
        <rect x="84" y="44" width="26" height="5" rx="2.5" fill={ink} fillOpacity="0.25" />
        {/* vault: the shackle drops shut */}
        <rect x="66" y="150" width="62" height="58" rx="12" fill="#8b0012" />
        <motion.path
          d="M85 172 v-6 a12 12 0 0 1 24 0 v6"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ y: -7 }}
          animate={play ? { y: 0 } : undefined}
          transition={reduce ? { duration: 0 } : { delay: 0.35, type: 'spring', stiffness: 520, damping: 18 }}
        />
        <rect x="80" y="170" width="34" height="26" rx="6" fill="#fff" />
        <circle cx="97" cy="182" r="3.2" fill="#8b0012" />
        <rect x="95.6" y="183" width="2.8" height="7" rx="1.2" fill="#8b0012" />
        {/* agent: mini mark */}
        <g transform="translate(70 78) scale(0.45)">
          <rect x="33" y="23.5" width="15" height="72" rx="4.5" fill={ink} fillOpacity="0.85" />
          <path d={orbitD} fill="none" stroke={ink} strokeOpacity="0.85" strokeWidth="13" />
          <circle cx={bead.x} cy={bead.y} r="8.5" fill="#ff5a6a" />
        </g>
        <text x="97" y="230" fontSize="10.5" fill={ink} fillOpacity="0.55" textAnchor="middle">
          {labels.vault}
        </text>
      </motion.g>

      {/* campus */}
      <motion.g {...appear(1.0, 12)}>
        <rect
          x="352"
          y="34"
          width="150"
          height="48"
          rx="12"
          fill={ink}
          fillOpacity="0.04"
          stroke={ink}
          strokeOpacity="0.2"
        />
        <text x="370" y="55" fontSize="13" fontWeight="600" fill={ink}>
          {labels.campus}
        </text>
        <text x="370" y="71" fontSize="10.5" fill={ink} fillOpacity="0.5" fontFamily="var(--font-mono)">
          *.pku.edu.cn
        </text>
      </motion.g>
      {/* model */}
      <motion.g {...appear(1.2, 12)}>
        <rect
          x="352"
          y="126"
          width="150"
          height="48"
          rx="12"
          fill={ink}
          fillOpacity="0.04"
          stroke={ink}
          strokeOpacity="0.2"
        />
        <text x="370" y="147" fontSize="13" fontWeight="600" fill={ink}>
          {labels.model}
        </text>
        <text x="370" y="163" fontSize="10.5" fill={ink} fillOpacity="0.5">
          {labels.modelSub}
        </text>
      </motion.g>

      {/* our server: the line starts, stops at a cross, never arrives */}
      <motion.g {...appear(1.5, 12)}>
        <rect
          x="352"
          y="218"
          width="150"
          height="48"
          rx="12"
          fill="none"
          stroke={ink}
          strokeOpacity="0.22"
          strokeDasharray="4 4"
        />
        <text x="370" y="239" fontSize="13" fontWeight="600" fill={ink} fillOpacity="0.45">
          {labels.ours}
        </text>
        <text x="370" y="255" fontSize="10.5" fill={ink} fillOpacity="0.4">
          {labels.oursSub}
        </text>
      </motion.g>
      <motion.path
        d={OURS}
        fill="none"
        stroke={ink}
        strokeOpacity="0.22"
        strokeWidth="1.5"
        strokeDasharray="2 5"
        {...draw(1.6, 0.7)}
      />
      <path d="M254 236 L 330 242" stroke={ink} strokeOpacity="0.07" strokeWidth="1.5" strokeDasharray="2 5" />
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={play ? { scale: 1, opacity: 1 } : undefined}
        transition={reduce ? { duration: 0 } : { delay: 2.15, type: 'spring', stiffness: 420, damping: 16 }}
        style={{ transformOrigin: '244px 235px', transformBox: 'view-box' }}
      >
        <circle cx="244" cy="235" r="10" fill="var(--color-fd-background)" stroke={ink} strokeOpacity="0.35" />
        <path
          d="M240 231 L248 239 M248 231 L240 239"
          stroke="var(--color-brand-fg)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  );
}
