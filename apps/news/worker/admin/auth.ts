import type { Env } from "../types.js";

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
