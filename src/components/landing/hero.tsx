import { ArrowDownToLine, BookOpen, KeyRound, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { github, repos } from '@/lib/shared';
import { GitHubIcon } from './bits';
import { HeroBackdrop } from './hero-backdrop';
import { HeroMark } from './hero-mark';
import { Reveal } from './reveal';

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate -mt-14 overflow-hidden pt-14">
      <HeroBackdrop />
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-6 px-5 pt-10 pb-20 md:px-8 md:pt-16 lg:min-h-[min(860px,100svh)] lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pb-28">
        <div className="order-2 lg:order-1">
          <Reveal>
            <h1
              id="hero-title"
              className="font-bold text-[2.75rem] leading-[1.12] tracking-[-0.035em] sm:text-6xl lg:text-[4.6rem]"
            >
              登录一次，
              <br />
              燕园交给 AI。
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 max-w-xl text-pretty font-medium text-fd-foreground/80 text-lg tracking-[-0.01em] md:text-xl">
              Log in once. An agent on your phone runs campus life through plugins.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-[34rem] text-pretty text-fd-muted-foreground leading-[1.8]">
              PKU Harness 是北大校园生活的 AI 原生 App。课表、校园卡、网费、树洞、教学网、财务、空间预约……
              每一项校园服务都是一个插件，跑在你手机上的助手替你查、替你记、替你提醒。开源，免费。
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/download"
                className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-brand px-5 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(139,0,18,0.8),inset_0_1px_0_rgba(255,255,255,0.18)] transition-[transform,background-color] duration-150 hover:bg-[#9e0016] focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2 active:scale-[0.97]"
              >
                <ArrowDownToLine className="size-[18px]" aria-hidden="true" />
                下载 Android 版
              </Link>
              <Link
                href="/docs"
                className="lp-glass inline-flex h-12 items-center gap-2 rounded-[10px] px-5 font-medium transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2 active:scale-[0.97]"
              >
                <BookOpen className="size-[18px]" aria-hidden="true" />
                阅读文档
              </Link>
              <a
                href={github(repos.app)}
                className="inline-flex h-12 items-center gap-2 rounded-[10px] px-3 font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-fd-ring"
              >
                <GitHubIcon className="size-[18px]" />
                源代码
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-fd-muted-foreground text-sm">
              <li className="inline-flex items-center gap-2">
                <KeyRound className="size-4 text-fd-primary" aria-hidden="true" />
                密码只存在手机里
              </li>
              <li className="inline-flex items-center gap-2">
                <Smartphone className="size-4 text-fd-primary" aria-hidden="true" />
                Android 优先，iOS 计划中
              </li>
              <li className="inline-flex items-center gap-2">
                <GitHubIcon className="size-4 text-fd-primary" />
                MIT 开源
              </li>
            </ul>
          </Reveal>
        </div>
        <div className="order-1 mx-auto w-[min(78vw,340px)] sm:w-[380px] lg:order-2 lg:w-full">
          <HeroMark />
        </div>
      </div>
    </section>
  );
}
