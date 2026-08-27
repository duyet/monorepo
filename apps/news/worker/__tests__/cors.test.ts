import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  handleSubscribeCors,
  isAllowedOrigin,
  preflight,
  withCors,
} from "../subscribe/cors.js";

const newsRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

function subscribeRequest(
  method: string,
  origin?: string,
  extra?: HeadersInit
): Request {
  const headers = new Headers(extra);
  if (origin) headers.set("Origin", origin);
  return new Request("https://news.duyet.net/api/subscribe", {
    method,
    headers,
  });
}

describe("isAllowedOrigin", () => {
  it("allows blog, home, news, and local dev", () => {
    expect(isAllowedOrigin("https://blog.duyet.net")).toBe(true);
    expect(isAllowedOrigin("https://duyet.net")).toBe(true);
    expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
    expect(isAllowedOrigin("https://evil.example")).toBe(false);
    expect(isAllowedOrigin("https://duyet-blog.pages.dev")).toBe(true);
    expect(isAllowedOrigin("https://random.pages.dev")).toBe(false);
  });

  it("allows any https *.duyet.net origin and localhost ports", () => {
    expect(isAllowedOrigin("https://insights.duyet.net")).toBe(true);
    expect(isAllowedOrigin("http://localhost:5173")).toBe(true);
    expect(isAllowedOrigin("https://duyet.net.evil.com")).toBe(false);
    expect(isAllowedOrigin("https://notduyet.net")).toBe(false);
  });
});

describe("preflight", () => {
  it("returns 204 with ACAO for an allowed blog origin", () => {
    const res = preflight(
      subscribeRequest("OPTIONS", "https://blog.duyet.net", {
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      })
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://blog.duyet.net"
    );
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(res.headers.get("Access-Control-Allow-Headers")).toMatch(
      /content-type/i
    );
    expect(res.headers.get("Vary")).toBe("Origin");
  });

  it("omits ACAO for a disallowed origin", () => {
    const res = preflight(subscribeRequest("OPTIONS", "https://evil.example"));
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

describe("handleSubscribeCors", () => {
  it("answers OPTIONS without calling next, so SPA HTML cannot leak", async () => {
    const next = vi.fn(
      async () => new Response("<html></html>", { status: 200 })
    );
    const res = await handleSubscribeCors(
      subscribeRequest("OPTIONS", "https://blog.duyet.net"),
      next
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://blog.duyet.net"
    );
  });

  it("wraps POST responses with CORS even if the inner handler omitted them", async () => {
    const next = vi.fn(
      async () =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
    );
    const res = await handleSubscribeCors(
      subscribeRequest("POST", "https://blog.duyet.net"),
      next
    );
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://blog.duyet.net"
    );
  });

  it("does not intercept other paths", async () => {
    const inner = new Response("feed", { status: 200 });
    const next = vi.fn(async () => inner);
    const res = await handleSubscribeCors(
      new Request("https://news.duyet.net/api/feed"),
      next
    );
    expect(next).toHaveBeenCalledOnce();
    expect(res).toBe(inner);
  });

  it("awaits a sync next() return, matching TanStack fetch typing", async () => {
    const inner = new Response("ok", { status: 200 });
    const res = await handleSubscribeCors(
      new Request("https://news.duyet.net/api/feed"),
      () => inner
    );
    expect(res).toBe(inner);
  });
});

describe("worker fetch entry", () => {
  it("intercepts /api/subscribe CORS before TanStack Start", () => {
    const src = readFileSync(path.join(newsRoot, "src/server.ts"), "utf-8");
    expect(src).toContain("handleSubscribeCors");
    expect(src).toContain("handlePublicCors");
    expect(src).not.toMatch(/return handler\.fetch\(request\);/);
  });
});

describe("withCors", () => {
  it("copies the inner status and body", async () => {
    const inner = Response.json({ error: "invalid email" }, { status: 400 });
    const res = withCors(subscribeRequest("POST", "https://duyet.net"), inner);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid email" });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://duyet.net"
    );
  });
});
