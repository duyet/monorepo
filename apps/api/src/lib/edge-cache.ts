/**
 * Workers Cache API layer for public, idempotent GET JSON routes.
 *
 * - `caches.default` with explicit TTL + stale-while-revalidate, so repeat
 *   requests in a colo never reach ClickHouse/WakaTime/etc.
 * - Cache keys are normalized (tracking params dropped, params sorted).
 * - Concurrent misses for one key share a single upstream run.
 * - ETag / If-None-Match -> 304.
 *
 * Only for responses that are identical for every caller. Authorization-bearing
 * requests bypass it. Per-request headers (CORS) are re-applied through
 * `decorate`, never stored.
 * @module lib/edge-cache
 */

import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "../env.js";

const CACHED_AT_HEADER = "x-edge-cached-at";
const TRACKING_PARAM =
  /^(utm_.+|fbclid|gclid|dclid|msclkid|mc_[ce]id|_ga|ref)$/i;

export interface EdgeCacheOptions {
  /** Seconds a stored response is served without revalidation. */
  ttl: number;
  /** Extra seconds a stored response is kept to serve if revalidation fails; also advertised as stale-while-revalidate to clients. */
  swr: number;
  /** Applied to every response (hit, stale, 304, miss), e.g. per-origin CORS. */
  /** Rewrite the URL before keying, e.g. clamp a numeric param to its canonical value. */
  canonicalize?: (url: URL) => void;
  decorate?: (request: Request, headers: Headers) => void;
}

interface Snapshot {
  status: number;
  contentType: string;
  body: string;
}

const inflight = new Map<string, Promise<Snapshot | null>>();

/** Drop tracking params and sort the rest so equivalent URLs share a key. */
export function normalizeCacheUrl(
  rawUrl: string,
  canonicalize?: (url: URL) => void
): string {
  const url = new URL(rawUrl);
  canonicalize?.(url);
  const kept = [...url.searchParams.entries()]
    .filter(([key]) => !TRACKING_PARAM.test(key))
    .sort(([a, av], [b, bv]) =>
      a === b ? av.localeCompare(bv) : a.localeCompare(b)
    );
  url.search = "";
  for (const [key, value] of kept) url.searchParams.append(key, value);
  url.hash = "";
  return url.toString();
}

async function etagOf(body: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(body)
  );
  const hex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `W/"${hex}"`;
}

function matchesEtag(header: string | undefined, etag: string): boolean {
  if (!header) return false;
  if (header.trim() === "*") return true;
  const strip = (v: string) => v.trim().replace(/^W\//, "");
  return header.split(",").some((v) => strip(v) === strip(etag));
}

function getCache(): Cache | null {
  const store = (globalThis as { caches?: { default?: Cache } }).caches;
  return store?.default ?? null;
}

async function respond(
  c: Context<{ Bindings: Env }>,
  snapshot: Snapshot,
  opts: EdgeCacheOptions,
  status: "HIT" | "STALE" | "MISS" | "COALESCED"
): Promise<Response> {
  const etag = await etagOf(snapshot.body);
  const headers = new Headers({
    "Cache-Control": `public, max-age=${opts.ttl}, stale-while-revalidate=${opts.swr}`,
    "Content-Type": snapshot.contentType,
    ETag: etag,
    "X-Edge-Cache": status,
  });
  // On a miss the handler already decorated its own response.
  if (status !== "MISS") opts.decorate?.(c.req.raw, headers);
  const res =
    snapshot.status === 200 && matchesEtag(c.req.header("If-None-Match"), etag)
      ? new Response(null, { status: 304, headers })
      : new Response(snapshot.body, { status: snapshot.status, headers });
  return res;
}

function waitUntil(c: Context<{ Bindings: Env }>, task: Promise<unknown>) {
  try {
    c.executionCtx.waitUntil(task);
  } catch {
    // No ExecutionContext (tests / non-Workers runtime): task still runs.
  }
}

async function store(
  cache: Cache,
  key: string,
  snapshot: Snapshot,
  opts: EdgeCacheOptions
) {
  await cache.put(
    key,
    new Response(snapshot.body, {
      headers: {
        "Cache-Control": `public, max-age=${opts.ttl + opts.swr}`,
        "Content-Type": snapshot.contentType,
        [CACHED_AT_HEADER]: String(Date.now()),
      },
    })
  );
}

/**
 * Hono middleware: put in front of the handler of a public GET route.
 * Only status-200 responses are stored. Within `ttl` a stored response is
 * served as-is; between `ttl` and `ttl + swr` the handler runs again and the
 * stored copy is served only if that run fails (stale-if-error), so a dead
 * upstream never turns a cached dashboard into a 500.
 */
export function edgeCache(
  opts: EdgeCacheOptions
): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const cache = getCache();
    if (c.req.method !== "GET" || c.req.header("Authorization") || !cache) {
      return next();
    }

    const key = normalizeCacheUrl(c.req.url, opts.canonicalize);
    const cacheKey = new Request(key);

    let stale: Snapshot | null = null;
    const hit = await cache.match(cacheKey).catch(() => undefined);
    if (hit) {
      const ageSeconds =
        (Date.now() - Number(hit.headers.get(CACHED_AT_HEADER) ?? 0)) / 1000;
      if (ageSeconds <= opts.ttl + opts.swr) {
        const snapshot: Snapshot = {
          status: hit.status,
          contentType: hit.headers.get("Content-Type") ?? "application/json",
          body: await hit.text(),
        };
        if (ageSeconds <= opts.ttl) {
          c.res = await respond(c, snapshot, opts, "HIT");
          return;
        }
        stale = snapshot;
      }
    }

    const existing = inflight.get(key);
    if (existing) {
      const shared = await existing;
      if (shared) {
        c.res = await respond(c, shared, opts, "COALESCED");
        return;
      }
      if (stale) {
        c.res = await respond(c, stale, opts, "STALE");
        return;
      }
      return next();
    }

    let resolveRun!: (value: Snapshot | null) => void;
    inflight.set(
      key,
      new Promise<Snapshot | null>((resolve) => {
        resolveRun = resolve;
      })
    );

    let snapshot: Snapshot | null = null;
    try {
      await next();
      snapshot = await snapshotOf(c.res);
    } catch (error) {
      if (!stale) throw error;
      console.error("edge-cache revalidation failed, serving stale:", error);
    } finally {
      resolveRun(snapshot);
      inflight.delete(key);
    }

    if (snapshot) {
      waitUntil(
        c,
        store(cache, cacheKey.url, snapshot, opts).catch(() => undefined)
      );
      c.res = await respond(c, snapshot, opts, "MISS");
    } else if (stale) {
      c.res = await respond(c, stale, opts, "STALE");
    }
  };
}

async function snapshotOf(res: Response): Promise<Snapshot | null> {
  // Handlers opt in per response; degraded 200s carry no public Cache-Control.
  if (
    res.status !== 200 ||
    !/\bpublic\b/.test(res.headers.get("Cache-Control") ?? "")
  ) {
    return null;
  }
  return {
    status: res.status,
    contentType: res.headers.get("Content-Type") ?? "application/json",
    body: await res.clone().text(),
  };
}
