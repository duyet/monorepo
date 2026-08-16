import { createServerFn } from "@tanstack/react-start";
import type { FeedItem } from "./types";

export const fetchStory = createServerFn({ method: "GET" })
  .inputValidator((input: { idPrefix: string }) => ({
    idPrefix: String(input.idPrefix).slice(0, 64),
  }))
  .handler(async ({ data }): Promise<FeedItem | null> => {
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db) throw new Error("D1 binding DB not configured");

    const row = await db
      .prepare(
        `SELECT i.id, i.url, i.title, t.title AS title_vi, i.summary,
                t.summary AS summary_vi, i.category, i.published_at,
                i.points, i.comments, i.rank_score, i.source_id, i.tags
         FROM items i
         LEFT JOIN translations t ON t.item_id = i.id AND t.lang = 'vi'
         WHERE i.id LIKE ? AND i.status = 'published' LIMIT 1`
      )
      .bind(`${data.idPrefix}%`)
      .first<Record<string, unknown>>();
    if (!row) return null;

    let tags: string[] = [];
    try {
      tags = JSON.parse((row.tags as string) || "[]");
    } catch {
      // malformed tags — untagged
    }
    const item = { ...row, tags, sources: [] } as unknown as FeedItem;

    try {
      const { results } = await db
        .prepare(
          `SELECT kind, author, posted_at, quote, url FROM item_sources
           WHERE item_id = ? ORDER BY position`
        )
        .bind(item.id)
        .all<FeedItem["sources"][number]>();
      item.sources = results ?? [];
    } catch {
      // item_sources may not exist yet
    }
    return item;
  });
