import { FileCheck2, KeyRound, ScanEye, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import { orbitD, orbitPoint } from '@/components/brand/logo';
import { MagicCard } from '@/components/ui/magic-card';
import { Section, SectionHeading } from './bits';

const POINTS = [
  {
    icon: KeyRound,
    title: '凭据只存在本机',
    body: '学号、密码和令牌密钥放在系统安全存储里。插件拿不到密码，只拿到 App 替它登录好的、按服务划分的会话。',
  },
  {
    icon: Sparkles,
    title: '模型自己选，Key 自己带',
    body: '默认 DeepSeek，也可以接任何 OpenAI 兼容的服务。对话直接从手机发给你选的服务商，Key 不经过我们。',
  },
  {
    icon: SlidersHorizontal,
    title: '按效果授权',
    body: '每个插件的「读取、修改、花钱、公开」分开设置：允许、先问我、禁止。定时任务在后台只能读取，不能替你做决定。',
  },
  {
    icon: ScanEye,
    title: '校园内容只当数据',
    body: '树洞帖子、通知这类外部文字作为数据交给模型，不会被当成指令。读过这类内容之后写入的记忆，要你确认才保存。',
  },
  {
    icon: FileCheck2,
    title: '签名的更新',
    body: 'App 的热更新由维护者私钥签名、从公开提交构建，App 拒绝任何未签名或签错的包。更新服务器上没有私钥，也不运行任何程序。',
  },
  {
    icon: ShieldCheck,
    title: '全部开源',
    body: 'App、插件和这个网站都以 MIT 协议开源。你可以读每一行代码，也可以自己编译。',
  },
];

export function Trust() {
  return (
    <Section labelledBy="trust-title" className="py-24 md:py-32">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <SectionHeading id="trust-title" title="你的密码不离开手机" en="Credentials and data stay on the phone.">
            没有一台我们的服务器能看到你的北大账号。App 在手机上登录、在手机上调用学校服务，你只需要信任你能读到的代码。
          </SectionHeading>
          <TrustIllustration />
        </div>
        <MagicCard className="lp-glass rounded-[20px]">
          <ul className="divide-y divide-fd-border">
            {POINTS.map((p) => (
              <li key={p.title} className="flex gap-4 px-6 py-5">
                <p.icon className="mt-0.5 size-5 shrink-0 text-fd-primary" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-fd-muted-foreground text-sm leading-[1.75]">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </MagicCard>
      </div>
    </Section>
  );
}

/** Phone ↔ campus (direct), phone ↔ your model provider, and no line to "our server". */
const bead = orbitPoint(-38);

function TrustIllustration() {
  const ink = 'var(--color-fd-foreground)';
  return (
    <svg
      viewBox="0 0 520 300"
      className="mt-10 w-full max-w-[560px]"
      role="img"
      aria-label="示意图：手机直接连接学校服务和你选择的模型服务，与我们的服务器之间没有连接。"
    >
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
        直连，不经代理
      </text>
      <text x="246" y="184" fontSize="11" fill={ink} fillOpacity="0.5" textAnchor="middle">
        对话，用你的 Key
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
        安全存储
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
        学校服务
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
        你选的模型服务
      </text>
      <text x="370" y="163" fontSize="10.5" fill={ink} fillOpacity="0.5">
        DeepSeek / OpenAI 兼容
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
        我们的服务器
      </text>
      <text x="370" y="255" fontSize="10.5" fill={ink} fillOpacity="0.4">
        看不到你的账号
      </text>
      <path d="M160 228 L 330 242" stroke={ink} strokeOpacity="0.14" strokeWidth="1.5" strokeDasharray="2 5" />
      <g transform="translate(244 235)">
        <circle r="10" fill="var(--color-fd-background)" stroke={ink} strokeOpacity="0.3" />
        <path d="M-4 -4 L4 4 M4 -4 L-4 4" stroke={ink} strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}
