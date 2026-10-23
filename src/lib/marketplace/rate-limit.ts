/** Tiny in-memory sliding-window limiter (per server instance; good enough to stop abuse of the scan API). */
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 5000,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()): { ok: boolean; retryAfter: number; remaining: number } => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000), remaining: 0 };
    }
    recent.push(now);
    hits.delete(key);
    hits.set(key, recent);
    if (hits.size > maxKeys) hits.delete(hits.keys().next().value as string);
    return { ok: true, retryAfter: 0, remaining: limit - recent.length };
  };
}
