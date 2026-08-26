import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../index.js";
import { GENERATE_RATE_LIMIT, resetRateLimits } from "../lib/rate-limit.js";
import { clientIp } from "./card-description-streaming.js";

const TEST_TOKEN = "test-api-token";
const AUTH_ENV = {
  API_TOKEN: TEST_TOKEN,
  OPENROUTER_API_KEY: "test-mock-key",
};

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

describe("card-description rate limit keying", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shares a bucket for spoofed XFF headers when CF-Connecting-IP matches", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const baseInit = {
      body: JSON.stringify({ prompt: "generate description for blog card" }),
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
        "CF-Connecting-IP": "203.0.113.44",
        "Content-Type": "application/json",
      },
      method: "POST" as const,
    };

    for (let i = 0; i < GENERATE_RATE_LIMIT.max; i += 1) {
      const res = await app.request(
        "/api/llm/generate",
        {
          ...baseInit,
          headers: {
            ...baseInit.headers,
            "True-Client-IP": `198.51.100.${i}`,
            "X-Forwarded-For": `192.0.2.${i}`,
          },
        },
        AUTH_ENV
      );
      expect(res.status).not.toBe(429);
    }

    const limited = await app.request(
      "/api/llm/generate",
      {
        ...baseInit,
        headers: {
          ...baseInit.headers,
          "True-Client-IP": "198.51.100.99",
          "X-Forwarded-For": "192.0.2.99",
        },
      },
      AUTH_ENV
    );

    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("groups requests without CF-Connecting-IP into the unknown bucket", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const baseInit = {
      body: JSON.stringify({}),
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST" as const,
    };

    for (let i = 0; i < GENERATE_RATE_LIMIT.max; i += 1) {
      const res = await app.request(
        "/api/llm/generate",
        {
          ...baseInit,
          headers: {
            ...baseInit.headers,
            "True-Client-IP": `198.51.100.${i}`,
          },
        },
        AUTH_ENV
      );
      expect(res.status).not.toBe(429);
    }

    const limited = await app.request("/api/llm/generate", baseInit, AUTH_ENV);
    expect(limited.status).toBe(429);
  });
});
