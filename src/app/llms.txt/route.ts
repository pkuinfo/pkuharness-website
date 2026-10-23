import { docsLlms } from '@/lib/source';

export const revalidate = false;

/** Index of every docs page in both languages (English under /en). Full text: /llms-full.txt (English), /llms-full.zh.txt (Chinese). */
export async function GET() {
  return new Response(await docsLlms.index(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
