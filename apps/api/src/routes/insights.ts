/**
 * Insights dashboard route.
 * The upstream fetchers live in ../lib/insights.ts; this module only owns the
 * HTTP surface (CORS, caching, partial-failure merge).
 * @module routes/insights
 */

import { Hono, type Context } from "hono";
import type { Env } from "../env.js";
import {
  emptyOverview,
  getAiOverview,
  getCloudflareOverview,
  getPostHogOverview,
  getWakaOverview,
} from "../lib/insights.js";

const insightsRouter = new Hono<{ Bindings: Env }>();
const FALLBACK_CORS_ORIGIN = "https://insights.duyet.net";

function setCors(c: Context<{ Bindings: Env }>) {
  const origin = c.req.header("Origin");
  const allowedOrigin =
    origin &&
    (/^https:\/\/(insights\.)?duyet\.net$/.test(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))
      ? origin
      : FALLBACK_CORS_ORIGIN;

  c.header("Access-Control-Allow-Origin", allowedOrigin);
  c.header("Vary", "Origin");
}

insightsRouter.get("/overview", async (c) => {
  try {
    const [ai, waka, cloudflare, posthog] = await Promise.allSettled([
      getAiOverview(c.env),
      getWakaOverview(c.env),
      getCloudflareOverview(c.env),
      getPostHogOverview(c.env),
    ]);

    setCors(c);
    c.header(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=3600"
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
});

insightsRouter.options("*", (c) => {
  setCors(c);
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.body(null, 204);
});

export default insightsRouter;
