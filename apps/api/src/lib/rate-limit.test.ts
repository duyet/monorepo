import { describe, expect, it } from "vitest";
import {
  consumeRateLimit,
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
    expect(consumeRateLimit("llm-generate:1.2.3.4", now, 1, 60_000).allowed).toBe(
      true
    );
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
