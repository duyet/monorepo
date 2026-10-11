import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../env.js";
import { edgeCache, normalizeCacheUrl } from "./edge-cache.js";

class FakeCache {
  store = new Map<string, Response>();
  async match(req: Request) {
    return this.store.get(req.url)?.clone();
  }
  async put(url: string | Request, res: Response) {
    this.store.set(typeof url === "string" ? url : url.url, res);
  }
}

let cache: FakeCache;

const pub = (body: unknown) =>
  Response.json(body, { headers: { "Cache-Control": "public, max-age=60" } });

function buildApp(
  handler: () => Promise<Response> | Response,
  ttl = 60,
  swr = 600
) {
  const app = new Hono<{ Bindings: Env }>();
  app.get(
    "/data",
    edgeCache({
      ttl,
      swr,
      decorate: (_req, headers) =>
        headers.set(
          "Access-Control-Allow-Origin",
          "https://insights.duyet.net"
        ),
    }),
    async (c) => handler()
  );
  return app;
}

beforeEach(() => {
  cache = new FakeCache();
  vi.stubGlobal("caches", { default: cache });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("normalizeCacheUrl", () => {
  it("drops tracking params and sorts the rest so equivalent URLs share a key", () => {
    expect(
      normalizeCacheUrl("https://a.dev/x?b=2&utm_source=t&a=1&fbclid=z#h")
    ).toBe("https://a.dev/x?a=1&b=2");
    expect(normalizeCacheUrl("https://a.dev/x?a=1&b=2")).toBe(
      normalizeCacheUrl("https://a.dev/x?b=2&a=1&gclid=q")
    );
  });
});

describe("edgeCache", () => {
  it("serves repeats from the cache without re-running the upstream handler", async () => {
    const upstream = vi.fn(() => pub({ n: 1 }));
    const app = buildApp(upstream);

    const first = await app.request("/data?utm_campaign=a");
    const second = await app.request("/data?fbclid=b");

    expect(first.headers.get("X-Edge-Cache")).toBe("MISS");
    expect(second.headers.get("X-Edge-Cache")).toBe("HIT");
    expect(await second.json()).toEqual({ n: 1 });
    expect(upstream).toHaveBeenCalledTimes(1);
    expect(second.headers.get("Cache-Control")).toBe(
      "public, max-age=60, stale-while-revalidate=600"
    );
    expect(second.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://insights.duyet.net"
    );
  });

  it("coalesces concurrent misses into one upstream run", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const upstream = vi.fn(async () => {
      await gate;
      return pub({ n: 1 });
    });
    const app = buildApp(upstream);

    const a = app.request("/data");
    const b = app.request("/data");
    await Promise.resolve();
    release();
    const [ra, rb] = await Promise.all([a, b]);

    expect(upstream).toHaveBeenCalledTimes(1);
    expect(
      [ra.headers.get("X-Edge-Cache"), rb.headers.get("X-Edge-Cache")].sort()
    ).toEqual(["COALESCED", "MISS"]);
    expect(await rb.json()).toEqual({ n: 1 });
  });

  it("answers If-None-Match with 304 and no body", async () => {
    const app = buildApp(() => pub({ n: 1 }));
    const first = await app.request("/data");
    const etag = first.headers.get("ETag");
    expect(etag).toMatch(/^W\//);

    const res = await app.request("/data", {
      headers: { "If-None-Match": etag! },
    });
    expect(res.status).toBe(304);
    expect(await res.text()).toBe("");
    expect(res.headers.get("ETag")).toBe(etag);
  });

  it("refreshes past the ttl but serves the stale copy when the upstream fails", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    let fail = false;
    const app = buildApp(() =>
      fail ? Response.json({ error: "x" }, { status: 500 }) : pub({ n: 1 })
    );
    await app.request("/data");

    vi.setSystemTime(120_000);
    fail = true;
    const res = await app.request("/data");

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Edge-Cache")).toBe("STALE");
    expect(await res.json()).toEqual({ n: 1 });
  });

  it("never caches non-200 responses or Authorization-bearing requests", async () => {
    const upstream = vi.fn(() =>
      Response.json({ error: "x" }, { status: 500 })
    );
    const app = buildApp(upstream);
    await app.request("/data");
    await app.request("/data");
    expect(upstream).toHaveBeenCalledTimes(2);

    const ok = vi.fn(() => pub({ n: 1 }));
    const authed = buildApp(ok);
    await authed.request("/data", { headers: { Authorization: "Bearer t" } });
    await authed.request("/data", { headers: { Authorization: "Bearer t" } });
    expect(ok).toHaveBeenCalledTimes(2);
    expect(cache.store.size).toBe(0);
  });

  it("passes through when the Cache API is unavailable", async () => {
    vi.stubGlobal("caches", undefined);
    const upstream = vi.fn(() => pub({ n: 1 }));
    const app = buildApp(upstream);
    await app.request("/data");
    await app.request("/data");
    expect(upstream).toHaveBeenCalledTimes(2);
  });
});

describe("edgeCache degraded responses", () => {
  it("does not store a 200 that the handler did not mark public", async () => {
    const upstream = vi.fn(() => Response.json({ degraded: true }));
    const app = new Hono<{ Bindings: Env }>();
    app.get("/d", edgeCache({ ttl: 60, swr: 600 }), () => upstream());
    await app.request("/d");
    await app.request("/d");
    expect(upstream).toHaveBeenCalledTimes(2);
  });
});
