import { listUnsubscribeHeaders } from "../mail/render.js";
import type { Env } from "../types.js";
import { DEFAULT_TIMEZONE, isValidTimezone } from "./handlers.js";

export interface TldrBulletLike {
  text: string;
  item_id?: string;
  item_ids?: string[];
}

/** Newer snapshots store `item_ids: string[]`; older rows used `item_id`. */
export function primaryItemId(bullet: TldrBulletLike): string | undefined {
  if (typeof bullet.item_id === "string" && bullet.item_id)
    return bullet.item_id;
  const ids = bullet.item_ids;
  if (Array.isArray(ids)) {
    const first = ids.find(
      (id): id is string => typeof id === "string" && id.length > 0
    );
    if (first) return first;
  }
  return undefined;
}

export interface SubscriberRow {
  email: string;
  lang: string;
  unsubscribe_token: string;
  timezone: string | null;
  last_sent_date: string | null;
}

export interface TldrSnapshotRow {
  date: string;
  bullets_en: string | null;
  bullets_vi: string | null;
  sent_at: number | null;
}

const SITE_URL = "https://news.duyet.net";
const FROM_ADDRESS = "news@duyet.net";
const MAX_BULLETS = 5;
/** Digests only go out from this local hour onward — no 3am emails. */
export const DIGEST_LOCAL_HOUR = 7;

/** Parses and caps a snapshot's bullets JSON column to the top N. */
export function topBullets(
  bulletsJson: string | null,
  max = MAX_BULLETS
): TldrBulletLike[] {
  if (!bulletsJson) return [];
  try {
    const parsed = JSON.parse(bulletsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, max).map((b: Record<string, unknown>) => {
      const itemIds = Array.isArray(b.item_ids) ? (b.item_ids as string[]) : [];
      const item_id =
        typeof b.item_id === "string" && b.item_id
          ? b.item_id
          : itemIds[0];
      return { text: String(b.text ?? ""), item_id };
    });
  } catch {
    return [];
  }
}

/** A snapshot is usable for a digest once it has bullets in at least one
 * language — no longer gated on `sent_at`, which is per-run/global and
 * can't express "has this specific subscriber, in their timezone, been
 * sent today's digest yet." That gate is now per-subscriber; see
 * `shouldSendForSubscriber`. `sent_at` is still stamped as a legacy
 * "this snapshot has been processed at least once" signal, but nothing
 * reads it to decide whether to send. */
export function snapshotHasBullets(
  snapshot: Pick<TldrSnapshotRow, "bullets_en" | "bullets_vi">
): boolean {
  return (
    topBullets(snapshot.bullets_en).length > 0 ||
    topBullets(snapshot.bullets_vi).length > 0
  );
}

/**
 * Computes a subscriber's current local hour (0-23) and local calendar
 * date (YYYY-MM-DD) for `nowMs`, in `timezone`. Falls back to
 * DEFAULT_TIMEZONE for an invalid/unrecognized timezone string.
 */
export function getLocalHourAndDate(
  nowMs: number,
  timezone: string | null | undefined
): { hour: number; date: string } {
  const tz = isValidTimezone(timezone) ? timezone : DEFAULT_TIMEZONE;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(nowMs)).map((p) => [p.type, p.value])
  );
  // Some engines report midnight as hour "24" under hour12:false.
  const hour = Number(parts.hour) % 24;
  return { hour, date: `${parts.year}-${parts.month}-${parts.day}` };
}

/** A subscriber gets today's digest once it's at/after their local
 * DIGEST_LOCAL_HOUR and they haven't already received one for this local
 * date. */
export function shouldSendForSubscriber(
  sub: Pick<SubscriberRow, "last_sent_date">,
  localHour: number,
  localDate: string
): boolean {
  if (localHour < DIGEST_LOCAL_HOUR) return false;
  return sub.last_sent_date !== localDate;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Builds the plain-text and HTML bodies for a subscriber's daily digest email. */
export function buildDigestEmail(
  date: string,
  bullets: TldrBulletLike[],
  lang: string,
  unsubscribeToken: string
): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `${SITE_URL}/subscribe?unsubscribe=${unsubscribeToken}`;
  const title = `AI News TL;DR — ${date}`;
  const footerText =
    lang === "vi"
      ? `Hủy đăng ký: ${unsubscribeUrl}`
      : `Unsubscribe: ${unsubscribeUrl}`;
  const footerHtml =
    lang === "vi"
      ? `Hủy đăng ký tại <a href="${unsubscribeUrl}">${unsubscribeUrl}</a>`
      : `Unsubscribe at <a href="${unsubscribeUrl}">${unsubscribeUrl}</a>`;

  const items = bullets.slice(0, MAX_BULLETS);
  const textLines = items.map((b, i) => `${i + 1}. ${b.text}`);
  const htmlItems = items
    .map((b) => `<li>${escapeHtml(b.text)}</li>`)
    .join("\n");

  const text = `${title}\n\n${textLines.join("\n")}\n\n${SITE_URL}\n\n${footerText}`;
  const html = `<h1>${escapeHtml(title)}</h1>
<ol>
${htmlItems}
</ol>
<p><a href="${SITE_URL}">${SITE_URL}</a></p>
<p style="color:#888;font-size:12px">${footerHtml}</p>`;

  return { subject: title, html, text };
}

/**
 * Sends the TL;DR digest (top 5 bullets, per-subscriber language) to every
 * confirmed subscriber whose local time has reached DIGEST_LOCAL_HOUR and
 * who hasn't already received one for their current local date. Runs every
 * hour (called once per ingest run); each subscriber's own timezone
 * decides whether *this* run is their moment to send, so the same
 * function naturally fans a single daily send out across a whole day of
 * hourly runs as different timezones cross 7am. Always uses the latest
 * snapshot (by date), even if it's "yesterday" UTC for someone west of
 * UTC — freshness within a day doesn't matter here.
 *
 * A per-subscriber failure is logged and swallowed without stamping
 * `last_sent_date`, so that subscriber is retried on the next hourly run.
 * No-ops entirely if the EMAIL binding isn't configured, or there's no
 * snapshot with bullets yet — this must never break the hourly ingest
 * workflow.
 */
export async function sendDailyTldr(env: Env): Promise<number> {
  if (!env.EMAIL) {
    console.error("EMAIL binding not configured; skipping daily digest");
    return 0;
  }

  const snapshot = await env.DB.prepare(
    "SELECT date, bullets_en, bullets_vi, sent_at FROM tldr_snapshots ORDER BY date DESC LIMIT 1"
  ).first<TldrSnapshotRow>();

  if (!snapshot || !snapshotHasBullets(snapshot)) return 0;

  const { results: subscribers } = await env.DB.prepare(
    "SELECT email, lang, unsubscribe_token, timezone, last_sent_date FROM subscribers WHERE confirmed = 1"
  ).all<SubscriberRow>();

  if (!subscribers || subscribers.length === 0) return 0;

  const now = Date.now();
  let emailsSent = 0;

  for (const sub of subscribers) {
    const { hour, date: localDate } = getLocalHourAndDate(now, sub.timezone);
    if (!shouldSendForSubscriber(sub, hour, localDate)) continue;

    const bullets = topBullets(
      sub.lang === "en" ? snapshot.bullets_en : snapshot.bullets_vi
    );
    if (bullets.length === 0) continue;

    const { subject, html, text } = buildDigestEmail(
      snapshot.date,
      bullets,
      sub.lang,
      sub.unsubscribe_token
    );

    try {
      await env.EMAIL.send({
        to: sub.email,
        from: { email: FROM_ADDRESS, name: "AI News" },
        subject,
        html,
        text,
        headers: listUnsubscribeHeaders(sub.unsubscribe_token),
      });
      await env.DB.prepare(
        "UPDATE subscribers SET last_sent_date = ? WHERE email = ?"
      )
        .bind(localDate, sub.email)
        .run();
      emailsSent++;
    } catch (error) {
      console.error(`digest send failed for ${sub.email}:`, error);
      // Deliberately do NOT stamp last_sent_date — retried next hour.
    }
  }

  // Legacy signal only: marks that this snapshot has been processed at
  // least once. Nothing reads this to decide whether to send anymore
  // (that's per-subscriber via last_sent_date above); kept for any
  // existing dashboard/tooling that still looks at it.
  await env.DB.prepare(
    "UPDATE tldr_snapshots SET sent_at = COALESCE(sent_at, ?) WHERE date = ?"
  )
    .bind(now, snapshot.date)
    .run();

  return emailsSent;
}
