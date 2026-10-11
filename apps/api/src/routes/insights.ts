/**
 * Insights dashboard route.
 * The upstream fetchers live in ../lib/insights.ts; this module only owns the
 * HTTP surface (CORS, caching, partial-failure merge).
 * @module routes/insights
 */

import { Hono, type Context } from "hono";
import type { Env } from "../env.js";
import { edgeCache } from "../lib/edge-cache.js";
import {
  emptyOverview,
  getAiOverview,
  getCloudflareOverview,
  getPostHogOverview,
  getWakaOverview,
} from "../lib/insights.js";

const insightsRouter = new Hono<{ Bindings: Env }>();
const OVERVIEW_TTL = 300;
const OVERVIEW_SWR = 3600;
const FALLBACK_CORS_ORIGIN = "https://insights.duyet.net";

function corsHeaders(request: Request, headers: Headers) {
  const origin = request.headers.get("Origin");
  const allowedOrigin =
    origin &&
    (/^https:\/\/(insights\.)?duyet\.net$/.test(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))
      ? origin
      : FALLBACK_CORS_ORIGIN;

  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  headers.set("Vary", "Origin");
}

function setCors(c: Context<{ Bindings: Env }>) {
  const headers = new Headers();
  corsHeaders(c.req.raw, headers);
  for (const [key, value] of headers) c.header(key, value);
}

insightsRouter.get(
  "/overview",
  edgeCache({ ttl: OVERVIEW_TTL, swr: OVERVIEW_SWR, decorate: corsHeaders }),
  async (c) => {
    try {
      let degraded = false;
      const [ai, waka, cloudflare, posthog] = await Promise.allSettled([
        getAiOverview(c.env, () => {
          degraded = true;
        }),
        getWakaOverview(c.env),
        getCloudflareOverview(c.env),
        getPostHogOverview(c.env),
      ]);

      setCors(c);
      // A degraded answer must not be stored, or it outlives the outage.
      c.header(
        "Cache-Control",
        degraded
          ? "no-store"
          : `public, max-age=${OVERVIEW_TTL}, stale-while-revalidate=${OVERVIEW_SWR}`
      );
      return c.json({
        ...emptyOverview(),
        ...(ai.status === "fulfilled" ? ai.value : {}),
        ...(waka.status === "fulfilled" ? waka.value : {}),
        ...(cloudflare.status === "fulfilled" ? cloudflare.value : {}),
        ...(posthog.status === "fulfilled" ? posthog.value : {}),
      });
    } catch (error) {
      console.error("Error fetching insights overview:", error);
      setCors(c);
      return c.json(emptyOverview());
    }
  }
);

insightsRouter.options("*", (c) => {
  setCors(c);
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.body(null, 204);
});

export default insightsRouter;
