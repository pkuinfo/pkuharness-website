import type { Metadata } from 'next';
import Link from 'next/link';
import { SubmitForm } from '@/components/marketplace/submit-form';

export const metadata: Metadata = {
  title: '提交插件 · Submit a plugin',
  description: 'Check a GitHub repository for PKU Harness plugin manifests and submit it to the marketplace.',
};

export default function SubmitPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 pt-14 pb-24 md:px-6 md:pt-20">
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-fd-muted-foreground">
        <Link href="/marketplace" className="hover:text-fd-foreground">
          marketplace
        </Link>
        <span className="mx-1.5 opacity-50">/</span>
        <span className="text-fd-foreground">submit</span>
      </nav>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
        提交插件
        <span className="mt-2 block text-base font-normal tracking-normal text-fd-muted-foreground">
          Paste a GitHub repo. We find every plugin in it, check it, and show you what students will see.
        </span>
      </h1>
      <p className="mt-5 text-[15px] leading-7 text-fd-muted-foreground">
        市场按仓库收录插件：一个仓库可以包含任意多个插件，handle 是{' '}
        <code className="font-mono text-fd-foreground">owner/repo/id</code>
        。收录之后，你只需要 push，市场每小时会重新扫描。规则见{' '}
        <Link href="/docs/marketplace/review" className="text-fd-primary hover:underline">
          审核与安全
        </Link>
        。
      </p>
      <div className="mt-10">
        <SubmitForm />
      </div>
    </div>
  );
}
