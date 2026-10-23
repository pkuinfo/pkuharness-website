import { z } from 'zod';
import { getMarketplaceIndex } from '@/lib/marketplace';
import { parseRepoInput } from '@/lib/marketplace/github';
import { createRateLimiter } from '@/lib/marketplace/rate-limit';
import { scanRepo } from '@/lib/marketplace/scanner';

const perMinute = createRateLimiter({ limit: 6, windowMs: 60_000 });
const perHour = createRateLimiter({ limit: 30, windowMs: 3_600_000 });

const body = z.object({ repo: z.string().trim().min(3).max(300) }).strict();

function clientIp(req: Request) {
  const fwd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return fwd || req.headers.get('x-real-ip') || 'unknown';
}

const error = (status: number, code: string, message: string, headers?: HeadersInit) =>
  Response.json({ error: { code, message } }, { status, headers });

/** Preview a submission: scan a public GitHub repo for plugin manifests (POST { repo }). */
export async function POST(req: Request) {
  if (!req.headers.get('content-type')?.includes('application/json'))
    return error(415, 'unsupported', 'Send JSON: { "repo": "owner/repo" }.');
  const ip = clientIp(req);
  for (const limit of [perMinute, perHour]) {
    const r = limit(ip);
    if (!r.ok)
      return error(429, 'rate-limited', `Too many scans. Try again in ${r.retryAfter}s.`, {
        'Retry-After': String(r.retryAfter),
      });
  }

  let input: string;
  try {
    const raw = await req.text();
    if (raw.length > 2000) return error(413, 'invalid-input', 'Request too large.');
    input = body.parse(JSON.parse(raw)).repo;
    parseRepoInput(input);
  } catch (e) {
    const message =
      e instanceof z.ZodError
        ? 'Expected { "repo": "owner/repo" }.'
        : e instanceof Error
          ? e.message
          : 'Invalid input.';
    return error(400, 'invalid-input', message);
  }

  const index = await getMarketplaceIndex();
  const official = index.plugins.filter((p) => p.official);
  const community = index.plugins.filter((p) => !p.official);
  const report = await scanRepo(input, {
    token: process.env.GITHUB_TOKEN,
    // Short cache: a developer re-scanning after a push should see the fix soon.
    init: { next: { revalidate: 60 } },
    officialIds: new Set(official.map((p) => p.id)),
    takenIds: new Map(community.map((p) => [p.id, p.slug])),
  });
  const listed = index.sources.find((s) => report.repo && s.repo.toLowerCase() === report.repo.fullName.toLowerCase());
  const status = report.error?.code === 'rate-limited' ? 503 : 200;
  return Response.json({ report, listed: Boolean(listed) }, { status, headers: { 'Cache-Control': 'no-store' } });
}
