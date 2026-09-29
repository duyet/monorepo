import { beforeEach, describe, expect, test } from "vitest";
import type { Env } from "./agent";
import { CHAT_RATE_LIMIT, resetRateLimits } from "./lib/rate-limit";
import { applyIpRateLimit } from "./rate-limit";

const CHAT_URL = "https://agents.duyet.net/api/v1/chat";

const ENV = {
  CLERK_AUTHORIZED_PARTIES: "https://agents.duyet.net",
} as unknown as Env;

function request(ip?: string, origin?: string): Request {
  return new Request(CHAT_URL, {
    headers: {
      ...(ip ? { "CF-Connecting-IP": ip } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
  });
}

describe("applyIpRateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  test("advertises the window while requests are allowed", () => {
    const result = applyIpRateLimit(request("203.0.113.1"), ENV, "chat");

    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.headers.get("RateLimit-Limit")).toBe(
        String(CHAT_RATE_LIMIT.max)
      );
      expect(result.headers.get("RateLimit-Remaining")).toBe(
        String(CHAT_RATE_LIMIT.max - 1)
      );
      expect(Number(result.headers.get("RateLimit-Reset"))).toBeGreaterThan(0);
      expect(result.headers.get("Retry-After")).toBeNull();
    }
  });

  test("returns a CORS-decorated 429 once the bucket is exhausted", async () => {
    for (let i = 0; i < CHAT_RATE_LIMIT.max; i += 1) {
      expect(
        applyIpRateLimit(request("203.0.113.2"), ENV, "chat").allowed
      ).toBe(true);
    }

    const limited = applyIpRateLimit(request("203.0.113.2"), ENV, "chat");
    expect(limited.allowed).toBe(false);

    if (!limited.allowed) {
      expect(limited.response.status).toBe(429);
      expect(limited.response.headers.get("Content-Type")).toBe(
        "application/json"
      );
      expect(limited.response.headers.get("RateLimit-Remaining")).toBe("0");
      expect(limited.response.headers.get("Vary")).toBe("Origin");
      expect(
        Number(limited.response.headers.get("Retry-After"))
      ).toBeGreaterThan(0);
      expect(await limited.response.json()).toEqual({ error: "rate limited" });
    }
  });

  test("keys buckets per IP and per route", () => {
    for (let i = 0; i < CHAT_RATE_LIMIT.max; i += 1) {
      applyIpRateLimit(request("203.0.113.3"), ENV, "chat");
    }

    expect(applyIpRateLimit(request("203.0.113.4"), ENV, "chat").allowed).toBe(
      true
    );
    expect(
      applyIpRateLimit(request("203.0.113.3"), ENV, "agents").allowed
    ).toBe(true);
  });

  test("groups requests without CF-Connecting-IP into one bucket", () => {
    for (let i = 0; i < CHAT_RATE_LIMIT.max; i += 1) {
      applyIpRateLimit(request(), ENV, "chat");
    }

    expect(applyIpRateLimit(request(), ENV, "chat").allowed).toBe(false);
  });

  test("only echoes an authorized origin on the 429", async () => {
    for (let i = 0; i < CHAT_RATE_LIMIT.max; i += 1) {
      applyIpRateLimit(request("203.0.113.5"), ENV, "chat");
    }

    const allowed = applyIpRateLimit(
      request("203.0.113.5", "https://agents.duyet.net"),
      ENV,
      "chat"
    );
    const denied = applyIpRateLimit(
      request("203.0.113.5", "https://evil.example.com"),
      ENV,
      "chat"
    );

    if (!allowed.allowed && !denied.allowed) {
      expect(allowed.response.headers.get("Access-Control-Allow-Origin")).toBe(
        "https://agents.duyet.net"
      );
      expect(
        denied.response.headers.get("Access-Control-Allow-Origin")
      ).toBeNull();
    }
  });
});
