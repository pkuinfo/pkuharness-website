import { Markdown } from 'fumadocs-core/content/md';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import {
  Apple,
  ArrowDownToLine,
  ArrowUpRight,
  BellRing,
  FileCheck2,
  KeyRound,
  Network,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import type { CSSProperties } from 'react';
import { formatBytes, formatDate, pickLatest, type Release, type ReleasesResult } from '@/lib/releases';
import { github, repos } from '@/lib/shared';
import { GitHubIcon } from '../bits';
import { CopyButton } from './copy-button';

const RELEASES_URL = `${github(repos.app)}/releases`;

export async function DownloadView({ data }: { data: ReleasesResult }) {
  const latest = pickLatest(data.releases);
  const older = latest ? data.releases.filter((r) => r !== latest && r.apks.length > 0) : [];
  return (
    <div className="flex flex-col">
      <header className="relative isolate -mt-14 overflow-hidden pt-14">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(50%_70%_at_80%_0%,rgba(196,34,54,0.14),transparent_70%),radial-gradient(40%_60%_at_0%_30%,rgba(71,92,135,0.12),transparent_70%)] dark:bg-[radial-gradient(50%_70%_at_80%_0%,rgba(139,0,18,0.5),transparent_70%),radial-gradient(40%_60%_at_0%_30%,rgba(14,52,99,0.45),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-fd-background"
        />
        <div className="mx-auto w-full max-w-[1200px] px-5 pt-14 pb-10 md:px-8 md:pt-20">
          <h1 className="lp-rise font-bold text-4xl tracking-[-0.03em] md:text-6xl">下载 PKU Harness</h1>
          <p
            className="lp-rise mt-3 font-medium text-fd-muted-foreground text-lg md:text-xl"
            style={{ '--lp-delay': '0.08s' } as CSSProperties}
          >
            Get the app for Android. Free and open source.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] space-y-16 px-5 pb-24 md:px-8">
        {latest ? <LatestRelease release={latest} /> : <ComingSoon unreachable={Boolean(data.error)} />}
        <Requirements />
        {latest?.body.trim() && (
          <section aria-labelledby="notes-title">
            <h2 id="notes-title" className="font-semibold text-2xl tracking-[-0.02em]">
              更新说明
              <span className="ms-3 font-normal text-base text-fd-muted-foreground">Release notes</span>
            </h2>
            <div className="lp-glass lp-prose mt-6 rounded-[20px] p-6 md:p-8">
              <Markdown remarkPlugins={[remarkGfm]}>{latest.body}</Markdown>
            </div>
          </section>
        )}
        {older.length > 0 && <OlderReleases releases={older} />}
        {!latest && <BuildFromSource />}
      </div>
    </div>
  );
}

async function LatestRelease({ release }: { release: Release }) {
  const primary = release.apks[0];
  const qr = await QRCode.toString(primary.url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#0b0b0d', light: '#ffffff00' },
  });
  return (
    <section aria-labelledby="latest-title" className="grid gap-5 md:grid-cols-[1fr_auto]">
      <div className="lp-glass rounded-[20px] p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 id="latest-title" className="font-bold font-mono text-4xl tabular-nums tracking-[-0.03em]">
            {release.tag}
          </h2>
          <span
            className={
              release.prerelease
                ? 'rounded-[6px] bg-pku-amber/15 px-2 py-0.5 font-medium text-[#a86b0c] text-xs dark:text-pku-amber'
                : 'rounded-[6px] bg-(--color-up)/12 px-2 py-0.5 font-medium text-[#15803d] text-xs dark:text-[#4ade80]'
            }
          >
            {release.prerelease ? '预览版' : '最新版'}
          </span>
        </div>
        <p className="mt-2 text-fd-muted-foreground text-sm">
          {release.name !== release.tag && `${release.name}，`}发布于 {formatDate(release.publishedAt)}
        </p>

        <ul className="mt-7 space-y-4">
          {release.apks.map((a, i) => (
            <li key={a.url}>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={a.url}
                  className={
                    i === 0
                      ? 'inline-flex h-12 items-center gap-2 rounded-[10px] bg-brand px-5 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(139,0,18,0.8),inset_0_1px_0_rgba(255,255,255,0.18)] transition-[transform,background-color] duration-150 hover:bg-[#9e0016] focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2 active:scale-[0.97]'
                      : 'lp-glass inline-flex h-11 items-center gap-2 rounded-[10px] px-4 font-medium transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-fd-ring active:scale-[0.97]'
                  }
                >
                  <ArrowDownToLine className="size-[18px]" aria-hidden="true" />
                  下载 APK
                </a>
                <span className="text-fd-muted-foreground text-sm">
                  <span className="font-mono text-fd-foreground">{a.name}</span>
                  <span className="ms-2 tabular-nums">{formatBytes(a.size)}</span>
                </span>
              </div>
              {a.sha256 ? (
                <div className="mt-3 flex max-w-full items-center gap-2 rounded-[10px] bg-fd-foreground/[0.04] py-1 ps-3 pe-1">
                  <span className="shrink-0 text-fd-muted-foreground text-xs">SHA-256</span>
                  <code className="min-w-0 flex-1 truncate font-mono text-xs" title={a.sha256}>
                    {a.sha256}
                  </code>
                  <CopyButton text={a.sha256} label="复制 SHA-256" />
                </div>
              ) : (
                <p className="mt-3 text-fd-muted-foreground text-xs">这个安装包的发布说明里没有提供校验值。</p>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-7 text-fd-muted-foreground text-sm leading-[1.75]">
          安装时 Android 会请你允许浏览器安装应用。只安装来自本页或 GitHub 发布页的包；可以用{' '}
          <code className="rounded-[6px] bg-fd-foreground/[0.06] px-1.5 py-0.5 font-mono text-[12px]">sha256sum</code>{' '}
          核对文件。
        </p>
        <a
          href={release.htmlUrl}
          className="mt-4 inline-flex items-center gap-1.5 font-medium text-fd-primary text-sm underline-offset-4 hover:underline"
        >
          在 GitHub 上查看这个版本
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>

      <figure className="lp-glass flex flex-col items-center justify-center rounded-[20px] p-6 md:w-[260px]">
        <div
          className="size-[180px] rounded-[16px] bg-white p-3.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)] [&_svg]:size-full"
          role="img"
          aria-label={`下载 ${primary.name} 的二维码`}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG generated on the server by `qrcode` from a GitHub URL
          dangerouslySetInnerHTML={{ __html: qr }}
        />
        <figcaption className="mt-4 text-center text-fd-muted-foreground text-sm">
          用手机扫码下载
          <span className="block text-xs">Scan with your phone</span>
        </figcaption>
      </figure>
    </section>
  );
}

function ComingSoon({ unreachable }: { unreachable: boolean }) {
  return (
    <section aria-labelledby="soon-title" className="lp-glass relative overflow-hidden rounded-[20px] p-6 md:p-10">
      <div className="flex items-center gap-2.5 text-sm">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-pku-amber opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-pku-amber" />
        </span>
        <span className="font-medium">{unreachable ? '暂时读不到发布信息' : '准备中'}</span>
      </div>
      <h2 id="soon-title" className="mt-5 max-w-2xl font-bold text-3xl tracking-[-0.03em] [word-break:keep-all] md:text-4xl">
        首个公开安装包即将发布
      </h2>
      <p className="mt-3 font-medium text-fd-muted-foreground text-lg">The first public APK is on its way.</p>
      <p className="mt-5 max-w-2xl text-fd-muted-foreground leading-[1.8]">
        {unreachable
          ? '这一页从 GitHub 读取最新版本，刚才没有读到。可以直接去发布页看看，或者按下面的步骤从源码构建。'
          : '发布后，安装包、校验值和扫码下载会出现在这里。在那之前，你可以从源码构建，装到自己的手机或模拟器上。'}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={RELEASES_URL}
          className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-brand px-5 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(139,0,18,0.8),inset_0_1px_0_rgba(255,255,255,0.18)] transition-[transform,background-color] duration-150 hover:bg-[#9e0016] focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2 active:scale-[0.97]"
        >
          <GitHubIcon className="size-[18px]" />
          关注 GitHub 发布
        </a>
        <a
          href="#build"
          className="lp-glass inline-flex h-12 items-center gap-2 rounded-[10px] px-5 font-medium transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2 active:scale-[0.97]"
        >
          从源码构建
        </a>
      </div>
    </section>
  );
}

const REQUIREMENTS = [
  { icon: Smartphone, title: 'Android 7.0 或更高', body: 'API 24 起。iOS 版计划中，还需要把校园网络模块移植到 iOS。' },
  { icon: KeyRound, title: '北大账号', body: '统一身份认证的学号和密码，只保存在手机的安全存储里。' },
  { icon: Sparkles, title: '一个模型 Key', body: '默认 DeepSeek，也可以填任何 OpenAI 兼容服务的地址和 Key。' },
  { icon: Network, title: '部分服务需要校园网', body: '比如财务门户只能在校园网内访问；App 直接连接，不走代理。' },
];

function Requirements() {
  return (
    <section aria-labelledby="req-title" className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      <div>
        <h2 id="req-title" className="font-semibold text-2xl tracking-[-0.02em]">
          你需要
          <span className="ms-3 font-normal text-base text-fd-muted-foreground">Requirements</span>
        </h2>
        <dl className="mt-6 grid gap-x-6 gap-y-6 sm:grid-cols-2">
          {REQUIREMENTS.map((r) => (
            <div key={r.title}>
              <dt className="flex items-center gap-2 font-medium">
                <r.icon className="size-4 text-fd-primary" aria-hidden="true" />
                {r.title}
              </dt>
              <dd className="mt-1.5 text-fd-muted-foreground text-sm leading-[1.75]">{r.body}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h2 className="font-semibold text-2xl tracking-[-0.02em]">
          更新
          <span className="ms-3 font-normal text-base text-fd-muted-foreground">Updates</span>
        </h2>
        <ul className="mt-6 space-y-5">
          <li className="flex gap-3">
            <FileCheck2 className="mt-0.5 size-4 shrink-0 text-fd-primary" aria-hidden="true" />
            <p className="text-fd-muted-foreground text-sm leading-[1.75]">
              <span className="font-medium text-fd-foreground">签名的热更新（建设中）。</span>
              界面和插件的更新将从我们自己的服务器推送，由 CI 从公开提交构建、用维护者私钥签名；App
              只接受签名正确的更新，拒绝其他一切。
            </p>
          </li>
          <li className="flex gap-3">
            <BellRing className="mt-0.5 size-4 shrink-0 text-fd-primary" aria-hidden="true" />
            <p className="text-fd-muted-foreground text-sm leading-[1.75]">
              <span className="font-medium text-fd-foreground">原生改动发新安装包。</span>
              新权限、新的系统能力需要重新下载 APK，会在这一页和 GitHub 发布页出现。
            </p>
          </li>
          <li className="flex gap-3">
            <Apple className="mt-0.5 size-4 shrink-0 text-fd-primary" aria-hidden="true" />
            <p className="text-fd-muted-foreground text-sm leading-[1.75]">
              <span className="font-medium text-fd-foreground">iOS 计划中。</span>
              App 已经能在 iOS 上启动，校园登录要等网络模块移植完成。
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}

function OlderReleases({ releases }: { releases: Release[] }) {
  return (
    <section aria-labelledby="older-title">
      <h2 id="older-title" className="font-semibold text-2xl tracking-[-0.02em]">
        历史版本
        <span className="ms-3 font-normal text-base text-fd-muted-foreground">Previous releases</span>
      </h2>
      <ul className="mt-6 divide-y divide-fd-border border-fd-border border-y">
        {releases.map((r) => (
          <li key={r.tag} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4">
            <a href={r.htmlUrl} className="w-24 font-medium font-mono tabular-nums hover:text-fd-primary">
              {r.tag}
            </a>
            <span className="w-36 text-fd-muted-foreground text-sm">{formatDate(r.publishedAt)}</span>
            {r.prerelease && <span className="text-fd-muted-foreground text-xs">预览版</span>}
            <span className="ms-auto flex flex-wrap gap-3">
              {r.apks.map((a) => (
                <a
                  key={a.url}
                  href={a.url}
                  className="inline-flex items-center gap-1.5 text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground"
                >
                  <ArrowDownToLine className="size-3.5" aria-hidden="true" />
                  {a.name}
                  <span className="tabular-nums">{formatBytes(a.size)}</span>
                </a>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const STEPS: { title: string; body: string; cmd?: string }[] = [
  {
    title: '准备环境',
    body: '安装 Bun、JDK 17 和 Android SDK，准备一台打开了 USB 调试的手机，或者一个 Android 模拟器。',
  },
  {
    title: '克隆仓库（含插件子模块）',
    body: '插件在 plugins/ 子模块里，所以要带上 --recurse-submodules。',
    cmd: 'git clone --recurse-submodules \\\n  https://github.com/pkuinfo/pku-harness.git\ncd pku-harness',
  },
  { title: '安装依赖', body: '项目统一用 Bun。', cmd: 'bun install' },
  {
    title: '构建并安装到设备',
    body: '即 expo run:android。第一次构建要几分钟，之后改 JS 会热更新。',
    cmd: 'bun run android',
  },
];

function BuildFromSource() {
  return (
    <section id="build" aria-labelledby="build-title" className="scroll-mt-20">
      <h2 id="build-title" className="font-semibold text-2xl tracking-[-0.02em]">
        从源码构建
        <span className="ms-3 font-normal text-base text-fd-muted-foreground">Build from source</span>
      </h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {STEPS.map((s, i) => (
          <li key={s.title} className="lp-glass min-w-0 rounded-[16px] p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-fd-primary text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-semibold">{s.title}</h3>
            </div>
            <p className="mt-2 text-fd-muted-foreground text-sm leading-[1.75]">{s.body}</p>
            {s.cmd && (
              <div className="mt-3 flex items-start gap-2 rounded-[10px] bg-fd-foreground/[0.05] py-2 ps-3 pe-1">
                <pre className="min-w-0 flex-1 overflow-x-auto py-1 font-mono text-[12.5px] leading-relaxed">
                  <code>{s.cmd}</code>
                </pre>
                <CopyButton text={s.cmd} label="复制命令" />
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-5 text-fd-muted-foreground text-sm leading-[1.75]">
        如果电脑开着系统代理（Clash 等），启动模拟器时不要继承 <code className="font-mono">HTTP_PROXY</code>
        ，否则 App 连不上校园服务。更多细节见{' '}
        <a href={`${github(repos.app)}#readme`} className="text-fd-primary underline-offset-4 hover:underline">
          README
        </a>{' '}
        和{' '}
        <Link href="/docs/getting-started/install" className="text-fd-primary underline-offset-4 hover:underline">
          安装文档
        </Link>
        。
      </p>
    </section>
  );
}
