import { ArrowDownToLine } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { BorderBeam } from '@/components/ui/border-beam';
import { formatDate, getReleases, pickLatest } from '@/lib/releases';
import { github, repos } from '@/lib/shared';
import { GitHubIcon, Section } from './bits';

export async function DownloadCta() {
  const { releases } = await getReleases();
  const latest = pickLatest(releases);
  return (
    <Section labelledBy="cta-title" className="py-20 md:py-28">
      <div className="relative overflow-hidden rounded-[28px] border border-fd-border px-6 py-14 text-center md:px-12 md:py-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(196,34,54,0.16),transparent_70%),radial-gradient(40%_60%_at_0%_100%,rgba(71,92,135,0.12),transparent_70%),radial-gradient(40%_60%_at_100%_100%,rgba(186,149,112,0.14),transparent_70%)] dark:bg-[radial-gradient(60%_80%_at_50%_0%,rgba(139,0,18,0.45),transparent_70%),radial-gradient(40%_60%_at_0%_100%,rgba(14,52,99,0.4),transparent_70%),radial-gradient(40%_60%_at_100%_100%,rgba(137,94,67,0.3),transparent_70%)]"
        />
        <BorderBeam size={260} duration={14} />
        <Logo size={72} className="mx-auto drop-shadow-[0_18px_40px_rgba(139,0,18,0.45)]" />
        <h2 id="cta-title" className="mt-8 font-bold text-3xl tracking-[-0.03em] md:text-5xl">
          装上它，明早就能用
        </h2>
        <p className="mt-3 font-medium text-fd-muted-foreground text-lg">
          PKU Harness for Android. Free and open source.
        </p>
        <p className="mx-auto mt-5 max-w-md text-fd-muted-foreground text-sm leading-[1.75]">
          {latest
            ? `最新版本 ${latest.tag}，发布于 ${formatDate(latest.publishedAt)}。需要 Android 7.0 或更高版本，iOS 版计划中。`
            : '首个公开安装包即将发布。现在就可以从源码构建，在自己的手机或模拟器上运行。iOS 版计划中。'}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/download"
            className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-brand px-6 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(139,0,18,0.8),inset_0_1px_0_rgba(255,255,255,0.18)] transition-[transform,background-color] duration-150 hover:bg-[#9e0016] focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2 active:scale-[0.97]"
          >
            <ArrowDownToLine className="size-[18px]" aria-hidden="true" />
            {latest ? `下载 ${latest.tag}` : '下载与构建'}
          </Link>
          <a
            href={github(repos.app)}
            className="lp-glass inline-flex h-12 items-center gap-2 rounded-[10px] px-5 font-medium transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-fd-ring focus-visible:outline-offset-2 active:scale-[0.97]"
          >
            <GitHubIcon className="size-[18px]" />在 GitHub 上关注
          </a>
        </div>
      </div>
    </Section>
  );
}
