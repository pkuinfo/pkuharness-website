import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { RELEASES_TAG } from '@/lib/releases';

/**
 * GitHub webhook for pkuinfo/pku-harness (event: release). When a release is published, edited or
 * deleted, the download page and the landing CTA refetch releases on the next request instead of
 * waiting out the 10-minute cache. Authenticated with the webhook secret (X-Hub-Signature-256).
 */
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'webhook not configured' }, { status: 503 });

  const body = await req.text();
  const signature = req.headers.get('x-hub-signature-256') ?? '';
  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    return Response.json({ error: 'bad signature' }, { status: 401 });

  const event = req.headers.get('x-github-event');
  if (event === 'ping') return Response.json({ ok: true });
  if (event !== 'release') return new Response(null, { status: 204 });

  revalidateTag(RELEASES_TAG, { expire: 0 });
  revalidatePath('/download');
  revalidatePath('/');
  return Response.json({ revalidated: ['/download', '/'] });
}
