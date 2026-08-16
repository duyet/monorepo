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

/** Inserts (or re-activates) a subscriber. `lang` defaults to 'vi' unless 'en' is explicitly given. */
export async function subscribe(
  env: Env,
  email: unknown,
  lang: unknown
): Promise<{ ok: true } | SubscribeError> {
  if (!isValidEmail(email)) {
    return { error: "invalid email", status: 400 };
  }
  const normalizedLang = lang === "en" ? "en" : "vi";
  const token = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO subscribers (email, lang, created_at, confirmed, unsubscribe_token)
     VALUES (?, ?, ?, 1, ?)
     ON CONFLICT(email) DO UPDATE SET
       lang = excluded.lang, confirmed = 1`
  )
    .bind(email, normalizedLang, Date.now(), token)
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
