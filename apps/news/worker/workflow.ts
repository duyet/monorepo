import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import {
  BACKFILL_BATCH_SIZE,
  BACKFILL_CONTENT_CAP,
  buildMissingSummaryQuery,
  buildMissingTranslationQuery,
  huggingNewsDetailUrl,
  planBackfillUpdate,
} from "./backfill.js";
import { type MirrorRow, mirrorItems } from "./clickhouse.js";
import {
  buildItemBindArgs,
  buildItemSourceBindArgs,
  buildTranslationBindArgs,
  MAX_SOURCES_PER_ITEM,
  nn,
} from "./d1-bind.js";
import {
  buildMergePlan,
  clusterSimilar,
  type ExistingCandidate,
  type MergeCandidate,
  type MergePlan,
  unionSources,
} from "./dedupe.js";
import { enrichMissingContent, fetchOgData } from "./enrich.js";
import { sha256Hex } from "./hash.js";
import { scoreItems, translateItems } from "./llm.js";
import { rankScore } from "./ranking.js";
import { buildRunStats, serializeRunStats } from "./run-stats.js";
import { fetchStoryDetailByUrl } from "./sources/huggingnews.js";
import { adapters } from "./sources/registry.js";
import type { FetchedItem, FetchedItemSource } from "./sources/types.js";
import { reviewPendingSubmissions } from "./submissions.js";
import { sendDailyTldr } from "./subscribe/send.js";
import { reviewPendingSuggestions } from "./suggestions.js";
import { toEpochSeconds } from "./time.js";
import { ensureDailyTldr } from "./tldr.js";
import { MAX_MERGED_TOPICS, normalizeTopics, unionTopics } from "./topics.js";
import { ratePendingTranslations } from "./translation-qa.js";
import type { Env } from "./types.js";

const RELEVANCE_THRESHOLD = 0.4;
const RANK_RECOMPUTE_WINDOW_SEC = 72 * 60 * 60;
const SINCE_WINDOW_SEC = 26 * 60 * 60; // slight overlap over the hourly cron
// Same lookback the rank-recompute step uses: candidates for "same story as
// an already-published item" clustering.
const MERGE_LOOKBACK_SEC = RANK_RECOMPUTE_WINDOW_SEC;
// Bounds the clustering prompt's size; recent+highest-ranked first.
const MERGE_CANDIDATE_LIMIT = 300;

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

export class NewsIngestWorkflow extends WorkflowEntrypoint<Env> {
  async run(_event: WorkflowEvent<unknown>, step: WorkflowStep) {
    const startedAt = Date.now();
    const runId = crypto.randomUUID();
    let itemsFetched = 0;
    let itemsNew = 0;
    let runError: string | null = null;
    const bySource: Record<string, number> = {};
    let merged = 0;
    let published = 0;
    let rejected = 0;
    let scoreAndTranslateTokens = 0;
    let backfilledSummaries = 0;
    let backfilledTranslations = 0;
    let backfillTranslateTokens = 0;
    let qaRated = 0;
    let qaAdjusted = 0;
    let qaTokens = 0;
    let suggestionsReviewed = 0;
    let suggestionsTokens = 0;
    let submissionsReviewed = 0;
    let submissionsTokens = 0;
    let tldrGenerated = false;
    let tldrTokens = 0;
    let emailsSent = 0;

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
        bySource[source.id] = (bySource[source.id] ?? 0) + items.length;
      }

      let newRows = await step.do("dedupe", async () => {
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

        // Rows inserted directly with status='new' (e.g. an accepted user
        // submission, or an admin push) never came through a source's
        // fetchItems() this run, so the loop above never sees them. Pull
        // them in here so they go through the same score/merge/translate
        // pipeline as anything freshly fetched.
        const { results: pendingNew } = await this.env.DB.prepare(
          `SELECT id, source_id, external_id, url, title, summary,
                  published_at, points, comments, image_url
           FROM items WHERE status = 'new'`
        ).all<{
          id: string;
          source_id: string;
          external_id: string | null;
          url: string;
          title: string;
          summary: string | null;
          published_at: number;
          points: number;
          comments: number;
          image_url: string | null;
        }>();
        for (const row of pendingNew ?? []) {
          const source = sources.find((s) => s.id === row.source_id) ?? {
            id: row.source_id,
            type: "unknown",
            config: "{}",
            enabled: 1,
          };
          rows.push({
            id: row.id,
            source,
            item: {
              externalId: row.external_id ?? undefined,
              url: row.url,
              title: row.title,
              summary: row.summary ?? undefined,
              publishedAt: row.published_at,
              points: row.points,
              comments: row.comments,
              imageUrl: row.image_url ?? undefined,
            },
          });
        }

        return rows;
      });
      itemsNew = newRows.length;

      // Fill in summary/image_url for items lacking either, from the
      // article's own og/description meta tags, BEFORE scoring so the
      // scorer/translator get to see the enriched description. Runs against
      // scratch clones (not `newRows` directly) and returns only the plain
      // diff data: Workflow steps replay by returning their memoized value
      // rather than re-running the callback, so mutating `newRows` in place
      // here wouldn't survive a workflow restart — the fold-back below runs
      // as ordinary (replay-safe, deterministic) code outside the step.
      const enrichment = await step.do("enrich", async () => {
        if (newRows.length === 0) return [];
        const drafts = newRows.map((row) => ({ ...row.item }));
        await enrichMissingContent(drafts);
        return newRows.map((row, i) => ({
          id: row.id,
          summary: drafts[i].summary,
          imageUrl: drafts[i].imageUrl,
        }));
      });
      const enrichmentById = new Map(enrichment.map((e) => [e.id, e]));
      newRows = newRows.map((row) => {
        const e = enrichmentById.get(row.id);
        if (!e) return row;
        return {
          ...row,
          item: {
            ...row.item,
            summary: e.summary ?? row.item.summary,
            imageUrl: e.imageUrl ?? row.item.imageUrl,
          },
        };
      });

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

      // Rewrites each item's raw score tags into canonical topic names
      // (rules-based first, LLM-mapped for unseen variants), persisting
      // the `topics` table's per-variant counts. Runs before merge-similar
      // so a cluster's topic union already has canonical values to
      // dedupe against.
      const canonicalTagsByItem = await step.do(
        "normalize-topics",
        async () => {
          if (newRows.length === 0) return new Map<string, string[]>();
          const rawTagsByItem = new Map<string, string[]>(
            newRows.map((row) => [row.id, scored.get(row.id)?.tags ?? []])
          );
          return normalizeTopics(this.env, rawTagsByItem, now);
        }
      );

      const mergePlan = await step.do("merge-similar", async () => {
        const empty: MergePlan = {
          merged: new Map(),
          canonicalUpdates: new Map(),
        };
        if (newRows.length === 0) return empty;

        const { results: recentForClustering } = await this.env.DB.prepare(
          `SELECT id, title, points, comments FROM items
           WHERE status = 'published' AND published_at >= ?
           ORDER BY published_at DESC
           LIMIT ${MERGE_CANDIDATE_LIMIT}`
        )
          .bind(toEpochSeconds(now) - MERGE_LOOKBACK_SEC)
          .all<{
            id: string;
            title: string;
            points: number;
            comments: number;
          }>();

        const clusters = await clusterSimilar(
          this.env,
          newRows.map((row, i) => ({ i, title: row.item.title })),
          (recentForClustering ?? []).map((r) => ({ id: r.id, title: r.title }))
        );
        if (clusters.length === 0) return empty;

        const candidates: MergeCandidate[] = newRows.map((row, i) => {
          const score = scored.get(row.id);
          const rank = rankScore({
            importance: score?.importance ?? 5,
            quality: score?.quality ?? 5,
            points: row.item.points ?? 0,
            comments: row.item.comments ?? 0,
            publishedAt: row.item.publishedAt * 1000,
            now,
          });
          return {
            i,
            id: row.id,
            url: row.item.url,
            sourceId: row.source.id,
            sources: row.item.sources,
            topics: canonicalTagsByItem.get(row.id),
            points: row.item.points ?? 0,
            comments: row.item.comments ?? 0,
            rank,
          };
        });

        const existingById = new Map<string, ExistingCandidate>(
          (recentForClustering ?? []).map((r) => [
            r.id,
            { points: r.points, comments: r.comments },
          ])
        );

        return buildMergePlan(
          clusters,
          candidates,
          existingById,
          MAX_SOURCES_PER_ITEM,
          MAX_MERGED_TOPICS
        );
      });

      const newRowById = new Map(newRows.map((row) => [row.id, row]));

      const publishedRows = newRows.filter((row) => {
        if (mergePlan.merged.has(row.id)) return false; // skip translate for merged items
        const score = scored.get(row.id);
        return !score || score.relevance >= RELEVANCE_THRESHOLD;
      });

      const translated = await step.do("translate", async () => {
        if (publishedRows.length === 0)
          return new Map<
            string,
            Awaited<ReturnType<typeof translateItems>>[number]
          >();
        const results = await translateItems(
          this.env,
          publishedRows.map((row, i) => ({
            i,
            title: row.item.title,
            summary: row.item.summary,
          }))
        );
        const map = new Map<string, (typeof results)[number]>();
        for (const result of results) {
          const row = publishedRows[result.i];
          if (row) map.set(row.id, result);
        }
        return map;
      });

      // Plain deterministic derivation from already-memoized step outputs
      // (newRows/scored/mergePlan/translated) — replay-safe the same way
      // publishedRows above is, no need for its own step.do.
      merged = mergePlan.merged.size;
      published = publishedRows.length;
      rejected = newRows.length - merged - published;
      for (const score of scored.values())
        scoreAndTranslateTokens += score.tokens;
      for (const translation of translated.values())
        scoreAndTranslateTokens += translation.tokens;

      await step.do("write-d1", async () => {
        const statements: D1PreparedStatement[] = [];

        for (const { id, source, item } of newRows) {
          const score = scored.get(id);
          const translation = translated.get(id);
          const mergeEntry = mergePlan.merged.get(id);
          const canonicalUpdate = mergePlan.canonicalUpdates.get(id);

          // A canonical new item absorbs the rest of its cluster's
          // points/comments (max) and sources (union, capped) before
          // its own row is written.
          const effectiveItem =
            canonicalUpdate && !canonicalUpdate.isExisting
              ? {
                  ...item,
                  points: canonicalUpdate.maxPoints,
                  comments: canonicalUpdate.maxComments,
                  sources: unionSources(
                    item.sources ?? [],
                    canonicalUpdate.extraSources,
                    MAX_SOURCES_PER_ITEM
                  ),
                }
              : item;

          // Canonical topics (rules-normalized + LLM-mapped by
          // normalize-topics), unioned with the rest of the cluster's
          // topics for a new-item canonical so counts don't fragment
          // across near-duplicate stories.
          const canonicalTopics =
            canonicalUpdate && !canonicalUpdate.isExisting
              ? unionTopics(
                  canonicalTagsByItem.get(id) ?? [],
                  canonicalUpdate.extraTopics,
                  MAX_MERGED_TOPICS
                )
              : (canonicalTagsByItem.get(id) ?? []);
          const effectiveScore = score
            ? { ...score, tags: canonicalTopics }
            : undefined;

          const relevance = score?.relevance ?? 0.5;
          const importance = score?.importance ?? 5;
          const quality = score?.quality ?? 5;
          const status = mergeEntry
            ? "merged"
            : relevance < RELEVANCE_THRESHOLD
              ? "rejected"
              : "published";
          const rank = rankScore({
            importance,
            quality,
            points: effectiveItem.points ?? 0,
            comments: effectiveItem.comments ?? 0,
            // item.publishedAt is epoch seconds (normalized at dedupe time);
            // rankScore's decay formula operates in milliseconds.
            publishedAt: effectiveItem.publishedAt * 1000,
            now,
          });
          const llmTokens = (score?.tokens ?? 0) + (translation?.tokens ?? 0);

          statements.push(
            this.env.DB.prepare(
              `INSERT INTO items (
                id, source_id, external_id, url, title, summary,
                published_at, fetched_at, points, comments,
                llm_relevance, llm_importance, llm_quality, category, tags,
                rank_score, status, llm_tokens, duplicate_of, image_url
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                published_at = excluded.published_at,
                points = excluded.points,
                comments = excluded.comments,
                rank_score = excluded.rank_score,
                status = excluded.status`
            ).bind(
              ...buildItemBindArgs({
                id,
                sourceId: source.id,
                item: effectiveItem,
                score: effectiveScore,
                rank,
                status,
                now,
                llmTokens,
                duplicateOf: mergeEntry?.duplicateOf,
              })
            )
          );

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

          // Merged items' sources have already been absorbed into their
          // canonical's item_sources rows; don't also write their own.
          if (
            !mergeEntry &&
            effectiveItem.sources &&
            effectiveItem.sources.length > 0
          ) {
            statements.push(
              this.env.DB.prepare(
                "DELETE FROM item_sources WHERE item_id = ?"
              ).bind(nn(id))
            );
            for (const row of buildItemSourceBindArgs(
              id,
              effectiveItem.sources
            )) {
              statements.push(
                this.env.DB.prepare(
                  `INSERT INTO item_sources (item_id, position, kind, author, posted_at, quote, url)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`
                ).bind(...row)
              );
            }
          }
        }

        // Canonicals that are pre-existing (already-published) items absorb
        // the merged new items' points/comments/sources too, but need their
        // own read-update-write since they're not part of `newRows`.
        for (const [canonicalId, update] of mergePlan.canonicalUpdates) {
          if (!update.isExisting || newRowById.has(canonicalId)) continue;

          const existingTagsRow = await this.env.DB.prepare(
            "SELECT tags FROM items WHERE id = ?"
          )
            .bind(canonicalId)
            .first<{ tags: string | null }>();
          let existingTopics: string[] = [];
          try {
            const parsed = JSON.parse(existingTagsRow?.tags ?? "[]");
            if (Array.isArray(parsed)) existingTopics = parsed;
          } catch {
            // malformed existing tags JSON — treat as empty, union still works
          }
          const mergedTopics = unionTopics(
            existingTopics,
            update.extraTopics,
            MAX_MERGED_TOPICS
          );

          statements.push(
            this.env.DB.prepare(
              "UPDATE items SET points = ?, comments = ?, tags = ? WHERE id = ?"
            ).bind(
              nn(update.maxPoints),
              nn(update.maxComments),
              nn(JSON.stringify(mergedTopics)),
              nn(canonicalId)
            )
          );

          const { results: existingSourceRows } = await this.env.DB.prepare(
            "SELECT kind, author, posted_at, quote, url FROM item_sources WHERE item_id = ? ORDER BY position"
          )
            .bind(canonicalId)
            .all<{
              kind: "source" | "support" | "discussion";
              author: string | null;
              posted_at: number | null;
              quote: string | null;
              url: string | null;
            }>();

          const mergedSources = unionSources(
            (existingSourceRows ?? []).map((r) => ({
              kind: r.kind,
              author: r.author ?? undefined,
              postedAt: r.posted_at ?? undefined,
              quote: r.quote ?? undefined,
              url: r.url ?? undefined,
            })),
            update.extraSources,
            MAX_SOURCES_PER_ITEM
          );

          statements.push(
            this.env.DB.prepare(
              "DELETE FROM item_sources WHERE item_id = ?"
            ).bind(nn(canonicalId))
          );
          for (const row of buildItemSourceBindArgs(
            canonicalId,
            mergedSources
          )) {
            statements.push(
              this.env.DB.prepare(
                `INSERT INTO item_sources (item_id, position, kind, author, posted_at, quote, url)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`
              ).bind(...row)
            );
          }
        }

        // Only the current UTC day is re-ranked: the feed groups and sorts
        // stories per day, so recomputing freshness decay on older items
        // reshuffles history the reader already saw. Once a day rolls over,
        // its order is frozen; past days only ever gain merged-away dupes.
        const startOfUtcDaySec =
          Math.floor(toEpochSeconds(now) / 86400) * 86400;
        const { results: recentItems } = await this.env.DB.prepare(
          "SELECT id, published_at, points, comments, llm_importance, llm_quality FROM items WHERE published_at >= ? AND status = 'published'"
        )
          .bind(startOfUtcDaySec)
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
          const status = mergePlan.merged.has(id)
            ? "merged"
            : (score?.relevance ?? 0.5) < RELEVANCE_THRESHOLD
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
            tags: canonicalTagsByItem.get(id) ?? [],
            rank_score: rankScore({
              importance: score?.importance ?? 5,
              quality: score?.quality ?? 5,
              points: item.points ?? 0,
              comments: item.comments ?? 0,
              publishedAt: item.publishedAt * 1000,
              now,
            }),
            status,
            image_url: item.imageUrl ?? "",
          };
        });
        await mirrorItems(this.env, rows);
      });

      // Backfills existing (pre-enrichment) published items still missing a
      // summary — the `enrich` step above only ever touches this run's NEW
      // items. Drains the backlog a few items per hourly run rather than
      // trying to catch up all at once.
      backfilledSummaries = await step.do("backfill-content", async () => {
        let backfilled = 0;
        try {
          const { results } = await this.env.DB.prepare(
            buildMissingSummaryQuery(BACKFILL_CONTENT_CAP)
          ).all<{
            id: string;
            url: string;
            source_id: string;
            image_url: string | null;
          }>();
          const rows = results ?? [];

          for (let i = 0; i < rows.length; i += BACKFILL_BATCH_SIZE) {
            const batch = rows.slice(i, i + BACKFILL_BATCH_SIZE);
            await Promise.all(
              batch.map(async (row) => {
                let fetched: { summary?: string; imageUrl?: string };
                let sources: FetchedItemSource[] = [];

                if (row.source_id === "huggingnews") {
                  const detail = await fetchStoryDetailByUrl(
                    huggingNewsDetailUrl(row.url)
                  );
                  fetched = { summary: detail.summary };
                  sources = detail.sources;
                } else {
                  const og = await fetchOgData(row.url);
                  fetched = { summary: og.description, imageUrl: og.imageUrl };
                }

                const plan = planBackfillUpdate(
                  { imageUrl: row.image_url },
                  fetched
                );
                if (!plan) return;
                backfilled++;

                await this.env.DB.prepare(
                  "UPDATE items SET summary = ?, image_url = COALESCE(image_url, ?) WHERE id = ?"
                )
                  .bind(nn(plan.summary), nn(plan.imageUrl), nn(row.id))
                  .run();

                if (sources.length === 0) return;
                const { results: existingSources } = await this.env.DB.prepare(
                  "SELECT 1 FROM item_sources WHERE item_id = ? LIMIT 1"
                )
                  .bind(row.id)
                  .all();
                if ((existingSources ?? []).length > 0) return;

                for (const sourceArgs of buildItemSourceBindArgs(
                  row.id,
                  sources
                )) {
                  await this.env.DB.prepare(
                    `INSERT INTO item_sources (item_id, position, kind, author, posted_at, quote, url)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`
                  )
                    .bind(...sourceArgs)
                    .run();
                }
              })
            );
          }
        } catch (error) {
          console.error("backfill-content step failed:", error);
        }
        return backfilled;
      });

      // Translates whatever summaries exist (including ones the step above
      // just backfilled) but don't have a Vietnamese translation yet.
      const backfillTranslateResult = await step.do(
        "backfill-translate",
        async () => {
          let translatedCount = 0;
          let tokens = 0;
          try {
            const { results } = await this.env.DB.prepare(
              buildMissingTranslationQuery()
            ).all<{ id: string; title: string; summary: string }>();
            const rows = results ?? [];
            if (rows.length === 0) return { translatedCount, tokens };

            const translated = await translateItems(
              this.env,
              rows.map((row, i) => ({
                i,
                title: row.title,
                summary: row.summary,
              }))
            );
            for (const result of translated) {
              tokens += result.tokens;
              const row = rows[result.i];
              if (!row || !result.title || result.summary === undefined)
                continue;
              await this.env.DB.prepare(
                `INSERT INTO translations (item_id, lang, title, summary)
               VALUES (?, 'vi', ?, ?)
               ON CONFLICT(item_id, lang) DO UPDATE SET summary = excluded.summary`
              )
                .bind(
                  ...buildTranslationBindArgs({
                    id: row.id,
                    title: result.title,
                    summary: result.summary,
                  })
                )
                .run();
              translatedCount++;
            }
          } catch (error) {
            console.error("backfill-translate step failed:", error);
          }
          return { translatedCount, tokens };
        }
      );
      backfilledTranslations = backfillTranslateResult.translatedCount;
      backfillTranslateTokens = backfillTranslateResult.tokens;

      const qaStats = await step.do("qa-translations", async () => {
        try {
          return await ratePendingTranslations(this.env);
        } catch (error) {
          console.error("qa-translations step failed:", error);
          return { rated: 0, adjusted: 0, tokens: 0 };
        }
      });
      qaRated = qaStats.rated;
      qaAdjusted = qaStats.adjusted;
      qaTokens = qaStats.tokens;

      const suggestionsStats = await step.do("review-suggestions", async () => {
        try {
          return await reviewPendingSuggestions(this.env);
        } catch (error) {
          console.error("review-suggestions step failed:", error);
          return { reviewed: 0, tokens: 0 };
        }
      });
      suggestionsReviewed = suggestionsStats.reviewed;
      suggestionsTokens = suggestionsStats.tokens;

      const submissionsStats = await step.do("review-submissions", async () => {
        try {
          return await reviewPendingSubmissions(this.env);
        } catch (error) {
          console.error("review-submissions step failed:", error);
          return { reviewed: 0, tokens: 0 };
        }
      });
      submissionsReviewed = submissionsStats.reviewed;
      submissionsTokens = submissionsStats.tokens;

      const tldrStats = await step.do("tldr", async () => {
        return await ensureDailyTldr(this.env);
      });
      tldrGenerated = tldrStats.generated;
      tldrTokens = tldrStats.tokens;

      emailsSent = await step.do("email-digest", async () => {
        try {
          return await sendDailyTldr(this.env);
        } catch (error) {
          // Never let a digest-send failure break the ingest workflow.
          console.error("email-digest step failed:", error);
          return 0;
        }
      });
    } catch (error) {
      runError = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const stats = buildRunStats({
        bySource,
        new: itemsNew,
        merged,
        rejected,
        published,
        tokens:
          scoreAndTranslateTokens +
          backfillTranslateTokens +
          qaTokens +
          suggestionsTokens +
          submissionsTokens +
          tldrTokens,
        backfilledSummaries,
        backfilledTranslations,
        qaRated,
        qaAdjusted,
        suggestionsReviewed,
        submissionsReviewed,
        tldrGenerated,
        emailsSent,
      });

      await step.do("record-run", async () => {
        await this.env.DB.prepare(
          `INSERT INTO workflow_runs (id, started_at, finished_at, items_fetched, items_new, error, stats)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            nn(runId),
            nn(startedAt),
            nn(Date.now()),
            nn(itemsFetched),
            nn(itemsNew),
            nn(runError),
            nn(serializeRunStats(stats))
          )
          .run();
      });
    }
  }
}
