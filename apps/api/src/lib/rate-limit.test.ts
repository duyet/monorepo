import { describe, expect, it } from "vitest";
import {
  clientIp,
  consumeRateLimit,
  rateLimitHeaders,
  resetRateLimits,
  secondsUntil,
} from "./rate-limit.js";

describe("consumeRateLimit", () => {
  it("returns allowed=true with remaining decrements inside the window", () => {
    resetRateLimits();
    const now = 1_000_000;

    const first = consumeRateLimit("test:a", now, 3, 60_000);
    expect(first).toEqual({
      allowed: true,
      remaining: 2,
      resetAt: now + 60_000,
    });

    const second = consumeRateLimit("test:a", now + 1, 3, 60_000);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
    expect(second.resetAt).toBe(now + 60_000);
  });

  it("returns allowed=false with remaining=0 once the bucket is exhausted", () => {
    resetRateLimits();
    const now = 2_000_000;

    for (let i = 0; i < 2; i += 1) {
      expect(consumeRateLimit("test:b", now, 2, 60_000).allowed).toBe(true);
    }

    const rejected = consumeRateLimit("test:b", now + 1, 2, 60_000);
    expect(rejected.allowed).toBe(false);
    expect(rejected.remaining).toBe(0);
    expect(rejected.resetAt).toBe(now + 60_000);
  });

  it("starts a fresh window once resetAt has passed", () => {
    resetRateLimits();
    const now = 3_000_000;

    consumeRateLimit("test:c", now, 1, 60_000);
    expect(consumeRateLimit("test:c", now + 1, 1, 60_000).allowed).toBe(false);

    const afterWindow = consumeRateLimit("test:c", now + 60_000, 1, 60_000);
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(0);
    expect(afterWindow.resetAt).toBe(now + 120_000);
  });

  it("keeps separate buckets per key namespace", () => {
    resetRateLimits();
    const now = 4_000_000;

    consumeRateLimit("global:1.2.3.4", now, 1, 60_000);
    expect(consumeRateLimit("global:1.2.3.4", now, 1, 60_000).allowed).toBe(
      false
    );
    expect(
      consumeRateLimit("llm-generate:1.2.3.4", now, 1, 60_000).allowed
    ).toBe(true);
  });
});

describe("secondsUntil", () => {
  it("rounds up to whole seconds and clamps at zero", () => {
    const now = 10_000_000;
    expect(secondsUntil(now + 60_000, now)).toBe(60);
    expect(secondsUntil(now + 500, now)).toBe(1);
    expect(secondsUntil(now - 5_000, now)).toBe(0);
  });
});

describe("clientIp", () => {
  it("uses only CF-Connecting-IP", () => {
    const request = new Request("https://api.duyet.net/api/llm/generate", {
      headers: {
        "CF-Connecting-IP": "203.0.113.1",
        "True-Client-IP": "198.51.100.1",
        "X-Forwarded-For": "192.0.2.1",
      },
    });

    expect(clientIp(request)).toBe("203.0.113.1");
  });

  it("falls back to unknown when CF-Connecting-IP is absent", () => {
    const request = new Request("https://api.duyet.net/api/llm/generate", {
      headers: {
        "True-Client-IP": "198.51.100.1",
        "X-Forwarded-For": "192.0.2.1",
      },
    });

    expect(clientIp(request)).toBe("unknown");
  });
});

describe("rateLimitHeaders", () => {
  it("advertises the window without Retry-After while allowed", () => {
    const now = 5_000_000;
    const headers = rateLimitHeaders(
      { allowed: true, remaining: 4, resetAt: now + 60_000 },
      10,
      now
    );

    expect(headers.get("RateLimit-Limit")).toBe("10");
    expect(headers.get("RateLimit-Remaining")).toBe("4");
    expect(headers.get("RateLimit-Reset")).toBe("60");
    expect(headers.get("Retry-After")).toBeNull();
  });

  it("adds Retry-After once the bucket is exhausted", () => {
    const now = 6_000_000;
    const headers = rateLimitHeaders(
      { allowed: false, remaining: 0, resetAt: now + 30_000 },
      10,
      now
    );

    expect(headers.get("RateLimit-Remaining")).toBe("0");
    expect(headers.get("RateLimit-Reset")).toBe("30");
    expect(headers.get("Retry-After")).toBe("30");
  });
});
