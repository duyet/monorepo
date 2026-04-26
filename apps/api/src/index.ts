/**
 * API Entry Point
 * Hono-based API for Cloudflare Workers
 * @module index
 */

import { Hono } from "hono";
import aiPercentageRouter from "./routes/ai-percentage.js";
import cardDescriptionStreamingRouter from "./routes/card-description-streaming.js";

/**
 * Cloudflare Workers bindings interface
 */
export interface Env {
  OPENROUTER_API_KEY?: string;
  CLICKHOUSE_HOST?: string;
  CLICKHOUSE_PORT?: string;
  CLICKHOUSE_USER?: string;
  CLICKHOUSE_PASSWORD?: string;
  CLICKHOUSE_DATABASE?: string;
  CLICKHOUSE_PROTOCOL?: string;
}

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
 * Register LLM card description streaming routes
 */
app.route("/api/llm/generate", cardDescriptionStreamingRouter);

/**
 * Register AI percentage routes
 */
app.route("/api/ai/percentage", aiPercentageRouter);

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
