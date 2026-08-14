/**
 * API Tests
 * Basic tests for API endpoints
 * @module index.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "./index";
import { resetRateLimits } from "./lib/rate-limit.js";

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
      let lastStatus = 0;

      for (let i = 0; i < 11; i += 1) {
        const res = await app.request(
          "/api/llm/generate",
          generateInit({}, ip),
          AUTH_ENV
        );
        lastStatus = res.status;
        if (i < 10) {
          expect(res.status).toBe(400);
        }
      }

      expect(lastStatus).toBe(429);
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
