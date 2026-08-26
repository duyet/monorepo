import { afterEach, describe, expect, it } from "vitest";
import {
  CHAT_RATE_LIMIT,
  consumeRateLimit,
  resetRateLimits,
  secondsUntil,
} from "./rate-limit";

describe("consumeRateLimit", () => {
  afterEach(() => {
    resetRateLimits();
  });

  it("exhausts a bucket and returns 429-class state", () => {
    const now = 1_000_000;
    const key = "chat:203.0.113.10";

    for (let i = 0; i < CHAT_RATE_LIMIT.max; i += 1) {
      expect(
        consumeRateLimit(
          key,
          now + i,
          CHAT_RATE_LIMIT.max,
          CHAT_RATE_LIMIT.windowMs
        ).allowed
      ).toBe(true);
    }

    const rejected = consumeRateLimit(
      key,
      now + CHAT_RATE_LIMIT.max,
      CHAT_RATE_LIMIT.max,
      CHAT_RATE_LIMIT.windowMs
    );
    expect(rejected.allowed).toBe(false);
    expect(rejected.remaining).toBe(0);
    expect(secondsUntil(rejected.resetAt, now)).toBeGreaterThan(0);
  });

  it("resets after the window expires", () => {
    const now = 2_000_000;
    const key = "agents:203.0.113.11";

    consumeRateLimit(key, now, 1, CHAT_RATE_LIMIT.windowMs);
    expect(
      consumeRateLimit(key, now + 1, 1, CHAT_RATE_LIMIT.windowMs).allowed
    ).toBe(false);

    const afterWindow = consumeRateLimit(
      key,
      now + CHAT_RATE_LIMIT.windowMs,
      1,
      CHAT_RATE_LIMIT.windowMs
    );
    expect(afterWindow.allowed).toBe(true);
  });

  it("keeps distinct IPs in separate buckets", () => {
    const now = 3_000_000;

    for (let i = 0; i < CHAT_RATE_LIMIT.max; i += 1) {
      consumeRateLimit(
        "chat:203.0.113.1",
        now + i,
        CHAT_RATE_LIMIT.max,
        CHAT_RATE_LIMIT.windowMs
      );
    }

    expect(
      consumeRateLimit(
        "chat:203.0.113.1",
        now + CHAT_RATE_LIMIT.max,
        CHAT_RATE_LIMIT.max,
        CHAT_RATE_LIMIT.windowMs
      ).allowed
    ).toBe(false);
    expect(
      consumeRateLimit(
        "chat:203.0.113.2",
        now,
        CHAT_RATE_LIMIT.max,
        CHAT_RATE_LIMIT.windowMs
      ).allowed
    ).toBe(true);
  });
});
