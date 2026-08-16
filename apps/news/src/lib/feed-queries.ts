import type { DayGroup, FeedItem, FeedResponse } from "./types";

interface ItemRow {
  id: string;
  url: string;
  title: string;
  title_vi: string | null;
  category: string | null;
  published_at: number;
  points: number;
  comments: number;
  rank_score: number;
  source_id: string;
  tags: string;
}

const ITEM_SELECT = `
  SELECT i.id, i.url, i.title, t.title AS title_vi, i.category,
         i.published_at, i.points, i.comments, i.rank_score, i.source_id, i.tags
  FROM items i
  LEFT JOIN translations t ON t.item_id = i.id AND t.lang = 'vi'
  WHERE i.status = 'published'
`;

function toFeedItem(row: ItemRow): FeedItem {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags || "[]");
  } catch {
    // malformed tags JSON from an old pipeline run — treat as untagged
  }
  return { ...row, tags };
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
  opts: { category?: string; q?: string; days?: number } = {}
): Promise<FeedResponse> {
  const days = opts.days ?? 7;
  const since = Math.floor(Date.now() / 1000) - days * 86400;

  let sql = `${ITEM_SELECT} AND i.published_at >= ?`;
  const binds: unknown[] = [since];
  if (opts.category) {
    sql += " AND lower(i.category) = ?";
    binds.push(opts.category.toLowerCase());
  }
  if (opts.q) {
    sql += " AND (i.title LIKE ? OR t.title LIKE ?)";
    binds.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  sql += " ORDER BY i.published_at DESC LIMIT 500";

  const [itemsRes, catsRes, tldrRes] = await Promise.all([
    db
      .prepare(sql)
      .bind(...binds)
      .all<ItemRow>(),
    db
      .prepare(
        `SELECT category AS name, COUNT(*) AS count FROM items
         WHERE status = 'published' AND category IS NOT NULL AND published_at >= ?
         GROUP BY category ORDER BY count DESC`
      )
      .bind(since)
      .all<{ name: string; count: number }>(),
    db
      .prepare(
        "SELECT date, bullets_en, bullets_vi FROM tldr_snapshots ORDER BY date DESC LIMIT 1"
      )
      .all<{ date: string; bullets_en: string; bullets_vi: string }>(),
  ]);

  const items = (itemsRes.results ?? []).map(toFeedItem);

  // Trending: top tags in the last 24h, computed in JS (tags are a JSON column)
  const dayAgo = Math.floor(Date.now() / 1000) - 86400;
  const tagCounts = new Map<string, number>();
  for (const it of items) {
    if (it.published_at < dayAgo) continue;
    for (const tag of it.tags)
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
  const trending = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  let tldr: FeedResponse["tldr"] = null;
  const tldrRow = tldrRes.results?.[0];
  if (tldrRow) {
    try {
      tldr = {
        date: tldrRow.date,
        bullets_en: JSON.parse(tldrRow.bullets_en),
        bullets_vi: JSON.parse(tldrRow.bullets_vi),
      };
    } catch {
      // malformed snapshot — render feed without TL;DR
    }
  }

  return {
    tldr,
    days: groupByDay(items),
    categories: catsRes.results ?? [],
    trending,
    totalStories: items.length,
    updatedAt: Date.now(),
  };
}
