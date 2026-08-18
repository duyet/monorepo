import { TITLE_KEYWORDS } from "./highlight";
import { resolveTldrForDisplay } from "./tldr-fallback";
import type { DayGroup, FeedItem, FeedResponse, TldrBullet } from "./types";

/** Older `tldr_snapshots` rows were written with a single `item_id` string
 * per bullet; newer rows use `item_ids: string[]`. Normalize both to
 * `item_ids` so the frontend only ever has to handle one shape. */
function normalizeStoredBullets(raw: unknown): TldrBullet[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((b: Record<string, unknown>) => {
    const itemIds = Array.isArray(b.item_ids)
      ? (b.item_ids as string[])
      : typeof b.item_id === "string" && b.item_id
        ? [b.item_id as string]
        : [];
    return { text: b.text as string, item_ids: itemIds };
  });
}

interface ItemRow {
  id: string;
  url: string;
  title: string;
  title_vi: string | null;
  summary: string | null;
  summary_vi: string | null;
  category: string | null;
  published_at: number;
  points: number;
  comments: number;
  rank_score: number;
  source_id: string;
  tags: string;
  llm_tokens?: number;
  image_url?: string | null;
}

const ITEM_SELECT_BASE = `
  SELECT i.id, i.url, i.title, t.title AS title_vi, i.summary,
         t.summary AS summary_vi, i.category,
         i.published_at, i.points, i.comments, i.rank_score, i.source_id, i.tags{tokens}{image}
  FROM items i
  LEFT JOIN translations t ON t.item_id = i.id AND t.lang = 'vi'
  WHERE i.status = 'published'
`;

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

async function supportsLlmTokens(db: D1Database): Promise<boolean> {
  llmTokensSupported = await probeColumn(db, "llm_tokens", llmTokensSupported);
  return llmTokensSupported;
}

async function supportsImageUrl(db: D1Database): Promise<boolean> {
  imageUrlSupported = await probeColumn(db, "image_url", imageUrlSupported);
  return imageUrlSupported;
}

function toFeedItem(row: ItemRow): FeedItem {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags || "[]");
  } catch {
    // malformed tags JSON from an old pipeline run — treat as untagged
  }
  return {
    ...row,
    tags,
    sources: [],
    llm_tokens: row.llm_tokens ?? 0,
    image_url: row.image_url ?? null,
  };
}

async function attachSources(db: D1Database, items: FeedItem[]): Promise<void> {
  if (items.length === 0) return;
  const byId = new Map(items.map((i) => [i.id, i]));
  const ids = [...byId.keys()];
  try {
    // Chunk to stay under D1's bound-parameter limit
    for (let i = 0; i < ids.length; i += 90) {
      const chunk = ids.slice(i, i + 90);
      const placeholders = chunk.map(() => "?").join(",");
      const { results } = await db
        .prepare(
          `SELECT item_id, kind, author, posted_at, quote, url FROM item_sources
           WHERE item_id IN (${placeholders}) ORDER BY item_id, position`
        )
        .bind(...chunk)
        .all<{
          item_id: string;
          kind: string;
          author: string | null;
          posted_at: number | null;
          quote: string | null;
          url: string | null;
        }>();
      for (const row of results ?? []) {
        byId.get(row.item_id)?.sources.push({
          kind: row.kind,
          author: row.author,
          posted_at: row.posted_at,
          quote: row.quote,
          url: row.url,
        });
      }
    }
  } catch {
    // item_sources table may not exist yet (pre-migration) — feed still works
  }
}

function groupByDay(items: FeedItem[]): DayGroup[] {
  const map = new Map<string, FeedItem[]>();
  for (const item of items) {
    const date = new Date(item.published_at * 1000).toISOString().slice(0, 10);
    const list = map.get(date) ?? [];
    list.push(item);
    map.set(date, list);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, dayItems]) => {
      dayItems.sort((a, b) => b.rank_score - a.rank_score);
      const categoryCounts: Record<string, number> = {};
      for (const it of dayItems) {
        if (it.category)
          categoryCounts[it.category] = (categoryCounts[it.category] ?? 0) + 1;
      }
      return { date, items: dayItems, categoryCounts };
    });
}

export async function getFeed(
  db: D1Database,
  opts: { category?: string; q?: string; days?: number; before?: string } = {}
): Promise<FeedResponse> {
  const days = opts.days ?? (opts.q ? 30 : 3);
  const until = opts.before
    ? Math.floor(Date.parse(`${opts.before}T00:00:00Z`) / 1000)
    : Math.floor(Date.now() / 1000);
  const since = until - days * 86400;

  const [hasLlmTokens, hasImageUrl] = await Promise.all([
    supportsLlmTokens(db),
    supportsImageUrl(db),
  ]);
  const itemSelect = ITEM_SELECT_BASE.replace(
    "{tokens}",
    hasLlmTokens ? ", COALESCE(i.llm_tokens, 0) AS llm_tokens" : ""
  ).replace("{image}", hasImageUrl ? ", i.image_url" : "");

  let sql = `${itemSelect} AND i.published_at >= ? AND i.published_at < ?`;
  const binds: unknown[] = [since, until];
  if (opts.category) {
    sql += " AND lower(i.category) = ?";
    binds.push(opts.category.toLowerCase());
  }
  if (opts.q) {
    sql += " AND (i.title LIKE ? OR t.title LIKE ?)";
    binds.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  sql += " ORDER BY i.published_at DESC LIMIT 500";

  const [itemsRes, catsRes, tldrRes, fetchedRes, olderRes] = await Promise.all([
    db
      .prepare(sql)
      .bind(...binds)
      .all<ItemRow>(),
    db
      .prepare(
        `SELECT category AS name, COUNT(*) AS count FROM items
         WHERE status = 'published' AND category IS NOT NULL AND published_at >= ? AND published_at < ?
         GROUP BY category ORDER BY count DESC`
      )
      .bind(since, until)
      .all<{ name: string; count: number }>(),
    db
      .prepare(
        "SELECT date, bullets_en, bullets_vi FROM tldr_snapshots ORDER BY date DESC LIMIT 1"
      )
      .all<{ date: string; bullets_en: string; bullets_vi: string }>(),
    db
      .prepare(
        "SELECT MAX(fetched_at) AS last FROM items WHERE status = 'published'"
      )
      .all<{ last: number | null }>(),
    db
      .prepare(
        `SELECT 1 AS yes FROM items
         WHERE status = 'published' AND published_at < ?
         LIMIT 1`
      )
      .bind(since)
      .all<{ yes: number }>(),
  ]);

  const items = (itemsRes.results ?? []).map(toFeedItem);
  await attachSources(db, items);

  // Trending: top tags in the last 24h, computed in JS (tags are a JSON column)
  const dayAgo = Math.floor(Date.now() / 1000) - 86400;
  const tagCounts = new Map<string, number>();
  for (const it of items) {
    if (it.published_at < dayAgo) continue;
    for (const tag of it.tags)
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    if (it.tags.length === 0) {
      const lower = it.title.toLowerCase();
      for (const kw of TITLE_KEYWORDS) {
        if (lower.includes(kw.toLowerCase()))
          tagCounts.set(kw, (tagCounts.get(kw) ?? 0) + 1);
      }
    }
  }
  // Dynamic trending size: every tag mentioned 2+ times today earns a chip
  // (capped at 16 so the row stays scannable); single-mention tags only top
  // the list up to a floor of 8 on quiet days.
  const ranked = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
  const hot = ranked.filter(([, count]) => count >= 2).slice(0, 16);
  const trending = (
    hot.length >= 8 ? hot : ranked.slice(0, Math.min(8, ranked.length))
  ).map(([tag, count]) => ({ tag, count }));

  let tldr: FeedResponse["tldr"] = null;
  const tldrRow = tldrRes.results?.[0];
  if (tldrRow) {
    try {
      tldr = {
        date: tldrRow.date,
        bullets_en: normalizeStoredBullets(JSON.parse(tldrRow.bullets_en)),
        bullets_vi: normalizeStoredBullets(JSON.parse(tldrRow.bullets_vi)),
      };
    } catch {
      // malformed snapshot — render feed without TL;DR
    }
  }

  return {
    tldr: resolveTldrForDisplay(tldr, items),
    days: groupByDay(items),
    categories: catsRes.results ?? [],
    trending,
    totalStories: items.length,
    updatedAt: Date.now(),
    lastFetchedAt: fetchedRes.results?.[0]?.last ?? null,
    hasMore: (olderRes.results ?? []).length > 0,
  };
}
