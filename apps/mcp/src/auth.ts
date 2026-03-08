/**
 * Bearer token authentication middleware for Hono.
 *
 * Checks the Authorization header against the MCP_AUTH_TOKEN secret.
 * Returns 401 JSON on mismatch or missing token.
 */

import type { Context, Next } from "hono";
import type { Env } from "./types";

export async function authMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
): Promise<Response | undefined> {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { error: "Unauthorized", message: "Bearer token required" },
      401
    );
  }

  const token = authHeader.slice(7); // strip "Bearer "
  const expectedToken = c.env.MCP_AUTH_TOKEN;

  if (!expectedToken) {
    // If no token configured, deny all requests to avoid open access
    return c.json(
      {
        error: "Service misconfigured",
        message: "MCP_AUTH_TOKEN is not set",
      },
      503
    );
  }

  // Constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(token, expectedToken)) {
    return c.json(
      { error: "Unauthorized", message: "Invalid token" },
      401
    );
  }

  await next();
}

/**
 * Timing-safe string comparison.
 * Falls back to a simple XOR loop since Workers don't expose crypto.timingSafeEqual.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
