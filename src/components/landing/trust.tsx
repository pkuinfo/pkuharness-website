import { FileCheck2, KeyRound, ScanEye, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import { orbitD, orbitPoint } from '@/components/brand/logo';
import type { Lang } from '@/lib/i18n';
import { t } from '@/lib/messages';
import { Section, SectionHeading } from './bits';

const ICONS = [KeyRound, Sparkles, SlidersHorizontal, ScanEye, FileCheck2, ShieldCheck];

export function Trust({ lang }: { lang: Lang }) {
  const m = t(lang).home.trust;
  return (
    <Section labelledBy="trust-title" className="py-16 md:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <SectionHeading id="trust-title" title={m.title}>
          <p>{m.lead}</p>
        </SectionHeading>
        <TrustIllustration labels={m.diagram} />
      </div>
      <ul className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {m.points.map((p, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <li key={p.title} className="border-fd-border border-t py-6">
              <Icon className="size-5 text-fd-primary" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-lg">{p.title}</h3>
              <p className="mt-2 text-pretty text-fd-muted-foreground leading-[1.75]">{p.body}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/** Phone ↔ campus (direct), phone ↔ your model provider, and no line to "our server". */
const bead = orbitPoint(-38);

function TrustIllustration({ labels }: { labels: ReturnType<typeof t>['home']['trust']['diagram'] }) {
  const ink = 'var(--color-fd-foreground)';
  return (
    <svg viewBox="0 0 520 300" className="mx-auto w-full max-w-[560px]" role="img" aria-label={labels.label}>
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

      {/* connections */}
      <path d="M150 112 C 240 112, 270 58, 352 58" fill="none" stroke={ink} strokeOpacity="0.12" strokeWidth="1.5" />
      <path
        d="M150 112 C 240 112, 270 58, 352 58"
        fill="none"
        stroke="url(#trust-flow)"
        strokeWidth="2"
        strokeLinecap="round"
        className="lp-flow"
      />
      <path d="M150 160 C 250 160, 260 150, 352 150" fill="none" stroke={ink} strokeOpacity="0.12" strokeWidth="1.5" />
      <path
        d="M150 160 C 250 160, 260 150, 352 150"
        fill="none"
        stroke="url(#trust-flow)"
        strokeWidth="2"
        strokeLinecap="round"
        className="lp-flow [animation-delay:-1.2s]"
      />
      <text x="246" y="114" fontSize="11" fill={ink} fillOpacity="0.5" textAnchor="middle">
        {labels.direct}
      </text>
      <text x="246" y="184" fontSize="11" fill={ink} fillOpacity="0.5" textAnchor="middle">
        {labels.chat}
      </text>

      {/* phone */}
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
      {/* vault */}
      <rect x="66" y="150" width="62" height="58" rx="12" fill="#8b0012" />
      <path d="M85 172 v-6 a12 12 0 0 1 24 0 v6" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
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

      {/* campus */}
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
      {/* model */}
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
      {/* our server: not connected */}
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
      <path d="M160 228 L 330 242" stroke={ink} strokeOpacity="0.14" strokeWidth="1.5" strokeDasharray="2 5" />
      <g transform="translate(244 235)">
        <circle r="10" fill="var(--color-fd-background)" stroke={ink} strokeOpacity="0.3" />
        <path d="M-4 -4 L4 4 M4 -4 L-4 4" stroke={ink} strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}
