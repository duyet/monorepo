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
  if (!(await timingSafeEqual(token, expectedToken))) {
    return c.json(
      { error: "Unauthorized", message: "Invalid token" },
      401
    );
  }

  await next();
}

/**
 * Timing-safe string comparison using Web Crypto HMAC.
 * Both strings are HMAC'd with the same key, then compared.
 * This avoids timing side-channels from byte-by-byte comparison.
 */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const [macA, macB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);
  // Compare the HMAC outputs — same length, constant-time via ArrayBuffer
  const viewA = new Uint8Array(macA);
  const viewB = new Uint8Array(macB);
  if (viewA.length !== viewB.length) return false;
  let diff = 0;
  for (let i = 0; i < viewA.length; i++) {
    diff |= viewA[i] ^ viewB[i];
  }
  return diff === 0;
}
