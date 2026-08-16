import { adapters } from "../sources/registry.js";
import type { Env } from "../types.js";

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
  return { id: instance.id };
}

export async function getStatus(env: Env) {
  const { results: runs } = await env.DB.prepare(
    "SELECT * FROM workflow_runs ORDER BY started_at DESC LIMIT 10"
  ).all();
  const { results: itemsByStatus } = await env.DB.prepare(
    "SELECT status, COUNT(*) as c FROM items GROUP BY status"
  ).all();
  return { runs: runs ?? [], itemsByStatus: itemsByStatus ?? [] };
}
