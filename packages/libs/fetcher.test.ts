import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NetworkError } from "./errors";
import { fetcher } from "./fetcher";

const originalFetch = globalThis.fetch;
beforeEach(() => {
  globalThis.fetch = originalFetch;
});

describe("fetcher", () => {
  test("returns parsed JSON on success", async () => {
    const data = { id: 1, name: "Alice" };
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(data), { status: 200 }))
    ) as typeof fetch;

    const result = await fetcher("https://example.com/api");
    expect(result).toEqual(data);
  });

  test("throws NetworkError on non-OK status with JSON body", async () => {
    const errorBody = { error: "Not Found", detail: "Resource missing" };
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(errorBody), {
          status: 404,
          statusText: "Not Found",
        })
      )
    ) as typeof fetch;

    const url = "https://example.com/api/missing";
    const err = await fetcher(url).catch((e) => e);

    expect(err).toBeInstanceOf(NetworkError);
    expect(err.status).toBe(404);
    expect(err.statusText).toBe("Not Found");
    expect(err.url).toBe(url);
    expect(err.message).toContain("HTTP 404");
    expect(err.message).toContain(url);
  });

  test("error body parsed as JSON and stored in context.info", async () => {
    const errorBody = { code: "FORBIDDEN", reason: "Access denied" };
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(errorBody), {
          status: 403,
          statusText: "Forbidden",
        })
      )
    ) as typeof fetch;

    const err = await fetcher("https://example.com/secret").catch((e) => e);
    expect(err).toBeInstanceOf(NetworkError);
    expect(err.context?.info).toEqual(errorBody);
  });

  test("falls back to text when error body is not JSON", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.reject(new Error("JSON parse error")),
      text: () => Promise.resolve("Internal Server Error"),
    };
    globalThis.fetch = mock(() =>
      Promise.resolve(mockResponse as Response)
    ) as typeof fetch;

    const err = await fetcher("https://example.com/crash").catch((e) => e);
    expect(err).toBeInstanceOf(NetworkError);
    expect(err.context?.info).toEqual({ message: "Internal Server Error" });
  });

  test("falls back to generic message when both JSON and text parsing fail", async () => {
    const mockResponse = {
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      json: () => Promise.reject(new Error("JSON parse error")),
      text: () => Promise.reject(new Error("Text read error")),
    };
    globalThis.fetch = mock(() =>
      Promise.resolve(mockResponse as Response)
    ) as typeof fetch;

    const err = await fetcher("https://example.com/broken").catch((e) => e);
    expect(err).toBeInstanceOf(NetworkError);
    expect(err.context?.info).toEqual({
      message: "Unable to parse error response",
    });
  });

  test("passes options to fetch", async () => {
    const data = { ok: true };
    let capturedOptions: RequestInit | undefined;
    globalThis.fetch = mock((_url: string, options?: RequestInit) => {
      capturedOptions = options;
      return Promise.resolve(
        new Response(JSON.stringify(data), { status: 200 })
      );
    }) as typeof fetch;

    await fetcher("https://example.com/post", { method: "POST" });
    expect(capturedOptions).toEqual({ method: "POST" });
  });

  test("error message includes status code and URL", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 401,
          statusText: "Unauthorized",
        })
      )
    ) as typeof fetch;

    const url = "https://example.com/protected";
    const err = await fetcher(url).catch((e) => e);
    expect(err.message).toBe(
      `HTTP 401: An error occurred while fetching the data from ${url}`
    );
  });
});
