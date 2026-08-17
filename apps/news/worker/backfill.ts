/**
 * Pure helpers for the "backfill" workflow steps that fill in
 * summary/image_url for items that predate the enrichment pipeline (or
 * were enriched from a source that had nothing usable at the time), and
 * then translate whatever summaries exist but lack a Vietnamese one.
 */

export const BACKFILL_CONTENT_CAP = 15;
export const BACKFILL_TRANSLATE_CAP = 15;
export const BACKFILL_SCORE_CAP = 15;
export const BACKFILL_BATCH_SIZE = 4;

/** Published items still missing a summary, oldest-content-first isn't the
 * point — most-recently-published first, so the backlog drains starting
 * from what readers are most likely to open. */
export function buildMissingSummaryQuery(limit = BACKFILL_CONTENT_CAP): string {
  return `SELECT id, url, source_id, image_url FROM items
          WHERE status = 'published' AND (summary IS NULL OR summary = '')
          ORDER BY published_at DESC
          LIMIT ${limit}`;
}

/**
 * Published items that already have an English summary but no Vietnamese
 * translation of it yet. Evaluated fresh each run, so it naturally picks
 * up items the content-backfill step just gave a summary to in the same
 * run, with no need to union result sets in application code.
 */
export function buildMissingTranslationQuery(
  limit = BACKFILL_TRANSLATE_CAP
): string {
  return `SELECT i.id, i.title, i.summary FROM items i
          WHERE i.status = 'published' AND i.summary IS NOT NULL AND i.summary != ''
          AND NOT EXISTS (
            SELECT 1 FROM translations t
            WHERE t.item_id = i.id AND t.lang = 'vi'
              AND t.summary IS NOT NULL AND t.summary != ''
          )
          ORDER BY i.published_at DESC
          LIMIT ${limit}`;
}

/** Published items that never got a score (empty tags and no category).
 * Most-recent first so today's feed heals before the long tail. */
export function buildUnscoredItemsQuery(limit = BACKFILL_SCORE_CAP): string {
  return `SELECT id, title, summary, source_id, points, comments, published_at
          FROM items
          WHERE status = 'published'
            AND (category IS NULL OR category = '')
            AND (tags IS NULL OR tags = '' OR tags = '[]')
          ORDER BY published_at DESC
          LIMIT ${limit}`;
}

/** HuggingNews items don't have their slug/topic stored separately — but
 * the item's own canonical url IS `https://huggingnews.com/<topic>/<slug>`,
 * so the detail page is just that url with `/__data.json` appended. */
export function huggingNewsDetailUrl(itemUrl: string): string {
  return `${itemUrl}/__data.json`;
}

export interface BackfillFetchResult {
  summary?: string;
  imageUrl?: string;
}

export interface BackfillPlan {
  summary: string;
  imageUrl: string | null;
}

/**
 * Decides what to persist for a backfill candidate. Returns null when
 * nothing usable was fetched (leave the item as-is; it stays in the
 * backlog for a future run). `existing.imageUrl` always wins over a
 * freshly-fetched one — this is the "never overwrite a non-empty existing
 * value" rule, expressed the same way the caller's `COALESCE(image_url, ?)`
 * update expresses it in SQL, but tested here without a database.
 */
export function planBackfillUpdate(
  existing: { imageUrl: string | null },
  fetched: BackfillFetchResult
): BackfillPlan | null {
  if (!fetched.summary) return null;
  return {
    summary: fetched.summary,
    imageUrl: existing.imageUrl || fetched.imageUrl || null,
  };
}
