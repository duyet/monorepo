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

/** Useful digest size: min(8, itemCount), and at least 2 when itemCount >= 2. */
export function usefulTldrFloor(itemCount: number): number {
  if (itemCount < 2) return Math.max(0, itemCount);
  return Math.min(8, itemCount);
}

/** True when the LLM digest is too thin for the ranked window (e.g. 1
 * leftover bullet while last-24h has 16 items). */
export function isThinTldr(
  result: { bullets_en: unknown[]; bullets_vi: unknown[] },
  itemCount: number
): boolean {
  const count = Math.max(result.bullets_en.length, result.bullets_vi.length);
  return count < usefulTldrFloor(itemCount);
}

function parseStoredBullets(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Refresh immediately when the snapshot is missing or thin. A useful
 * snapshot still waits `TLDR_REFRESH_MS` so we do not call the LLM every hour.
 */
export function shouldRefreshExistingSnapshot(opts: {
  existing:
    | {
        created_at: number;
        bullets_en: unknown[];
        bullets_vi: unknown[];
      }
    | null
    | undefined;
  itemCount: number;
  nowMs: number;
  refreshMs?: number;
}): boolean {
  if (!opts.existing) return true;
  if (isThinTldr(opts.existing, opts.itemCount)) return true;
  // EN-only snapshot: bilingual generate timed out / fell back. Refresh
  // immediately so a healthier chain can fill bullets_vi (otherwise the
  // 3h useful-snapshot gate leaves English TL;DR on the VI homepage).
  if (
    opts.existing.bullets_en.length > 0 &&
    opts.existing.bullets_vi.length === 0
  ) {
    return true;
  }
  return (
    opts.nowMs - (opts.existing.created_at ?? 0) >=
    (opts.refreshMs ?? TLDR_REFRESH_MS)
  );
}

/**
 * Deterministic snapshot from already-stored item titles. EN uses the
 * item title; VI uses `title_vi` when present, otherwise the same title
 * (never invents Vietnamese prose). Used when the LLM returns no bullets
 * or a thin digest so the daily snapshot still ranks the last-24h window.
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
    const vi = item.title_vi?.trim() || title;
    bullets_vi.push({ text: vi, item_ids: [item.id] });
  }
  return { bullets_en, bullets_vi };
}

export interface TldrRunStats {
  generated: boolean;
  tokens: number;
  /** Why the snapshot was (or wasn't) generated this run. */
  reason: string;
}

/** Idempotent daily gate: generates today's snapshot if missing or thin,
 * or refreshes a useful one when the last write is older than `TLDR_REFRESH_MS`. */
export async function ensureDailyTldr(env: Env): Promise<TldrRunStats> {
  const nowMs = Date.now();
  const date = tldrSnapshotDate(nowMs);

  const existing = await env.DB.prepare(
    "SELECT date, created_at, bullets_en, bullets_vi FROM tldr_snapshots WHERE date = ?"
  )
    .bind(date)
    .first<{
      date: string;
      created_at: number;
      bullets_en: string | null;
      bullets_vi: string | null;
    }>();

  const { sql, since } = buildTopItemsQuery(nowMs);
  const { results } = await env.DB.prepare(sql).bind(since).all<ItemRow>();

  const existingParsed = existing
    ? {
        created_at: existing.created_at ?? 0,
        bullets_en: parseStoredBullets(existing.bullets_en),
        bullets_vi: parseStoredBullets(existing.bullets_vi),
      }
    : null;

  if (
    !shouldRefreshExistingSnapshot({
      existing: existingParsed,
      itemCount: results?.length ?? 0,
      nowMs,
    })
  ) {
    const age = nowMs - (existingParsed?.created_at ?? 0);
    return {
      generated: false,
      tokens: 0,
      reason: `snapshot for ${date} is ${Math.round(age / 60000)}m old`,
    };
  }

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

  // Never write an empty or thin snapshot: a 1-bullet row would satisfy
  // the `existing` gate above and freeze a leftover line for TLDR_REFRESH_MS
  // even when last-24h has many ranked items. If the LLM produced nothing
  // (or too few bullets), persist title-based bullets — VI reuses the
  // English title when no translation exists, never invented prose.
  if (isThinTldr(tldr, results.length)) {
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
    persistReason = `LLM thin (${tldr.error ?? `${Math.max(tldr.bullets_en.length, tldr.bullets_vi.length)} bullets`}); persisted ${fallback.bullets_en.length} title-fallback bullets`;
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
