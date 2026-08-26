import {
  checkRateLimit,
  hashIp,
  ONE_DAY_SEC,
} from "../rate-limit.js";
import {
  getBearerToken,
  timingSafeEqualStrings,
} from "@duyet/libs/workers-auth";
import type { Env } from "../types.js";
import { isClerkAdmin, verifyClerkToken } from "./clerk.js";

/** Per-IP failed admin auth attempts before 429. Tunable if shared NAT bites. */
const ADMIN_FAIL_LIMIT = 10;

async function adminFailKey(request: Request): Promise<string> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  return `admin-fail:${await hashIp(ip)}`;
}

/** Returns a 429 Response when the IP has exceeded failed auth attempts,
 * or null to proceed. Only applies when a bearer token is present. */
export async function checkAdminAuthRateLimit(
  request: Request,
  env: Env
): Promise<Response | null> {
  if (!getBearerToken(request)) return null;
  try {
    const key = await adminFailKey(request);
    const blocked = await checkRateLimit(env.DB, {
      table: "subscribe_attempts",
      column: "ip_hash",
      key,
      windowSec: ONE_DAY_SEC,
      limit: ADMIN_FAIL_LIMIT,
    });
    if (blocked) {
      return Response.json({ error: "too many attempts" }, { status: 429 });
    }
  } catch {
    // subscribe_attempts table may be absent in test stubs
  }
  return null;
}

async function recordAdminAuthFailure(
  request: Request,
  env: Env
): Promise<void> {
  if (!getBearerToken(request)) return;
  const key = await adminFailKey(request);
  try {
    await env.DB.prepare(
      "INSERT INTO subscribe_attempts (ip_hash, created_at) VALUES (?, ?)"
    )
      .bind(key, Date.now())
      .run();
  } catch {
    // subscribe_attempts table may not exist yet
  }
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

  const token = getBearerToken(request) ?? "";

  if (!timingSafeEqualStrings(token, env.NEWS_ADMIN_TOKEN)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  return null;
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
  const token = getBearerToken(request);
  if (!token) return false;

  if (
    env.NEWS_ADMIN_TOKEN &&
    timingSafeEqualStrings(token, env.NEWS_ADMIN_TOKEN)
  ) {
    return true;
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
  const rateLimited = await checkAdminAuthRateLimit(request, env);
  if (rateLimited) return rateLimited;
  if (await isRequestAdmin(request, env)) return null;
  await recordAdminAuthFailure(request, env);
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
