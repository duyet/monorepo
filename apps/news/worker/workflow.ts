import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { type MirrorRow, mirrorItems } from "./clickhouse.js";
import { buildItemBindArgs, buildTranslationBindArgs, nn } from "./d1-bind.js";
import { scoreItems, translateItems } from "./llm.js";
import { rankScore } from "./ranking.js";
import { adapters } from "./sources/registry.js";
import type { FetchedItem } from "./sources/types.js";
import { toEpochSeconds } from "./time.js";
import { ensureDailyTldr } from "./tldr.js";
import type { Env } from "./types.js";

const RELEVANCE_THRESHOLD = 0.4;
const RANK_RECOMPUTE_WINDOW_SEC = 72 * 60 * 60;
const SINCE_WINDOW_SEC = 26 * 60 * 60; // slight overlap over the hourly cron

interface SourceRow {
  id: string;
  type: string;
  config: string;
  enabled: number;
}

interface ItemRow {
  id: string;
  source_id: string;
  external_id: string | null;
  url: string;
  title: string;
  summary: string | null;
  published_at: number;
  fetched_at: number;
  points: number;
  comments: number;
  llm_relevance: number | null;
  llm_importance: number | null;
  llm_quality: number | null;
  category: string | null;
  tags: string;
  rank_score: number;
  status: string;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export class NewsIngestWorkflow extends WorkflowEntrypoint<Env> {
  async run(_event: WorkflowEvent<unknown>, step: WorkflowStep) {
    const startedAt = Date.now();
    const runId = crypto.randomUUID();
    let itemsFetched = 0;
    let itemsNew = 0;
    let runError: string | null = null;

    try {
      const sources = await step.do("load-sources", async () => {
        const { results } = await this.env.DB.prepare(
          "SELECT id, type, config, enabled FROM sources WHERE enabled = 1"
        ).all<SourceRow>();
        return results ?? [];
      });

      const sinceEpochSec = Math.floor(Date.now() / 1000) - SINCE_WINDOW_SEC;
      const fetchedBySource: { source: SourceRow; items: FetchedItem[] }[] = [];

      for (const source of sources) {
        const items = await step.do<FetchedItem[]>(
          `fetch-${source.id}`,
          { retries: { limit: 3, delay: 10_000, backoff: "exponential" } },
          async () => {
            const adapter = adapters[source.type];
            if (!adapter) return [];
            const config = JSON.parse(source.config || "{}");
            return adapter.fetchItems(config, sinceEpochSec);
          }
        );
        fetchedBySource.push({ source, items });
        itemsFetched += items.length;
      }

      const newRows = await step.do("dedupe", async () => {
        const rows: {
          id: string;
          source: SourceRow;
          item: FetchedItem;
        }[] = [];

        for (const { source, items } of fetchedBySource) {
          for (const item of items) {
            const id = await sha256Hex(item.url);
            const existing = await this.env.DB.prepare(
              "SELECT id FROM items WHERE id = ?"
            )
              .bind(id)
              .first();
            if (existing) continue;
            // Normalize once here: adapters may emit ms (e.g. hn.ts
            // converts Algolia's seconds back to ms) or already-seconds
            // timestamps; every downstream consumer treats this as seconds.
            const normalizedItem: FetchedItem = {
              ...item,
              publishedAt: toEpochSeconds(item.publishedAt),
            };
            rows.push({ id, source, item: normalizedItem });
          }
        }
        return rows;
      });
      itemsNew = newRows.length;

      const scored = await step.do("score", async () => {
        if (newRows.length === 0)
          return new Map<
            string,
            Awaited<ReturnType<typeof scoreItems>>[number]
          >();
        const results = await scoreItems(
          this.env,
          newRows.map((row, i) => ({
            i,
            title: row.item.title,
            summary: row.item.summary,
            source: row.source.id,
          }))
        );
        const map = new Map<string, (typeof results)[number]>();
        for (const result of results) {
          const row = newRows[result.i];
          if (row) map.set(row.id, result);
        }
        return map;
      });

      const now = Date.now();
      const publishedRows = newRows.filter((row) => {
        const score = scored.get(row.id);
        return !score || score.relevance >= RELEVANCE_THRESHOLD;
      });

      const translated = await step.do("translate", async () => {
        if (publishedRows.length === 0)
          return new Map<string, { title: string; summary: string }>();
        const results = await translateItems(
          this.env,
          publishedRows.map((row, i) => ({
            i,
            title: row.item.title,
            summary: row.item.summary,
          }))
        );
        const map = new Map<string, { title: string; summary: string }>();
        for (const result of results) {
          const row = publishedRows[result.i];
          if (row)
            map.set(row.id, { title: result.title, summary: result.summary });
        }
        return map;
      });

      await step.do("write-d1", async () => {
        const statements: D1PreparedStatement[] = [];

        for (const { id, source, item } of newRows) {
          const score = scored.get(id);
          const relevance = score?.relevance ?? 0.5;
          const importance = score?.importance ?? 5;
          const quality = score?.quality ?? 5;
          const status =
            relevance < RELEVANCE_THRESHOLD ? "rejected" : "published";
          const rank = rankScore({
            importance,
            quality,
            points: item.points ?? 0,
            comments: item.comments ?? 0,
            // item.publishedAt is epoch seconds (normalized at dedupe time);
            // rankScore's decay formula operates in milliseconds.
            publishedAt: item.publishedAt * 1000,
            now,
          });

          statements.push(
            this.env.DB.prepare(
              `INSERT INTO items (
                id, source_id, external_id, url, title, summary,
                published_at, fetched_at, points, comments,
                llm_relevance, llm_importance, llm_quality, category, tags,
                rank_score, status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                published_at = excluded.published_at,
                points = excluded.points,
                comments = excluded.comments,
                rank_score = excluded.rank_score`
            ).bind(
              ...buildItemBindArgs({
                id,
                sourceId: source.id,
                item,
                score,
                rank,
                status,
                now,
              })
            )
          );

          const translation = translated.get(id);
          // The translate step can be skipped (empty batch result) or the
          // LLM can omit a field entirely; only insert when both are usable.
          if (translation?.title && translation.summary !== undefined) {
            statements.push(
              this.env.DB.prepare(
                `INSERT INTO translations (item_id, lang, title, summary)
                 VALUES (?, 'vi', ?, ?)
                 ON CONFLICT(item_id, lang) DO UPDATE SET
                   title = excluded.title, summary = excluded.summary`
              ).bind(
                ...buildTranslationBindArgs({
                  id,
                  title: translation.title,
                  summary: translation.summary,
                })
              )
            );
          }
        }

        const { results: recentItems } = await this.env.DB.prepare(
          "SELECT id, published_at, points, comments, llm_importance, llm_quality FROM items WHERE published_at >= ? AND status = 'published'"
        )
          .bind(toEpochSeconds(now) - RANK_RECOMPUTE_WINDOW_SEC)
          .all<
            Pick<
              ItemRow,
              | "id"
              | "published_at"
              | "points"
              | "comments"
              | "llm_importance"
              | "llm_quality"
            >
          >();

        for (const row of recentItems ?? []) {
          const rank = rankScore({
            importance: row.llm_importance ?? 5,
            quality: row.llm_quality ?? 5,
            points: row.points,
            comments: row.comments,
            // row.published_at is stored as epoch seconds; rankScore expects ms.
            publishedAt: row.published_at * 1000,
            now,
          });
          statements.push(
            this.env.DB.prepare(
              "UPDATE items SET rank_score = ? WHERE id = ?"
            ).bind(nn(rank), nn(row.id))
          );
        }

        if (statements.length > 0) {
          await this.env.DB.batch(statements);
        }
      });

      await step.do("mirror-clickhouse", async () => {
        const rows: MirrorRow[] = newRows.map(({ id, source, item }) => {
          const score = scored.get(id);
          const status =
            (score?.relevance ?? 0.5) < RELEVANCE_THRESHOLD
              ? "rejected"
              : "published";
          return {
            id,
            source_id: source.id,
            external_id: item.externalId ?? "",
            url: item.url,
            title: item.title,
            summary: item.summary ?? "",
            published_at: new Date(item.publishedAt * 1000).toISOString(),
            fetched_at: new Date(now).toISOString(),
            points: item.points ?? 0,
            comments: item.comments ?? 0,
            llm_relevance: score?.relevance ?? null,
            llm_importance: score?.importance ?? null,
            llm_quality: score?.quality ?? null,
            category: score?.category ?? "",
            tags: score?.tags ?? [],
            rank_score: rankScore({
              importance: score?.importance ?? 5,
              quality: score?.quality ?? 5,
              points: item.points ?? 0,
              comments: item.comments ?? 0,
              publishedAt: item.publishedAt * 1000,
              now,
            }),
            status,
          };
        });
        await mirrorItems(this.env, rows);
      });

      await step.do("tldr", async () => {
        await ensureDailyTldr(this.env);
      });
    } catch (error) {
      runError = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      await step.do("record-run", async () => {
        await this.env.DB.prepare(
          `INSERT INTO workflow_runs (id, started_at, finished_at, items_fetched, items_new, error)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(
            nn(runId),
            nn(startedAt),
            nn(Date.now()),
            nn(itemsFetched),
            nn(itemsNew),
            nn(runError)
          )
          .run();
      });
    }
  }
}
