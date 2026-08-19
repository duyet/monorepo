import { checkRateLimit, hashIp, ONE_DAY_SEC } from "../rate-limit.js";
import { ensureMailSchema } from "../mail/schema.js";
import type { Env } from "../types.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

export function isValidEmail(email: unknown): email is string {
  return (
    typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email)
  );
}

/** True iff `tz` is a IANA timezone name `Intl` actually recognizes. Guards
 * against a subscriber-supplied string that isn't a real timezone (typo,
 * garbage, or a non-IANA offset like "UTC+7") reaching storage or, worse,
 * throwing later when it's used to format a date. */
export function isValidTimezone(tz: unknown): tz is string {
  if (typeof tz !== "string" || tz.length === 0) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export interface SubscribeError {
  error: string;
  status: number;
}

export function isSubscribeError(value: unknown): value is SubscribeError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error: unknown }).error === "string"
  );
}

export const SUBSCRIBE_SOURCES = ["blog", "news", "home"] as const;
export type SubscribeSource = (typeof SUBSCRIBE_SOURCES)[number];
const SUBSCRIBE_IP_LIMIT = 8;

export function normalizeSource(source: unknown): SubscribeSource {
  return SUBSCRIBE_SOURCES.includes(source as SubscribeSource)
    ? (source as SubscribeSource)
    : "news";
}

/** Inserts (or re-activates) a subscriber. `lang` defaults to 'vi' unless
 * 'en' is explicitly given. `timezone` defaults to DEFAULT_TIMEZONE unless
 * a valid IANA timezone string is given. */
export async function subscribe(
  env: Env,
  email: unknown,
  lang: unknown,
  timezone?: unknown,
  source?: unknown,
  ip?: string | null
): Promise<{ ok: true } | SubscribeError> {
  if (!isValidEmail(email)) {
    return { error: "invalid email", status: 400 };
  }
  const normalizedLang = lang === "en" ? "en" : "vi";
  const normalizedTimezone = isValidTimezone(timezone)
    ? timezone
    : DEFAULT_TIMEZONE;
  const normalizedSource = normalizeSource(source);
  const token = crypto.randomUUID();
  const now = Date.now();

  await ensureMailSchema(env.DB);

  if (ip) {
    const ipHash = await hashIp(ip);
    const blocked = await checkRateLimit(env.DB, {
      table: "subscribe_attempts",
      column: "ip_hash",
      key: ipHash,
      windowSec: ONE_DAY_SEC,
      limit: SUBSCRIBE_IP_LIMIT,
      now,
    });
    if (blocked) {
      return { error: "too many subscribe attempts", status: 429 };
    }
    await env.DB.prepare(
      "INSERT INTO subscribe_attempts (ip_hash, created_at) VALUES (?, ?)"
    )
      .bind(ipHash, now)
      .run();
  }

  await env.DB.prepare(
    `INSERT INTO subscribers (email, lang, timezone, created_at, confirmed, unsubscribe_token)
     VALUES (?, ?, ?, ?, 1, ?)
     ON CONFLICT(email) DO UPDATE SET
       lang = excluded.lang, timezone = excluded.timezone, confirmed = 1`
  )
    .bind(email, normalizedLang, normalizedTimezone, now, token)
    .run();

  await env.DB.prepare(
    `INSERT INTO subscriber_sources (email, source, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       source = excluded.source, updated_at = excluded.updated_at`
  )
    .bind(email, normalizedSource, now)
    .run();

  return { ok: true };
}

/** Removes a subscriber by their unsubscribe token. */
export async function unsubscribe(
  env: Env,
  token: unknown
): Promise<{ ok: true } | SubscribeError> {
  if (typeof token !== "string" || token.length === 0) {
    return { error: "token is required", status: 400 };
  }
  await env.DB.prepare("DELETE FROM subscribers WHERE unsubscribe_token = ?")
    .bind(token)
    .run();
  return { ok: true };
}
