/**
 * API Tests
 * Basic tests for API endpoints
 * @module index.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "./index";
import { resetLlmsCacheForTests } from "./routes/card-description-streaming.js";
import {
  GLOBAL_RATE_LIMIT,
  resetRateLimits,
} from "./lib/rate-limit.js";

interface ApiInfoResponse {
  name: string;
  version: string;
  status: string;
  endpoints: {
    health: string;
    cardDescription: string;
  };
}

interface HealthResponse {
  status: string;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
}

const TEST_TOKEN = "test-api-token";
const AUTH_ENV = {
  API_TOKEN: TEST_TOKEN,
  OPENROUTER_API_KEY: "test-mock-key",
};

function generateInit(
  body: unknown,
  ip: string,
  token = TEST_TOKEN
): RequestInit {
  const headers: Record<string, string> = {
    "CF-Connecting-IP": ip,
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return {
    body: JSON.stringify(body),
    headers,
    method: "POST",
  };
}

describe("API Endpoints", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("GET /", () => {
    it("should return API information", async () => {
      const res = await app.request("/");
      expect(res.status).toBe(200);
      const json = (await res.json()) as ApiInfoResponse;
      expect(json.name).toBe("duyet.net API");
      expect(json.status).toBe("healthy");
      expect(json.endpoints).toHaveProperty("cardDescription");
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await app.request("/health");
      expect(res.status).toBe(200);
      const json = (await res.json()) as HealthResponse;
      expect(json.status).toBe("ok");
      expect(json.timestamp).toBeDefined();
    });
  });

  describe("GET /openapi.json", () => {
    it("should serve an OpenAPI 3.1 document with unique operationIds and oauth2 scopes", async () => {
      const res = await app.request("/openapi.json");
      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toBe("public, max-age=300");

      const doc = (await res.json()) as Record<string, any>;
      expect(String(doc.openapi)).toMatch(/^3\.1\./);
      expect(doc.info?.title).toBe("duyet.net API");

      // Every operation: unique operationId + non-empty description + 200 response
      const operationIds = new Set<string>();
      for (const [path, pathItem] of Object.entries<any>(doc.paths)) {
        for (const [method, operation] of Object.entries<any>(pathItem)) {
          expect(operation.operationId, `${method} ${path}`).toBeTruthy();
          expect(
            operationIds.has(operation.operationId),
            `duplicate operationId ${operation.operationId}`
          ).toBe(false);
          operationIds.add(operation.operationId);
          expect(operation.description, `${method} ${path}`).toBeTruthy();
          expect(operation.responses?.["200"], `${method} ${path}`).toBeDefined();
        }
      }

      // Security schemes declare the canonical scopes
      const flows = doc.components?.securitySchemes?.oauth2?.flows ?? {};
      const scopes = Object.values<any>(flows).flatMap((f) => Object.keys(f.scopes ?? {}));
      expect(scopes).toContain("read:profile");
      expect(scopes).toContain("chat");

      // The secured operation requires the chat scope (or bearer fallback)
      const generateSecurity = doc.paths?.["/api/llm/generate"]?.post?.security;
      expect(generateSecurity).toEqual([{ oauth2: ["chat"] }, { bearerAuth: [] }]);
    });
  });

  describe("Rate-limit headers", () => {
    function expectRateLimitHeaders(res: Response): void {
      expect(res.headers.get("RateLimit-Limit")).toBe(
        String(GLOBAL_RATE_LIMIT.max)
      );
      expect(Number(res.headers.get("RateLimit-Remaining"))).not.toBeNaN();
      expect(Number(res.headers.get("RateLimit-Reset"))).not.toBeNaN();
    }

    it("sets RateLimit-* headers on success responses", async () => {
      for (const path of ["/", "/health", "/api/insights/overview"]) {
        const res = await app.request(path, {
          headers: { "CF-Connecting-IP": "203.0.113.50" },
        });
        expect(res.status, path).toBe(200);
        expectRateLimitHeaders(res);
        await res.json().catch(() => null);
      }
    });

    it("returns 429 with Retry-After when the global bucket is exhausted", async () => {
      const ip = "203.0.113.60";
      let lastRes: Response | undefined;

      for (let i = 0; i <= GLOBAL_RATE_LIMIT.max; i += 1) {
        lastRes = await app.request("/health", {
          headers: { "CF-Connecting-IP": ip },
        });
        if (i < GLOBAL_RATE_LIMIT.max) {
          expect(lastRes.status).toBe(200);
        }
      }

      expect(lastRes?.status).toBe(429);
      expectRateLimitHeaders(lastRes as Response);
      expect(Number(lastRes?.headers.get("Retry-After"))).toBeGreaterThan(0);
      const json = (await lastRes?.json()) as ErrorResponse;
      expect(json.error).toBe("rate limited");
    });
  });

  describe("POST /api/llm/generate", () => {
    it("should return 401 without a token before calling OpenRouter", async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(
        "/api/llm/generate",
        generateInit(
          { prompt: "generate description for blog card" },
          "203.0.113.1",
          ""
        ),
        AUTH_ENV
      );

      expect(res.status).toBe(401);
      const json = (await res.json()) as ErrorResponse;
      expect(json.error).toBe("Unauthorized");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("should return 401 for a wrong token before calling OpenRouter", async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(
        "/api/llm/generate",
        generateInit(
          { prompt: "generate description for blog card" },
          "203.0.113.2",
          "wrong-token"
        ),
        AUTH_ENV
      );

      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("should return 401 when no API token is configured", async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const res = await app.request(
        "/api/llm/generate",
        generateInit(
          { prompt: "generate description for blog card" },
          "203.0.113.3"
        ),
        { OPENROUTER_API_KEY: "test-mock-key" }
      );

      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("should return 400 when prompt is missing", async () => {
      const res = await app.request(
        "/api/llm/generate",
        generateInit({}, "203.0.113.10"),
        AUTH_ENV
      );
      expect(res.status).toBe(400);
      const json = (await res.json()) as ErrorResponse;
      expect(json.error).toContain("prompt");
    });

    it("should return 400 for invalid prompt", async () => {
      const res = await app.request(
        "/api/llm/generate",
        generateInit({ prompt: "random text" }, "203.0.113.11"),
        AUTH_ENV
      );
      expect(res.status).toBe(400);
    });

    it("should return 400 for non-string prompt", async () => {
      const res = await app.request(
        "/api/llm/generate",
        generateInit({ prompt: 123 }, "203.0.113.12"),
        AUTH_ENV
      );
      expect(res.status).toBe(400);
      const json = (await res.json()) as ErrorResponse;
      expect(json.error).toContain("prompt");
    });

    it("should return 429 after 10 requests from the same IP", async () => {
      const ip = "198.51.100.9";
      let lastRes: Response | undefined;

      for (let i = 0; i < 11; i += 1) {
        const res = await app.request(
          "/api/llm/generate",
          generateInit({}, ip),
          AUTH_ENV
        );
        lastRes = res;
        if (i < 10) {
          expect(res.status).toBe(400);
        }
      }

      expect(lastRes?.status).toBe(429);
      // 429s carry Retry-After (seconds until the window resets)
      const retryAfter = Number(lastRes?.headers.get("Retry-After"));
      expect(retryAfter).toBeGreaterThan(0);
    });

    it("should accept blog card prompt", async () => {
      const res = await app.request(
        "/api/llm/generate",
        generateInit(
          { prompt: "generate description for blog card" },
          "203.0.113.20"
        ),
        AUTH_ENV
      );
      // Will fail without real key, but should accept valid prompt format
      expect(res.status).not.toBe(400);
      expect(res.status).not.toBe(401);
    }, 15_000);

    it("should accept featured posts card prompt", async () => {
      const res = await app.request(
        "/api/llm/generate",
        generateInit(
          { prompt: "generate description for featured posts card" },
          "203.0.113.21"
        ),
        AUTH_ENV
      );
      // Will fail without real key, but should accept valid prompt format
      expect(res.status).not.toBe(400);
      expect(res.status).not.toBe(401);
    }, 15_000);

    it("fetches llms.txt at most once per isolate within the cache TTL", async () => {
      resetLlmsCacheForTests();

      const fetchMock = vi
        .fn()
        .mockImplementation(async (input: RequestInfo | URL) => {
          const url = String(input);
          if (url.includes("llms.txt")) {
            return {
              ok: true,
              text: async () => "a".repeat(4000),
            };
          }
          return {
            ok: true,
            json: async () => ({
              choices: [{ message: { content: "Cached blog description." } }],
            }),
          };
        });
      vi.stubGlobal("fetch", fetchMock);

      const init = generateInit(
        { prompt: "generate description for blog card" },
        "203.0.113.22"
      );

      await app.request("/api/llm/generate", init, AUTH_ENV);
      await app.request("/api/llm/generate", init, AUTH_ENV);

      const llmsFetches = fetchMock.mock.calls.filter(([input]) =>
        String(input).includes("llms.txt")
      );
      expect(llmsFetches).toHaveLength(1);
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await app.request("/unknown-route");
      expect(res.status).toBe(404);
      const json = (await res.json()) as ErrorResponse;
      expect(json.error).toBe("Not Found");
    });
  });
});
