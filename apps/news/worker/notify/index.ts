import { nn } from "../d1-bind.js";
import type { Env } from "../types.js";
import { telegramNotifier } from "./telegram.js";
import type { Notifier, StoryPayload } from "./types.js";

/**
 * Channel-agnostic story dispatch: each enabled notifier gets the top
 * unposted stories above the rank threshold, delivery state is tracked
 * per (channel, item) in the `notifications` table, and failed sends
 * retry on later runs up to MAX_ATTEMPTS.
 */

/** Registered delivery channels; add discord/email-per-story here. */
export const notifiers: Notifier[] = [telegramNotifier];

/** Don't spam channels: only stories that cleared this rank. */
export const NOTIFY_MIN_RANK = 8;
/** Cap per channel per hourly run (Telegram: ~20 msgs/min per channel). */
export const NOTIFY_MAX_PER_RUN = 5;
/** Only consider stories published in the last 24h. */
const WINDOW_SEC = 24 * 60 * 60;
/** Give up on a story for a channel after this many failed sends. */
export const NOTIFY_MAX_ATTEMPTS = 3;

/** Pure query builder so the selection gate is unit-testable without D1.
 *  The audience is Vietnamese-first (@aihomnay): the VI translation's
 *  title/summary is preferred, falling back to the English original.
 *  Unsent stories and previously-failed sends (attempts < max) qualify. */
export function buildCandidatesQuery(
  channel: string,
  nowMs: number
): { sql: string; binds: [string, number, number, number] } {
  return {
    sql: `SELECT i.id, i.url,
                 COALESCE(tr.title, i.title) AS title,
                 COALESCE(tr.summary, i.summary) AS summary,
                 i.image_url, i.category,
                 i.points, i.comments, i.rank_score
          FROM items i
          LEFT JOIN notifications n ON n.item_id = i.id AND n.channel = ?
          LEFT JOIN translations tr ON tr.item_id = i.id AND tr.lang = 'vi'
          WHERE i.status = 'published'
            AND i.published_at >= ?
            AND i.rank_score >= ?
            AND (n.item_id IS NULL
                 OR (n.status = 'failed' AND n.attempts < ?))
          ORDER BY i.rank_score DESC
          LIMIT ${NOTIFY_MAX_PER_RUN}`,
    binds: [
      channel,
      Math.floor(nowMs / 1000) - WINDOW_SEC,
      NOTIFY_MIN_RANK,
      NOTIFY_MAX_ATTEMPTS,
    ],
  };
}

async function recordDelivery(
  env: Env,
  channel: string,
  target: string,
  itemId: string,
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
      nn(itemId),
      nn(target),
      result.ok ? "sent" : "failed",
      result.messageId ?? null,
      result.error ?? null,
      Date.now()
    )
    .run();
}

/** Best-effort dispatch across all channels; per-channel sent counts. */
export async function dispatchStoryNotifications(
  env: Env
): Promise<Record<string, number>> {
  const sent: Record<string, number> = {};

  for (const notifier of notifiers) {
    if (!notifier.enabled(env)) continue;
    const target = notifier.target(env);
    sent[notifier.id] = 0;

    const { sql, binds } = buildCandidatesQuery(notifier.id, Date.now());
    const { results } = await env.DB.prepare(sql)
      .bind(...binds)
      .all<StoryPayload>();

    for (const story of results ?? []) {
      let result: { ok: boolean; messageId?: string; error?: string };
      try {
        result = await notifier.send(env, story);
      } catch (error) {
        result = {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
      if (!result.ok)
        console.error(
          `notify(${notifier.id}) failed for ${story.id}: ${result.error}`
        );
      await recordDelivery(env, notifier.id, target, story.id, result);
      if (result.ok) sent[notifier.id]++;
    }
  }

  return sent;
}
