import { describe, expect, test } from "bun:test";
import fetcher from "../fetcher";

describe("fetcher", () => {
  test("should fetch and return JSON data", async () => {
    const data = await fetcher("https://httpbin.org/json");
    expect(data).toBeDefined();
    expect(typeof data).toBe("object");
  });

  test("should throw on non-2xx response", async () => {
    expect(fetcher("https://httpbin.org/status/404")).rejects.toThrow();
  });

  test("should throw on 500 response", async () => {
    expect(fetcher("https://httpbin.org/status/500")).rejects.toThrow();
  });

  test("should include status in error for failed requests", async () => {
    try {
      await fetcher("https://httpbin.org/status/429");
      expect.unreachable("Should have thrown");
    } catch (error: any) {
      expect(error.status).toBe(429);
      expect(error.message).toContain("HTTP 429");
    }
  });

  test("should export fetcher as default", () => {
    expect(typeof fetcher).toBe("function");
  });
});
