import { nn } from "../d1-bind.js";
import {
  getLocalHourAndDate,
  primaryItemId,
  topBullets,
} from "../subscribe/send.js";
import { AUDIENCE_TIMEZONE } from "../time.js";
import type { Env } from "../types.js";
import { telegramNotifier } from "./telegram.js";
import type {
  DailyDigest,
  DigestBullet,
  Notifier,
  StoryPayload,
} from "./types.js";

/**
 * Channel-agnostic dispatch, deliberately non-spammy. Two kinds of posts:
 *
 * 1. Daily TL;DR digest — ONE message per local day per channel, the
 *    day's TL;DR snapshot bullets (VI preferred) each linked to its story.
 * 2. Trending stories — individual posts only when the ranking algo
 *    flags a story as exceptional (rank + importance bar), capped per day
 *    and spaced by a minimum gap.
 *
 * Delivery state lives in the `notifications` table: digest rows keyed
 * `digest:<date>`, story rows keyed by item id. Failed sends retry on
 * later hourly runs up to NOTIFY_MAX_ATTEMPTS.
 */

/** Registered delivery channels; add discord/... here. */
export const notifiers: Notifier[] = [telegramNotifier];

/** Calls each channel's enabled() so a half-configured deploy (chat id
 *  without token) throws instead of silently skipping sends. */
export function assertNotifyConfig(env: Env): void {
  for (const notifier of notifiers) {
    notifier.enabled(env);
  }
}

/** Audience timezone: the channel is Vietnamese-first. */
export const DIGEST_TIMEZONE = AUDIENCE_TIMEZONE;
/** Digests only go out from this local hour onward — no 3am posts. */
export const DIGEST_LOCAL_HOUR = 8;
/** TL;DR bullets per digest. */
export const DIGEST_MAX_BULLETS = 8;
/** Give up on a send for a channel after this many failed attempts. */
export const NOTIFY_MAX_ATTEMPTS = 3;

/** Trending bar: rank_score already folds importance × quality ×
 *  freshness × engagement, so a high absolute rank + a high LLM
 *  importance means "big story, breaking now". */
export const TRENDING_MIN_RANK = 25;
export const TRENDING_MIN_IMPORTANCE = 8;
/** At most this many trending posts per channel per local day. */
export const TRENDING_MAX_PER_DAY = 3;
/** Minimum spacing between any two posts on a channel. */
export const TRENDING_MIN_GAP_SEC = 2 * 60 * 60;
/** Only consider stories published in the last 24h. */
const WINDOW_SEC = 24 * 60 * 60;

/** The `notifications.item_id` sentinel for a day's digest. */
export function digestKey(localDate: string): string {
  return `digest:${localDate}`;
}

export type DigestSkipReason =
  | "sent"
  | "no_snapshot"
  | "already_sent"
  | "before_hour"
  | "send_failed";

export type TrendingSkipReason =
  | "sent"
  | "below_min_rank"
  | "budget_zero"
  | "none_unposted"
  | "send_failed";

export interface NotifyChannelReason {
  digest: DigestSkipReason;
  trending: TrendingSkipReason;
  maxRank: number | null;
  budget: number;
  localHour: number;
  localDate: string;
  digestError?: string;
}

export interface NotifyRunResult {
  sent: Record<string, number>;
  reasons: Record<string, NotifyChannelReason>;
}

interface NotificationRow {
  status: string;
  attempts: number;
}

/** Why today's digest will not go out, or null if it should send. */
export function classifyDigestSkip(
  existing: NotificationRow | null,
  localHour: number
): Extract<DigestSkipReason, "before_hour" | "already_sent"> | null {
  if (localHour < DIGEST_LOCAL_HOUR) return "before_hour";
  if (!existing) return null;
  if (existing.status === "failed" && existing.attempts < NOTIFY_MAX_ATTEMPTS) {
    return null;
  }
  return "already_sent";
}

/** Why trending will not post, or null if a candidate may be sent. */
export function classifyTrendingSkip(
  maxRank: number | null,
  budget: number,
  candidateCount: number
): Extract<
  TrendingSkipReason,
  "below_min_rank" | "budget_zero" | "none_unposted"
> | null {
  if (budget === 0) return "budget_zero";
  if ((maxRank ?? 0) < TRENDING_MIN_RANK) return "below_min_rank";
  if (candidateCount === 0) return "none_unposted";
  return null;
}

/** True when today's digest should go out for this channel: at/after the
 *  local send hour, and not already sent (failed rows retry while under
 *  the attempt cap). */
export function shouldSendDigest(
  existing: NotificationRow | null,
  localHour: number
): boolean {
  if (localHour < DIGEST_LOCAL_HOUR) return false;
  if (!existing) return true;
  return (
    existing.status === "failed" && existing.attempts < NOTIFY_MAX_ATTEMPTS
  );
}

/** Pure query builder: unposted trending candidates for a channel.
 *  VI translation's title/summary preferred, English fallback. */
export function buildTrendingQuery(
  channel: string,
  nowMs: number
): { sql: string; binds: [string, number, number, number] } {
  return {
    sql: `SELECT i.id, i.url,
                 COALESCE(tr.title, i.title) AS title,
                 COALESCE(tr.summary, i.summary) AS summary,
                 i.image_url, i.category,
                 i.points, i.comments, i.rank_score, i.llm_importance
          FROM items i
          LEFT JOIN notifications n ON n.item_id = i.id AND n.channel = ?
            AND (n.status = 'sent' OR n.attempts >= ${NOTIFY_MAX_ATTEMPTS})
          LEFT JOIN translations tr ON tr.item_id = i.id AND tr.lang = 'vi'
          WHERE i.status = 'published'
            AND i.published_at >= ?
            AND i.rank_score >= ?
            AND i.llm_importance >= ?
            AND n.item_id IS NULL
          ORDER BY i.rank_score DESC
          LIMIT ${TRENDING_MAX_PER_DAY}`,
    binds: [
      channel,
      Math.floor(nowMs / 1000) - WINDOW_SEC,
      TRENDING_MIN_RANK,
      TRENDING_MIN_IMPORTANCE,
    ],
  };
}

/** Window max rank, no threshold — so a skip can report live maxRank. */
export function buildMaxRankQuery(nowMs: number): {
  sql: string;
  binds: [number];
} {
  return {
    sql: `SELECT MAX(rank_score) AS max_rank FROM items
          WHERE status = 'published' AND published_at >= ?`,
    binds: [Math.floor(nowMs / 1000) - WINDOW_SEC],
  };
}

/** Per-channel per-day budget: how many more trending posts may go out
 *  now, given today's already-sent count and the time since the channel's
 *  last successful post. Pure for testability. */
export function trendingBudget(
  sentToday: number,
  lastPostedAtMs: number | null,
  nowMs: number
): number {
  if (sentToday >= TRENDING_MAX_PER_DAY) return 0;
  if (
    lastPostedAtMs !== null &&
    nowMs - lastPostedAtMs < TRENDING_MIN_GAP_SEC * 1000
  )
    return 0;
  // Respect the gap between our own posts within this run too: send one
  // per run at most, the next hourly run picks up the rest.
  return 1;
}

/** Epoch ms of local midnight for `nowMs` in `timezone` — the boundary
 *  for "how many trending posts already went out today". */
export function localDayStartMs(nowMs: number, timezone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(nowMs))
      .map((p) => [p.type, p.value])
  );
  const elapsedSec =
    (Number(parts.hour) % 24) * 3600 +
    Number(parts.minute) * 60 +
    Number(parts.second);
  return nowMs - elapsedSec * 1000 - (nowMs % 1000);
}

/** Loads the newest TL;DR snapshot and resolves each bullet's story
 *  permalink (VI bullets preferred). */
async function loadDigest(env: Env, date: string): Promise<DailyDigest | null> {
  // Bind the exact date: within the send window (08:00–24:00 local, UTC+7)
  // the local date always equals the snapshot's UTC date, and a missing
  // snapshot returns null so a later run retries instead of resending an
  // older day's digest.
  const snapshot = await env.DB.prepare(
    "SELECT date, bullets_en, bullets_vi FROM tldr_snapshots WHERE date = ?"
  )
    .bind(date)
    .first<{
      date: string;
      bullets_en: string | null;
      bullets_vi: string | null;
    }>();
  if (!snapshot) return null;

  const raw = topBullets(snapshot.bullets_vi, DIGEST_MAX_BULLETS);
  const bullets =
    raw.length > 0 ? raw : topBullets(snapshot.bullets_en, DIGEST_MAX_BULLETS);
  if (bullets.length === 0) return null;

  const resolved: DigestBullet[] = [];
  for (const bullet of bullets) {
    let url: string | null = null;
    const itemId = primaryItemId(bullet);
    if (itemId) {
      const item = await env.DB.prepare(
        "SELECT id, category FROM items WHERE id = ?"
      )
        .bind(itemId)
        .first<{ id: string; category: string | null }>();
      if (item) {
        const cat = (item.category ?? "ai").toLowerCase();
        url = `https://news.duyet.net/${cat}/${item.id.slice(0, 8)}`;
      }
    }
    resolved.push({ text: bullet.text, url });
  }
  return { date, bullets: resolved };
}

async function recordDelivery(
  env: Env,
  channel: string,
  target: string,
  key: string,
  result: { ok: boolean; messageId?: string; error?: string }
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO notifications (channel, item_id, target, status, attempts, message_id, last_error, posted_at)
     VALUES (?, ?, ?, ?, 1, ?, ?, ?)
     ON CONFLICT(channel, item_id) DO UPDATE SET
       status = excluded.status,
       attempts = notifications.attempts + 1,
       message_id = excluded.message_id,
       last_error = excluded.last_error,
       posted_at = excluded.posted_at`
  )
    .bind(
      nn(channel),
      nn(key),
      nn(target),
      result.ok ? "sent" : "failed",
      result.messageId ?? null,
      result.error ?? null,
      Date.now()
    )
    .run();
}

/** Best-effort dispatch; per-channel sent counts plus structured skip reasons. */
export async function dispatchStoryNotifications(
  env: Env
): Promise<NotifyRunResult> {
  assertNotifyConfig(env);

  const sent: Record<string, number> = {};
  const reasons: Record<string, NotifyChannelReason> = {};
  const now = Date.now();
  const { hour, date } = getLocalHourAndDate(now, DIGEST_TIMEZONE);
  const key = digestKey(date);
  const dayStartMs = localDayStartMs(now, DIGEST_TIMEZONE);

  const { sql: maxRankSql, binds: maxRankBinds } = buildMaxRankQuery(now);
  const maxRankRow = await env.DB.prepare(maxRankSql)
    .bind(...maxRankBinds)
    .first<{ max_rank: number | null }>();
  const maxRank = maxRankRow?.max_rank ?? null;

  let digest: DailyDigest | null | undefined;

  for (const notifier of notifiers) {
    if (!notifier.enabled(env)) continue;
    const target = notifier.target(env);
    sent[notifier.id] = 0;

    let digestReason: DigestSkipReason = "no_snapshot";
    let digestError: string | undefined;
    let trendingReason: TrendingSkipReason = "none_unposted";
    let budget = 0;

    // --- 1. Daily TL;DR digest (once per local day) ---
    const existing = await env.DB.prepare(
      "SELECT status, attempts FROM notifications WHERE channel = ? AND item_id = ?"
    )
      .bind(notifier.id, key)
      .first<NotificationRow>();

    const digestSkip = classifyDigestSkip(existing ?? null, hour);
    if (digestSkip) {
      digestReason = digestSkip;
    } else {
      if (digest === undefined) digest = await loadDigest(env, date);
      if (!digest) {
        digestReason = "no_snapshot";
      } else {
        let result: { ok: boolean; messageId?: string; error?: string };
        try {
          result = await notifier.sendDigest(env, digest);
        } catch (error) {
          result = {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
        if (!result.ok) {
          digestReason = "send_failed";
          digestError = result.error;
          console.error(
            `notify(${notifier.id}) digest failed: ${result.error}`
          );
        } else {
          digestReason = "sent";
        }
        await recordDelivery(env, notifier.id, target, key, result);
        if (result.ok) sent[notifier.id]++;
      }
    }

    // --- 2. Trending stories (algo-detected, rate-limited) ---
    const stats = await env.DB.prepare(
      `SELECT
         SUM(CASE WHEN item_id NOT LIKE 'digest:%' AND posted_at >= ? THEN 1 ELSE 0 END) AS sent_today,
         MAX(posted_at) AS last_posted_at
       FROM notifications WHERE channel = ? AND status = 'sent'`
    )
      .bind(dayStartMs, notifier.id)
      .first<{ sent_today: number | null; last_posted_at: number | null }>();

    // A digest sent seconds ago shouldn't block a genuine trending post
    // forever, but the gap keeps this run from double-posting: budget is
    // computed before this run's digest is counted.
    budget = trendingBudget(
      stats?.sent_today ?? 0,
      sent[notifier.id] > 0 ? null : (stats?.last_posted_at ?? null),
      now
    );

    const trendingSkip = classifyTrendingSkip(maxRank, budget, 1);
    if (trendingSkip === "budget_zero" || trendingSkip === "below_min_rank") {
      trendingReason = trendingSkip;
    } else {
      const { sql, binds } = buildTrendingQuery(notifier.id, now);
      const { results } = await env.DB.prepare(sql)
        .bind(...binds)
        .all<StoryPayload>();
      const candidates = results ?? [];
      const afterQuery = classifyTrendingSkip(
        maxRank,
        budget,
        candidates.length
      );
      if (afterQuery) {
        trendingReason = afterQuery;
      } else {
        for (const story of candidates.slice(0, budget)) {
          let result: { ok: boolean; messageId?: string; error?: string };
          try {
            result = await notifier.sendStory(env, story);
          } catch (error) {
            result = {
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
          if (!result.ok) {
            trendingReason = "send_failed";
            console.error(
              `notify(${notifier.id}) trending failed for ${story.id}: ${result.error}`
            );
          } else {
            trendingReason = "sent";
          }
          await recordDelivery(env, notifier.id, target, story.id, result);
          if (result.ok) sent[notifier.id]++;
        }
      }
    }

    reasons[notifier.id] = {
      digest: digestReason,
      trending: trendingReason,
      maxRank,
      budget,
      localHour: hour,
      localDate: date,
      digestError,
    };
  }

  const report: NotifyRunResult = { sent, reasons };
  console.info("notify", report);
  return report;
}
