import { describe, expect, it, vi } from "vitest";
import {
  handlePublicCors,
  isPublicAllowedOrigin,
  isPublicApiPath,
  PUBLIC_API_PATH,
  publicPreflight,
  withPublicCors,
} from "../public-cors.js";

function publicRequest(
  method: string,
  origin?: string,
  extra?: HeadersInit,
  url = `https://news.duyet.net${PUBLIC_API_PATH}`
): Request {
  const headers = new Headers(extra);
  if (origin) headers.set("Origin", origin);
  return new Request(url, { method, headers });
}

const EXT_ORIGIN = "chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef";

describe("isPublicApiPath", () => {
  it("matches /api/public and trailing slash only", () => {
    expect(
      isPublicApiPath(new Request("https://news.duyet.net/api/public"))
    ).toBe(true);
    expect(
      isPublicApiPath(new Request("https://news.duyet.net/api/public/"))
    ).toBe(true);
    expect(
      isPublicApiPath(new Request("https://news.duyet.net/api/feed"))
    ).toBe(false);
    expect(
      isPublicApiPath(new Request("https://news.duyet.net/api/public/extra"))
    ).toBe(false);
  });
});

describe("isPublicAllowedOrigin", () => {
  it("allows chrome-extension, localhost, and duyet.net", () => {
    expect(isPublicAllowedOrigin(EXT_ORIGIN)).toBe(true);
    expect(isPublicAllowedOrigin("http://localhost:3014")).toBe(true);
    expect(isPublicAllowedOrigin("http://127.0.0.1:5173")).toBe(true);
    expect(isPublicAllowedOrigin("https://news.duyet.net")).toBe(true);
    expect(isPublicAllowedOrigin("https://evil.example")).toBe(false);
    expect(isPublicAllowedOrigin("https://duyet.net.evil.com")).toBe(false);
    expect(isPublicAllowedOrigin("chrome-extension://")).toBe(false);
  });
});

describe("publicPreflight", () => {
  it("returns 204 with ACAO for a chrome-extension origin", () => {
    const res = publicPreflight(
      publicRequest("OPTIONS", EXT_ORIGIN, {
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "accept",
      })
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(EXT_ORIGIN);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    expect(res.headers.get("Access-Control-Allow-Headers")).toMatch(/accept/i);
    expect(res.headers.get("Vary")).toBe("Origin");
  });

  it("returns 204 with ACAO for localhost unpacked-ext dev", () => {
    const res = publicPreflight(
      publicRequest("OPTIONS", "http://localhost:3014")
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3014"
    );
  });

  it("omits ACAO for a disallowed origin", () => {
    const res = publicPreflight(
      publicRequest("OPTIONS", "https://evil.example")
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

describe("handlePublicCors", () => {
  it("answers OPTIONS without calling next, so SPA HTML cannot leak", async () => {
    const next = vi.fn(
      async () => new Response("<html></html>", { status: 200 })
    );
    const res = await handlePublicCors(
      publicRequest("OPTIONS", EXT_ORIGIN),
      next
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toBe(204);
    expect(res.headers.get("content-type") ?? "").not.toMatch(/html/i);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(EXT_ORIGIN);
  });

  it("wraps GET with CORS and keeps Cache-Control from the handler", async () => {
    const next = vi.fn(
      async () =>
        new Response(JSON.stringify({ tldr: null, stories: [] }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=120",
          },
        })
    );
    const res = await handlePublicCors(publicRequest("GET", EXT_ORIGIN), next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tldr: null, stories: [] });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(EXT_ORIGIN);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=120");
  });

  it("does not intercept other paths", async () => {
    const inner = new Response("feed", { status: 200 });
    const next = vi.fn(async () => inner);
    const res = await handlePublicCors(
      new Request("https://news.duyet.net/api/feed"),
      next
    );
    expect(next).toHaveBeenCalledOnce();
    expect(res).toBe(inner);
  });
});

describe("withPublicCors", () => {
  it("does not require Authorization", () => {
    const inner = Response.json({ ok: true });
    const res = withPublicCors(publicRequest("GET", EXT_ORIGIN), inner);
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(EXT_ORIGIN);
    expect(res.headers.get("WWW-Authenticate")).toBeNull();
  });
});
