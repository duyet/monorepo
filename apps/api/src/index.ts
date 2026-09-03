/**
 * API Entry Point
 * Hono-based API for Cloudflare Workers
 * @module index
 */

import { Hono } from "hono";
import type { Env } from "./env.js";
import { openApiDocument } from "./lib/openapi.js";
import { consumeRateLimit, GLOBAL_RATE_LIMIT, secondsUntil } from "./lib/rate-limit.js";
import aiPercentageRouter from "./routes/ai-percentage.js";
import cardDescriptionStreamingRouter from "./routes/card-description-streaming.js";
import insightsRouter from "./routes/insights.js";
import submissionsRouter from "./routes/submissions.js";

/**
 * Main Hono application
 */
const app = new Hono<{ Bindings: Env }>({
  // Strict trailing slash handling
  strict: true,
});

/**
 * Security headers middleware
 */
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'"
  );
});

/**
 * Global per-IP rate-limit middleware.
 * Sets RateLimit-* headers (IETF draft
 * https-draft-ietf-httpapi-ratelimit-headers) on every response and
 * returns 429 with Retry-After once the bucket is exhausted.
 * Separate bucket namespace ("global:") from the stricter generate limiter.
 */
app.use("*", async (c, next) => {
  const ip = c.req.header("CF-Connecting-IP") || "anonymous";
  const now = Date.now();
  const limit = consumeRateLimit(
    `global:${ip}`,
    now,
    GLOBAL_RATE_LIMIT.max,
    GLOBAL_RATE_LIMIT.windowMs
  );

  c.header("RateLimit-Limit", String(GLOBAL_RATE_LIMIT.max));
  c.header("RateLimit-Remaining", String(limit.remaining));
  c.header("RateLimit-Reset", String(secondsUntil(limit.resetAt, now)));

  if (!limit.allowed) {
    c.header("Retry-After", String(secondsUntil(limit.resetAt, now)));
    return c.json({ error: "rate limited" }, 429);
  }

  await next();
});

/**
 * Health check endpoint
 */
app.get("/", (c) => {
  return c.json({
    name: "duyet.net API",
    version: "0.1.0",
    status: "healthy",
    endpoints: {
      health: "/",
      cardDescription: "/api/llm/generate",
      aiPercentage: "/api/ai/percentage",
      insights: "/api/insights",
      contact: "/api/contact",
      jd: "/api/jd",
      comments: "/api/comments",
    },
  });
});

/**
 * Health check endpoint
 */
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Published OpenAPI document (mirrored at https://duyet.net/openapi.json)
 */
app.get("/openapi.json", (c) => {
  c.header("Cache-Control", "public, max-age=300");
  return c.json(openApiDocument);
});

/**
 * Register LLM card description streaming routes.
 * Requires Authorization: Bearer <API_TOKEN|AGENT_API_TOKEN> and is rate-limited.
 */
app.route("/api/llm/generate", cardDescriptionStreamingRouter);

/**
 * Register AI percentage routes
 */
app.route("/api/ai/percentage", aiPercentageRouter);

/**
 * Register Insights data routes
 */
app.route("/api/insights", insightsRouter);

app.route("/", submissionsRouter);

/**
 * 404 handler
 */
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

/**
 * Error handler
 */
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

/**
 * Export for Cloudflare Workers
 */
export default app;
