import { docsLlms } from '@/lib/source';

export const revalidate = false;

/** All English docs in one file, for AI agents. Chinese: /llms-full.zh.txt. */
export async function GET() {
  return new Response(await docsLlms.full('en'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
