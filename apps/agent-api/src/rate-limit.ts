/**
 * Per-IP rate limiting for the routed endpoints, on top of lib/rate-limit.ts
 * (which owns the buckets themselves).
 * @module rate-limit
 */

import type { Env } from "./agent";
import { createHttp } from "./http";
import {
  CHAT_RATE_LIMIT,
  clientIp,
  consumeRateLimit,
  secondsUntil,
} from "./lib/rate-limit";

export type IpRateLimitResult =
  | { allowed: true; headers: Headers }
  | { allowed: false; response: Response };

export function applyIpRateLimit(
  request: Request,
  env: Env,
  routeKey: string
): IpRateLimitResult {
  const now = Date.now();
  const limit = consumeRateLimit(
    `${routeKey}:${clientIp(request)}`,
    now,
    CHAT_RATE_LIMIT.max,
    CHAT_RATE_LIMIT.windowMs
  );

  const headers = new Headers({
    "RateLimit-Limit": String(CHAT_RATE_LIMIT.max),
    "RateLimit-Remaining": String(limit.remaining),
    "RateLimit-Reset": String(secondsUntil(limit.resetAt, now)),
  });

  if (!limit.allowed) {
    headers.set("Retry-After", String(secondsUntil(limit.resetAt, now)));
    return {
      allowed: false,
      response: createHttp(request, env).withCors(
        new Response(JSON.stringify({ error: "rate limited" }), {
          status: 429,
          headers: {
            ...Object.fromEntries(headers),
            "Content-Type": "application/json",
          },
        })
      ),
    };
  }

  return { allowed: true, headers };
}
