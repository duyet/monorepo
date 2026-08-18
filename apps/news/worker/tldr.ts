import { generateTldr, type TldrBullet } from "./llm.js";
import { getLocalHourAndDate } from "./subscribe/send.js";
import { AUDIENCE_TIMEZONE, toEpochSeconds } from "./time.js";
import type { Env } from "./types.js";

/** Re-run the daily snapshot this often so the homepage TL;DR tracks
 * stories that land after the first successful generate of the day. */
export const TLDR_REFRESH_MS = 3 * 60 * 60 * 1000;

interface ItemRow {
  id: string;
  title: string;
  summary: string | null;
  title_vi: string | null;
}

const TOP_ITEMS_SQL = `SELECT i.id, i.title, i.summary, tr.title AS title_vi
     FROM items i
     LEFT JOIN translations tr ON tr.item_id = i.id AND tr.lang = 'vi'
     WHERE i.status = 'published' AND i.published_at >= ?
     ORDER BY i.rank_score DESC
     LIMIT 16`;

/**
 * Pure query builder for the top-items lookup, so the gating logic
 * (published, fresh, ranked, capped at 16) can be verified without a D1
 * binding. `nowMs` is epoch milliseconds; `items.published_at` is stored
 * as epoch seconds, so the bound `since` value is normalized to seconds.
 */
export function buildTopItemsQuery(nowMs: number): {
  sql: string;
  since: number;
} {
  return {
    sql: TOP_ITEMS_SQL,
    since: toEpochSeconds(nowMs) - 24 * 60 * 60,
  };
}

/** Snapshot / digest calendar date: local day in Asia/Ho_Chi_Minh, not UTC. */
export function tldrSnapshotDate(nowMs: number = Date.now()): string {
  return getLocalHourAndDate(nowMs, AUDIENCE_TIMEZONE).date;
}

/** A TL;DR result is only worth persisting if it actually has bullets. */
export function shouldPersistTldr(result: {
  bullets_en: unknown[];
  bullets_vi: unknown[];
}): boolean {
  return result.bullets_en.length > 0 || result.bullets_vi.length > 0;
}

/**
 * Deterministic snapshot from already-stored item titles. EN uses the
 * item title; VI uses an existing translation title when present — never
 * invents Vietnamese. Used when the LLM returns no bullets so the daily
 * digest still has something to send.
 */
export function fallbackTldrFromItems(
  items: Array<{ id: string; title: string; title_vi?: string | null }>
): { bullets_en: TldrBullet[]; bullets_vi: TldrBullet[] } {
  const bullets_en: TldrBullet[] = [];
  const bullets_vi: TldrBullet[] = [];
  for (const item of items) {
    const title = item.title.trim();
    if (!title) continue;
    bullets_en.push({ text: title, item_ids: [item.id] });
    const vi = item.title_vi?.trim();
    if (vi) bullets_vi.push({ text: vi, item_ids: [item.id] });
  }
  return { bullets_en, bullets_vi };
}

export interface TldrRunStats {
  generated: boolean;
  tokens: number;
  /** Why the snapshot was (or wasn't) generated this run. */
  reason: string;
}

/** Idempotent daily gate: generates today's snapshot if missing, or
 * refreshes it when the last write is older than `TLDR_REFRESH_MS`. */
export async function ensureDailyTldr(env: Env): Promise<TldrRunStats> {
  const date = tldrSnapshotDate();

  const existing = await env.DB.prepare(
    "SELECT date, created_at FROM tldr_snapshots WHERE date = ?"
  )
    .bind(date)
    .first<{ date: string; created_at: number }>();
  if (existing) {
    const age = Date.now() - (existing.created_at ?? 0);
    if (age < TLDR_REFRESH_MS) {
      return {
        generated: false,
        tokens: 0,
        reason: `snapshot for ${date} is ${Math.round(age / 60000)}m old`,
      };
    }
  }

  const { sql, since } = buildTopItemsQuery(Date.now());
  const { results } = await env.DB.prepare(sql).bind(since).all<ItemRow>();

  if (!results || results.length === 0)
    return {
      generated: false,
      tokens: 0,
      reason: "no published items in window",
    };

  const tldr = await generateTldr(
    env,
    results.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary ?? undefined,
    }))
  );

  let bullets_en = tldr.bullets_en;
  let bullets_vi = tldr.bullets_vi;
  let persistReason: string | undefined;

  // Never write an empty snapshot: an empty row would satisfy the
  // `existing` gate above and block regeneration for the rest of the day.
  // If the LLM produced nothing, persist title-based bullets (existing
  // translations only — no invented Vietnamese) so the digest can send.
  if (!shouldPersistTldr(tldr)) {
    const fallback = fallbackTldrFromItems(results);
    if (!shouldPersistTldr(fallback)) {
      const detail = tldr.error ?? "returned no bullets";
      console.error(`generateTldr produced no persistable bullets: ${detail}`);
      return {
        generated: false,
        tokens: tldr.tokens,
        reason: `LLM failed: ${detail}`,
      };
    }
    bullets_en = fallback.bullets_en;
    bullets_vi = fallback.bullets_vi;
    persistReason = `LLM failed (${tldr.error ?? "no bullets"}); persisted ${fallback.bullets_en.length} title-fallback bullets`;
    console.error(persistReason);
  }

  await env.DB.prepare(
    `INSERT INTO tldr_snapshots (date, bullets_en, bullets_vi, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       bullets_en = excluded.bullets_en,
       bullets_vi = excluded.bullets_vi,
       created_at = excluded.created_at`
  )
    .bind(
      date,
      JSON.stringify(bullets_en),
      JSON.stringify(bullets_vi),
      Date.now()
    )
    .run();

  return {
    generated: true,
    tokens: tldr.tokens,
    reason:
      persistReason ??
      `generated ${bullets_en.length + bullets_vi.length} bullets`,
  };
}
