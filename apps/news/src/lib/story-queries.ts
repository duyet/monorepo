import type { FeedItem } from "./types";

let llmTokensSupported: boolean | null = null;
let imageUrlSupported: boolean | null = null;

async function probeColumn(
  db: D1Database,
  column: string,
  cache: boolean | null
): Promise<boolean> {
  if (cache !== null) return cache;
  try {
    await db.prepare(`SELECT ${column} FROM items LIMIT 1`).all();
    return true;
  } catch {
    // column not migrated in yet
    return false;
  }
}

/** Look up a single published story by id (or id prefix). Shared by the
 * /api/story/$id route and the $cat/$slug permalink page loader. */
export async function getStory(
  db: D1Database,
  idPrefix: string
): Promise<FeedItem | null> {
  const [hasLlmTokens, hasImageUrl] = await Promise.all([
    probeColumn(db, "llm_tokens", llmTokensSupported),
    probeColumn(db, "image_url", imageUrlSupported),
  ]);
  llmTokensSupported = hasLlmTokens;
  imageUrlSupported = hasImageUrl;

  const row = await db
    .prepare(
      `SELECT i.id, i.url, i.title, t.title AS title_vi, i.summary,
              t.summary AS summary_vi, i.category, i.published_at,
              i.points, i.comments, i.rank_score, i.source_id, i.tags
              ${hasLlmTokens ? ", COALESCE(i.llm_tokens, 0) AS llm_tokens" : ""}
              ${hasImageUrl ? ", i.image_url" : ""}
       FROM items i
       LEFT JOIN translations t ON t.item_id = i.id AND t.lang = 'vi'
       WHERE substr(i.id, 1, ?) = ? AND i.status = 'published' LIMIT 1`
    )
    // substr-prefix match instead of LIKE: a full 64-char id as a LIKE
    // pattern exceeds SQLite's pattern-complexity limit (D1_ERROR).
    .bind(idPrefix.length, idPrefix)
    .first<Record<string, unknown>>();
  if (!row) return null;

  let tags: string[] = [];
  try {
    tags = JSON.parse((row.tags as string) || "[]");
  } catch {
    // malformed tags — untagged
  }
  const item = {
    ...row,
    tags,
    sources: [],
    llm_tokens: (row.llm_tokens as number | undefined) ?? 0,
    image_url: (row.image_url as string | null | undefined) ?? null,
  } as unknown as FeedItem;

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
}
