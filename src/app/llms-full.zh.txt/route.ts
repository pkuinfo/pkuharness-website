import { docsLlms } from '@/lib/source';

export const revalidate = false;

/** All Chinese docs in one file (pages without a translation fall back to English). */
export async function GET() {
  return new Response(await docsLlms.full('zh'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
