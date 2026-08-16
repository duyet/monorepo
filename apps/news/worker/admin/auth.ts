import type { Env } from "../types.js";
import { isClerkAdmin, verifyClerkToken } from "./clerk.js";

/**
 * Constant-time byte comparison. Consumes both operands up to the max of
 * their lengths (no early return on length mismatch) so response timing
 * does not trivially leak whether the token length matched.
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    const x = i < a.length ? a[i] : 0;
    const y = i < b.length ? b[i] : 0;
    diff |= x ^ y;
  }
  return diff === 0;
}

/**
 * Validates the `Authorization: Bearer <token>` header against
 * `env.NEWS_ADMIN_TOKEN`. Returns a `Response` to short-circuit the request
 * (500 if the admin API isn't configured, 401 if the token is wrong), or
 * `null` to signal the caller should proceed.
 */
export function checkAuth(request: Request, env: Env): Response | null {
  if (!env.NEWS_ADMIN_TOKEN) {
    return Response.json({ error: "admin API disabled" }, { status: 500 });
  }

  const authHeader = request.headers.get("Authorization") ?? "";
  const match = authHeader.match(/^Bearer (.+)$/);
  const token = match?.[1] ?? "";

  const encoder = new TextEncoder();
  const ok = timingSafeEqual(
    encoder.encode(token),
    encoder.encode(env.NEWS_ADMIN_TOKEN)
  );

  if (!ok) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  return null;
}

function bearerToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization") ?? "";
  const match = authHeader.match(/^Bearer (.+)$/);
  return match?.[1] ?? null;
}

/**
 * True when the request's bearer token resolves to an admin via either
 * mechanism: the static `NEWS_ADMIN_TOKEN`, or a valid Clerk session JWT
 * belonging to an admin user (see `worker/admin/clerk.ts`).
 */
export async function isRequestAdmin(
  request: Request,
  env: Env
): Promise<boolean> {
  const token = bearerToken(request);
  if (!token) return false;

  if (env.NEWS_ADMIN_TOKEN) {
    const encoder = new TextEncoder();
    if (
      timingSafeEqual(encoder.encode(token), encoder.encode(env.NEWS_ADMIN_TOKEN))
    ) {
      return true;
    }
  }

  const payload = await verifyClerkToken(token, env);
  if (payload && isClerkAdmin(payload, env)) return true;

  return false;
}

/**
 * Admin-route gate: passes (returns `null`) when the bearer token is
 * either the correct `NEWS_ADMIN_TOKEN` or a valid Clerk session JWT of an
 * admin user. Otherwise short-circuits with a `Response` (401), matching
 * `checkAuth`'s contract. Unlike `checkAuth`, does not 500 when
 * `NEWS_ADMIN_TOKEN` is unset — Clerk-only admin auth is a valid config.
 */
export async function checkAdminAuth(
  request: Request,
  env: Env
): Promise<Response | null> {
  if (await isRequestAdmin(request, env)) return null;
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
