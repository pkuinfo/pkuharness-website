import type { Metadata } from 'next';
import { Section, SectionHeading } from '@/components/landing/bits';
import { PluginConstellation } from '@/components/landing/constellation';
import { Developers } from '@/components/landing/developers';
import { DownloadCta } from '@/components/landing/download-cta';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { PluginMarquee } from '@/components/landing/plugin-marquee';
import { getLandingPlugins } from '@/components/landing/registry';
import { TabsShowcase } from '@/components/landing/tabs-showcase';
import { Trust } from '@/components/landing/trust';
import '@/components/landing/landing.css';

export const metadata: Metadata = {
  title: { absolute: 'PKU Harness — 北大校园生活的 AI 原生 App' },
  description:
    '登录一次北大账号，课表、校园卡、网费、树洞、教学网……都交给跑在你手机上的 AI 助手。An open-source, AI-native campus app for Peking University.',
};

export default async function HomePage() {
  const plugins = await getLandingPlugins();
  return (
    <div className="flex flex-col">
      <Hero />
      <PluginMarquee plugins={plugins} />

      <Section labelledBy="tabs-title" className="py-24 md:py-32">
        <SectionHeading id="tabs-title" title="四个标签页，一个助手" en="Four tabs, one agent behind all of them." />
        <div className="mt-14">
          <TabsShowcase />
        </div>
      </Section>

      <Section labelledBy="how-title" className="py-24 md:py-32">
        <SectionHeading id="how-title" title="一句话，到学校的每个系统" en="From one sentence to every campus system.">
          助手不直接碰学校的网站。它只能调用插件声明过的工具，每一次调用都先经过你设定的授权。
        </SectionHeading>
        <div className="mt-16">
          <HowItWorks />
        </div>
      </Section>

      <Section labelledBy="constellation-title" className="py-24 md:py-32">
        <SectionHeading
          id="constellation-title"
          title="一切皆插件"
          en="Everything is a plugin, and every plugin is equal."
        >
          App 本身只是一个
          harness：智能体循环、设计系统和宿主服务。课表、校园卡、树洞、模型服务，连助手画界面的能力，都是插件。
        </SectionHeading>
        <div className="mt-10">
          <PluginConstellation plugins={plugins} />
        </div>
      </Section>

      <Trust />
      <Developers />
      <DownloadCta />
    </div>
  );
}
