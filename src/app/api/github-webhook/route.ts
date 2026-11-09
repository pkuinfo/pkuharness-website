import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { after } from 'next/server';
import { RELEASES_TAG } from '@/lib/releases';

/**
 * GitHub's REST API serves anonymous responses from a cache for up to 60 s
 * (`Cache-Control: public, s-maxage=60`), so a refetch right after the webhook can still return
 * the list without the new release, and the page would keep that for another 10 minutes.
 * Expire once more after GitHub's cache has turned over.
 */
const GITHUB_CACHE_MS = 65_000;

function expireReleases() {
  revalidateTag(RELEASES_TAG, { expire: 0 });
  revalidatePath('/download');
  revalidatePath('/');
}

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

  expireReleases();
  // The site is a long-running Node server (output: 'standalone'), so this outlives the response.
  after(async () => {
    await new Promise((resolve) => setTimeout(resolve, GITHUB_CACHE_MS));
    expireReleases();
  });
  return Response.json({ revalidated: ['/download', '/'] });
}
