import { scoreItems, setLlmCallLogger, translateItems } from "../llm.js";
import { createD1LlmCallLogger } from "../llm-call-log.js";
import { forceSendDigest } from "../notify/index.js";
import { rankScore } from "../ranking.js";
import { adapters } from "../sources/registry.js";
import { ensureDailyTldr, tldrSnapshotDate } from "../tldr.js";
import { normalizeTopics } from "../topics.js";
import type { Env } from "../types.js";

export async function writeAudit(
  env: Env,
  action: string,
  detail?: string
): Promise<void> {
  try {
    await env.DB.prepare(
      "INSERT INTO admin_audit (ts, action, detail) VALUES (?, ?, ?)"
    )
      .bind(Date.now(), action, detail ?? null)
      .run();
  } catch {
    // table not migrated yet
  }
}

/**
 * Same implementation as the private helper in worker/workflow.ts
 * (id = sha256 hex of the item url). Duplicated here rather than imported
 * because workflow.ts pulls in the `cloudflare:workers` module, which is
 * unavailable outside the Workers runtime (e.g. in the vitest node env).
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface HandlerError {
  error: string;
  status?: number;
}

export function isHandlerError(value: unknown): value is HandlerError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error: unknown }).error === "string"
  );
}

export interface PushItemInput {
  url: string;
  title: string;
  summary?: string;
  source_id?: string;
  /** Epoch milliseconds (matches `items.published_at`'s existing unit). Defaults to now. */
  published_at?: number;
  points?: number;
  comments?: number;
  category?: string;
  tags?: string[];
  title_vi?: string;
  summary_vi?: string;
  relevance?: number;
  importance?: number;
  quality?: number;
}

export interface PushItemsResult {
  inserted: number;
  updated: number;
  ids: string[];
}

/**
 * Upserts one or more externally-pushed items into `items` (and, when a
 * Vietnamese title is supplied, `translations`). Pushed items default to
 * source_id 'push' and status 'new' unless a score field (relevance /
 * importance / quality) is supplied, in which case they are considered
 * pre-scored and marked 'published' directly.
 *
 * Note: items inserted this way are *not* picked up by the hourly
 * workflow's scoring pass — its dedupe step skips ids that already exist
 * in `items`. A 'new' status pushed item keeps rank_score 0 until scored
 * by a future push or manual update. This is an accepted limitation.
 */
export async function pushItems(
  env: Env,
  itemsInput: PushItemInput | PushItemInput[]
): Promise<PushItemsResult | HandlerError> {
  const items = Array.isArray(itemsInput) ? itemsInput : [itemsInput];

  if (items.length === 0) {
    return { error: "no items provided", status: 400 };
  }
  for (const item of items) {
    if (
      !item ||
      typeof item.url !== "string" ||
      item.url.length === 0 ||
      typeof item.title !== "string" ||
      item.title.length === 0
    ) {
      return {
        error: "each item requires a non-empty url and title",
        status: 400,
      };
    }
  }

  const now = Date.now();
  const ids: string[] = [];
  let inserted = 0;
  let updated = 0;

  for (const item of items) {
    const id = await sha256Hex(item.url);
    ids.push(id);

    const sourceId = item.source_id ?? "push";
    const hasScore =
      item.relevance !== undefined ||
      item.importance !== undefined ||
      item.quality !== undefined;
    const status = hasScore ? "published" : "new";
    const publishedAt = item.published_at ?? now;

    const existing = await env.DB.prepare("SELECT id FROM items WHERE id = ?")
      .bind(id)
      .first();
    if (existing) updated++;
    else inserted++;

    await env.DB.prepare(
      `INSERT INTO items (
        id, source_id, external_id, url, title, summary,
        published_at, fetched_at, points, comments,
        llm_relevance, llm_importance, llm_quality, category, tags,
        rank_score, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        summary = excluded.summary,
        points = excluded.points,
        comments = excluded.comments,
        category = excluded.category,
        tags = excluded.tags,
        status = excluded.status`
    )
      .bind(
        id,
        sourceId,
        null,
        item.url,
        item.title,
        item.summary ?? null,
        publishedAt,
        now,
        item.points ?? 0,
        item.comments ?? 0,
        item.relevance ?? null,
        item.importance ?? null,
        item.quality ?? null,
        item.category ?? null,
        JSON.stringify(item.tags ?? []),
        0,
        status
      )
      .run();

    if (item.title_vi) {
      await env.DB.prepare(
        `INSERT INTO translations (item_id, lang, title, summary)
         VALUES (?, 'vi', ?, ?)
         ON CONFLICT(item_id, lang) DO UPDATE SET
           title = excluded.title, summary = excluded.summary`
      )
        .bind(id, item.title_vi, item.summary_vi ?? null)
        .run();
    }
  }

  return { inserted, updated, ids };
}

export async function listSources(env: Env) {
  const { results } = await env.DB.prepare("SELECT * FROM sources").all();
  return results ?? [];
}

export interface UpsertSourceInput {
  name: string;
  type: string;
  config?: Record<string, unknown>;
  enabled?: boolean;
}

/**
 * `type` must be a key in worker/sources/registry.ts's `adapters` export,
 * or the literal 'push' pseudo-type (items arrive via the push API, no
 * adapter fetch). worker/workflow.ts's fetch step already no-ops for
 * unknown adapter types (`if (!adapter) return [];`), so a 'push' source
 * is safely skipped by the hourly workflow without further changes there.
 */
export async function upsertSource(
  env: Env,
  id: string,
  input: UpsertSourceInput
): Promise<{ ok: true; id: string } | HandlerError> {
  if (!id) {
    return { error: "id is required", status: 400 };
  }
  if (!input?.name || !input?.type) {
    return { error: "name and type are required", status: 400 };
  }
  const validType = input.type === "push" || input.type in adapters;
  if (!validType) {
    return { error: `unknown source type "${input.type}"`, status: 400 };
  }

  await env.DB.prepare(
    `INSERT INTO sources (id, name, type, config, enabled)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       type = excluded.type,
       config = excluded.config,
       enabled = excluded.enabled`
  )
    .bind(
      id,
      input.name,
      input.type,
      JSON.stringify(input.config ?? {}),
      input.enabled === false ? 0 : 1
    )
    .run();

  return { ok: true, id };
}

export async function deleteSource(
  env: Env,
  id: string
): Promise<{ ok: true; id: string } | HandlerError> {
  if (!id) {
    return { error: "id is required", status: 400 };
  }
  await env.DB.prepare("DELETE FROM sources WHERE id = ?").bind(id).run();
  return { ok: true, id };
}

export async function triggerIngest(env: Env) {
  const instance = await env.NEWS_INGEST.create();
  await writeAudit(env, "ingest.trigger", instance.id);
  return { id: instance.id };
}

export async function getStatus(env: Env) {
  const { results: runs } = await env.DB.prepare(
    "SELECT * FROM workflow_runs ORDER BY started_at DESC LIMIT 10"
  ).all();
  const { results: itemsByStatus } = await env.DB.prepare(
    "SELECT status, COUNT(*) as c FROM items GROUP BY status"
  ).all();
  const latestTldr = await env.DB.prepare(
    "SELECT date, created_at FROM tldr_snapshots ORDER BY date DESC LIMIT 1"
  ).first<{ date: string; created_at: number }>();
  let notifications: unknown[] = [];
  try {
    const { results } = await env.DB.prepare(
      `SELECT channel, item_id, status, attempts, last_error, posted_at
       FROM notifications ORDER BY posted_at DESC LIMIT 20`
    ).all();
    notifications = results ?? [];
  } catch {
    notifications = [];
  }
  return {
    runs: runs ?? [],
    itemsByStatus: itemsByStatus ?? [],
    telegram: {
      configured: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    },
    latestTldr: latestTldr ?? null,
    notifications,
  };
}

export async function listNotifications(env: Env) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT channel, item_id, target, status, attempts, message_id, last_error, posted_at
       FROM notifications ORDER BY posted_at DESC LIMIT 50`
    ).all();
    return { notifications: results ?? [] };
  } catch {
    return { notifications: [] };
  }
}

export async function listAudit(env: Env) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT ts, action, detail FROM admin_audit ORDER BY ts DESC LIMIT 50"
    ).all();
    return { audit: results ?? [] };
  } catch {
    return { audit: [] };
  }
}

export async function retryTelegramDigest(env: Env) {
  const result = await forceSendDigest(env);
  await writeAudit(env, "notify.digest", result.reason);
  return result;
}

const DEFAULT_LLM_CALLS_LIMIT = 100;
const MAX_LLM_CALLS_LIMIT = 500;

/**
 * Newest-first rows from `llm_calls` (see migrations/0013_llm_calls.sql),
 * one row per anyrouter model attempt. `limitParam` comes straight from a
 * query string, so it's parsed defensively: anything non-numeric or <= 0
 * falls back to the default, and the result is always capped.
 */
export async function getLlmCalls(env: Env, limitParam?: string | null) {
  const parsed = limitParam ? Number(limitParam) : Number.NaN;
  const limit =
    Number.isFinite(parsed) && parsed > 0
      ? Math.min(Math.floor(parsed), MAX_LLM_CALLS_LIMIT)
      : DEFAULT_LLM_CALLS_LIMIT;
  const { results } = await env.DB.prepare(
    "SELECT * FROM llm_calls ORDER BY ts DESC LIMIT ?"
  )
    .bind(limit)
    .all();
  return { calls: results ?? [] };
}

export interface ReprocessInput {
  steps?: ("score" | "translate")[];
  scope?: "today";
}

export interface ReprocessResult {
  processed: number;
  scored: number;
  translated: number;
  tokens: number;
}

interface ReprocessItemRow {
  id: string;
  title: string;
  summary: string | null;
  source_id: string;
  points: number | null;
  comments: number | null;
  published_at: number;
}

/** Epoch seconds for the start of the current UTC day — matches
 * `items.published_at`'s stored unit (see worker/time.ts / workflow.ts). */
function startOfTodayUtcSec(): number {
  return Math.floor(Date.UTC(...splitUtcDate(new Date())) / 1000);
}

function splitUtcDate(d: Date): [number, number, number] {
  return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()];
}

// Workers isolate-scope guard: fine for this single-instance admin action,
// not a distributed lock. See task doc for rationale.
let reprocessInFlight = false;

/**
 * Re-runs scoring and/or translation over today's already-published items,
 * writing results back with UPDATE (score) / upsert-by-id (translate) —
 * never INSERT of a new items row, so this cannot create duplicates.
 */
export async function reprocessToday(
  env: Env,
  input: ReprocessInput
): Promise<ReprocessResult | HandlerError> {
  if (reprocessInFlight) {
    return { error: "reprocess already running", status: 409 };
  }
  reprocessInFlight = true;
  try {
    const steps = input.steps ?? ["score", "translate"];
    const doScore = steps.includes("score");
    const doTranslate = steps.includes("translate");

    setLlmCallLogger(createD1LlmCallLogger(env));

    const since = startOfTodayUtcSec();
    const { results } = await env.DB.prepare(
      `SELECT id, title, summary, source_id, points, comments, published_at
       FROM items WHERE status = 'published' AND published_at >= ?`
    )
      .bind(since)
      .all<ReprocessItemRow>();
    const items = results ?? [];

    let scoredCount = 0;
    let translatedCount = 0;
    let tokens = 0;

    if (doScore && items.length > 0) {
      const scoreResults = await scoreItems(
        env,
        items.map((row, i) => ({
          i,
          title: row.title,
          summary: row.summary ?? undefined,
          source: row.source_id,
        }))
      );

      const rawTagsByItem = new Map<string, string[]>();
      const scoreByItemId = new Map<string, (typeof scoreResults)[number]>();
      for (const result of scoreResults) {
        const row = items[result.i];
        if (!row) continue;
        rawTagsByItem.set(row.id, result.tags);
        scoreByItemId.set(row.id, result);
      }
      const canonicalTagsByItem = await normalizeTopics(
        env,
        rawTagsByItem,
        Date.now()
      );

      const statements: D1PreparedStatement[] = [];
      for (const row of items) {
        const score = scoreByItemId.get(row.id);
        if (!score) continue;
        tokens += score.tokens;
        scoredCount++;
        const tags = canonicalTagsByItem.get(row.id) ?? score.tags;
        const rank = rankScore({
          importance: score.importance,
          quality: score.quality,
          points: row.points ?? 0,
          comments: row.comments ?? 0,
          publishedAt: row.published_at * 1000,
          now: Date.now(),
        });
        statements.push(
          env.DB.prepare(
            `UPDATE items SET
               llm_relevance = ?, llm_importance = ?, llm_quality = ?,
               category = ?, tags = ?, rank_score = ?
             WHERE id = ?`
          ).bind(
            score.relevance,
            score.importance,
            score.quality,
            score.category || null,
            JSON.stringify(tags),
            rank,
            row.id
          )
        );
      }
      if (statements.length > 0) await env.DB.batch(statements);
    }

    if (doTranslate && items.length > 0) {
      const translateResults = await translateItems(
        env,
        items.map((row, i) => ({
          i,
          title: row.title,
          summary: row.summary ?? undefined,
        }))
      );

      const statements: D1PreparedStatement[] = [];
      for (const result of translateResults) {
        const row = items[result.i];
        if (!row || !result.title) continue;
        tokens += result.tokens;
        translatedCount++;
        statements.push(
          env.DB.prepare(
            `INSERT INTO translations (item_id, lang, title, summary)
             VALUES (?, 'vi', ?, ?)
             ON CONFLICT(item_id, lang) DO UPDATE SET
               title = excluded.title, summary = excluded.summary`
          ).bind(row.id, result.title, result.summary)
        );
      }
      if (statements.length > 0) await env.DB.batch(statements);
    }

    return {
      processed: items.length,
      scored: scoredCount,
      translated: translatedCount,
      tokens,
    };
  } finally {
    reprocessInFlight = false;
  }
}

const DEFAULT_ITEMS_LIMIT = 50;
const MAX_ITEMS_LIMIT = 200;

/**
 * Newest-first rows from `items` across all statuses (published / rejected /
 * merged / new), for the moderation surface. `limitParam` parsed the same
 * defensive way as getLlmCalls.
 */
export async function listItems(env: Env, limitParam?: string | null) {
  const parsed = limitParam ? Number(limitParam) : Number.NaN;
  const limit =
    Number.isFinite(parsed) && parsed > 0
      ? Math.min(Math.floor(parsed), MAX_ITEMS_LIMIT)
      : DEFAULT_ITEMS_LIMIT;
  const { results } = await env.DB.prepare(
    `SELECT id, source_id, title, url, status, published_at,
            llm_relevance, llm_importance, llm_quality, category, tags,
            rank_score, points, comments
     FROM items ORDER BY published_at DESC LIMIT ?`
  )
    .bind(limit)
    .all();
  return { items: results ?? [] };
}

export interface UpdateItemInput {
  id: string;
  action: "reject" | "restore" | "rate";
  importance?: number;
  quality?: number;
  relevance?: number;
}

interface ItemRow {
  id: string;
  points: number | null;
  comments: number | null;
  published_at: number;
  llm_relevance: number | null;
  llm_importance: number | null;
  llm_quality: number | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Moderation mutation for a single item, by id: reject/restore flip
 * `status`; rate updates the given llm_* fields (clamped to their valid
 * ranges) and recomputes rank_score from the item's stored points/comments/
 * published_at (seconds, matches items.published_at's unit — see
 * reprocessToday above) and the current time. Always UPDATE-by-id, never
 * INSERT; 404s when the id doesn't exist.
 */
export async function updateItem(
  env: Env,
  input: UpdateItemInput
): Promise<Record<string, unknown> | HandlerError> {
  if (!input?.id) {
    return { error: "id is required", status: 400 };
  }
  const row = await env.DB.prepare(
    `SELECT id, points, comments, published_at,
            llm_relevance, llm_importance, llm_quality
     FROM items WHERE id = ?`
  )
    .bind(input.id)
    .first<ItemRow>();
  if (!row) {
    return { error: "item not found", status: 404 };
  }

  if (input.action === "reject" || input.action === "restore") {
    const status = input.action === "reject" ? "rejected" : "published";
    await env.DB.prepare("UPDATE items SET status = ? WHERE id = ?")
      .bind(status, input.id)
      .run();
  } else if (input.action === "rate") {
    const importance =
      input.importance !== undefined
        ? clamp(input.importance, 0, 10)
        : (row.llm_importance ?? 0);
    const quality =
      input.quality !== undefined
        ? clamp(input.quality, 0, 10)
        : (row.llm_quality ?? 0);
    const relevance =
      input.relevance !== undefined
        ? clamp(input.relevance, 0, 1)
        : row.llm_relevance;

    const rank = rankScore({
      importance,
      quality,
      points: row.points ?? 0,
      comments: row.comments ?? 0,
      publishedAt: row.published_at * 1000,
      now: Date.now(),
    });

    await env.DB.prepare(
      `UPDATE items SET
         llm_relevance = ?, llm_importance = ?, llm_quality = ?, rank_score = ?
       WHERE id = ?`
    )
      .bind(relevance, importance, quality, rank, input.id)
      .run();
  } else {
    return { error: `unknown action "${input.action}"`, status: 400 };
  }

  const updated = await env.DB.prepare("SELECT * FROM items WHERE id = ?")
    .bind(input.id)
    .first();
  return (updated ?? {}) as Record<string, unknown>;
}

export interface TldrRegenerateResult {
  generated: boolean;
  tokens: number;
}

/**
 * Deletes today's tldr_snapshots row (if any) and re-runs ensureDailyTldr,
 * which then regenerates and re-upserts today's snapshot. Idempotent: the
 * snapshot table's primary key is `date`, so replacing today's row never
 * adds a duplicate.
 */
export async function regenerateTldr(env: Env): Promise<TldrRegenerateResult> {
  setLlmCallLogger(createD1LlmCallLogger(env));
  const date = tldrSnapshotDate();
  await env.DB.prepare("DELETE FROM tldr_snapshots WHERE date = ?")
    .bind(date)
    .run();
  const result = await ensureDailyTldr(env);
  await writeAudit(
    env,
    "tldr.regenerate",
    result.generated ? `ok ${date}` : result.reason
  );
  return result;
}

export async function listPendingSuggestions(
  env: Env,
  limitParam?: string | null
) {
  const limit = Math.min(
    Math.max(Number.parseInt(limitParam ?? "50", 10) || 50, 1),
    100
  );
  const { results } = await env.DB.prepare(
    `SELECT id, item_id, field, suggestion, user_name, rating, created_at, status
     FROM translation_suggestions
     WHERE status = 'pending'
     ORDER BY created_at ASC
     LIMIT ${limit}`
  ).all();
  return { suggestions: results ?? [] };
}

export async function listPendingSubmissions(
  env: Env,
  limitParam?: string | null
) {
  const limit = Math.min(
    Math.max(Number.parseInt(limitParam ?? "50", 10) || 50, 1),
    100
  );
  const { results } = await env.DB.prepare(
    `SELECT id, url, title, note, user_name, rating, created_at, status
     FROM submissions
     WHERE status = 'pending'
     ORDER BY created_at ASC
     LIMIT ${limit}`
  ).all();
  return { submissions: results ?? [] };
}

export async function decideSuggestion(
  env: Env,
  body: { id?: string; action?: string }
): Promise<{ ok: true } | HandlerError> {
  const id = body.id;
  const action = body.action;
  if (!id || (action !== "approve" && action !== "reject")) {
    return { error: "id and action (approve|reject) required", status: 400 };
  }
  const { approveSuggestionById, rejectSuggestionById } = await import(
    "../suggestions.js"
  );
  const result =
    action === "approve"
      ? await approveSuggestionById(env, id)
      : await rejectSuggestionById(env, id);
  if (!result.ok) return { error: result.error, status: 404 };
  await writeAudit(env, `suggestions.${action}`, id);
  return { ok: true };
}

export async function decideSubmission(
  env: Env,
  body: { id?: string; action?: string }
): Promise<{ ok: true } | HandlerError> {
  const id = body.id;
  const action = body.action;
  if (!id || (action !== "approve" && action !== "reject")) {
    return { error: "id and action (approve|reject) required", status: 400 };
  }
  const { acceptSubmissionById, rejectSubmissionById } = await import(
    "../submissions.js"
  );
  const result =
    action === "approve"
      ? await acceptSubmissionById(env, id)
      : await rejectSubmissionById(env, id);
  if (!result.ok) return { error: result.error, status: 404 };
  await writeAudit(env, `submissions.${action}`, id);
  return { ok: true };
}
