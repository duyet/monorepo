/**
 * Ported from apps/api/src/lib/rate-limit.ts — module-scope buckets are
 * per-isolate by design on Cloudflare Workers.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const MAX_BUCKETS = 10_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export const CHAT_RATE_LIMIT = {
  max: MAX_REQUESTS,
  windowMs: WINDOW_MS,
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

function pruneExpired(now: number): void {
  if (buckets.size <= MAX_BUCKETS) return;

  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

export function consumeRateLimit(
  key: string,
  now = Date.now(),
  max = MAX_REQUESTS,
  windowMs = WINDOW_MS
): RateLimitResult {
  pruneExpired(now);

  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: max - existing.count,
    resetAt: existing.resetAt,
  };
}

export function secondsUntil(resetAt: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((resetAt - now) / 1000));
}

export function resetRateLimits(): void {
  buckets.clear();
}

export function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}
