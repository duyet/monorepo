const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const MAX_BUCKETS = 10_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export const GENERATE_RATE_LIMIT = {
  max: MAX_REQUESTS,
  windowMs: WINDOW_MS,
};

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
): boolean {
  pruneExpired(now);

  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= max) {
    return false;
  }

  existing.count += 1;
  return true;
}

export function resetRateLimits(): void {
  buckets.clear();
}
