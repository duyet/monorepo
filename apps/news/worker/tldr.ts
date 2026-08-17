import { generateTldr } from "./llm.js";
import { toEpochSeconds } from "./time.js";
import type { Env } from "./types.js";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Re-run the daily snapshot this often so the homepage TL;DR tracks
 * stories that land after the first successful generate of the day. */
export const TLDR_REFRESH_MS = 3 * 60 * 60 * 1000;

interface ItemRow {
  id: string;
  title: string;
  summary: string | null;
}

const TOP_ITEMS_SQL = `SELECT id, title, summary FROM items
     WHERE status = 'published' AND published_at >= ?
     ORDER BY rank_score DESC
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

/** A TL;DR result is only worth persisting if it actually has bullets. */
export function shouldPersistTldr(result: {
  bullets_en: unknown[];
  bullets_vi: unknown[];
}): boolean {
  return result.bullets_en.length > 0 || result.bullets_vi.length > 0;
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
  const date = todayUtc();

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
    return { generated: false, tokens: 0, reason: "no published items in window" };

  const tldr = await generateTldr(
    env,
    results.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary ?? undefined,
    }))
  );

  // Never write an empty snapshot: an empty row would satisfy the
  // `existing` gate above and block regeneration for the rest of the day,
  // even though the LLM call is retried hourly by the workflow's cron.
  if (!shouldPersistTldr(tldr)) {
    console.error("generateTldr returned no bullets; skipping snapshot write");
    return {
      generated: false,
      tokens: tldr.tokens,
      reason: "LLM returned no bullets",
    };
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
      JSON.stringify(tldr.bullets_en),
      JSON.stringify(tldr.bullets_vi),
      Date.now()
    )
    .run();

  return {
    generated: true,
    tokens: tldr.tokens,
    reason: `generated ${tldr.bullets_en.length + tldr.bullets_vi.length} bullets`,
  };
}
