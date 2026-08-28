import { isThinDisplayTldr, synthesizeTldrFromItems } from "./tldr-fallback";
import type { TldrBullet } from "./types";

/** Top stories on the public digest — keep the payload well under 50KB. */
export const PUBLIC_STORY_LIMIT = 8;
/** Snapshots store at most 16; cap again so a bloated row cannot balloon. */
export const PUBLIC_BULLET_CAP = 16;

export interface PublicStory {
  id: string;
  url: string;
  title: string;
  title_vi: string | null;
  category: string | null;
  image_url: string | null;
  published_at: number;
}

export interface PublicDigest {
  tldr: {
    date: string;
    bullets_en: TldrBullet[];
    bullets_vi: TldrBullet[];
  } | null;
  stories: PublicStory[];
  updatedAt: number;
}

interface StoryRow {
  id: string;
  url: string;
  title: string;
  title_vi: string | null;
  category: string | null;
  image_url?: string | null;
  published_at: number;
}

const STORIES_SQL = `SELECT i.id, i.url, i.title, tr.title AS title_vi, i.category,
       i.image_url, i.published_at
FROM items i
LEFT JOIN translations tr ON tr.item_id = i.id AND tr.lang = 'vi'
WHERE i.status = 'published'
ORDER BY i.rank_score DESC
LIMIT ?`;

const STORIES_SQL_NO_IMAGE = `SELECT i.id, i.url, i.title, tr.title AS title_vi, i.category,
       i.published_at
FROM items i
LEFT JOIN translations tr ON tr.item_id = i.id AND tr.lang = 'vi'
WHERE i.status = 'published'
ORDER BY i.rank_score DESC
LIMIT ?`;

const TLDR_SQL =
  "SELECT date, bullets_en, bullets_vi FROM tldr_snapshots ORDER BY date DESC LIMIT 1";

function capBullets(raw: TldrBullet[]): TldrBullet[] {
  return raw.slice(0, PUBLIC_BULLET_CAP).map((b) => ({
    text: typeof b.text === "string" ? b.text : "",
    item_ids: Array.isArray(b.item_ids)
      ? b.item_ids.filter((id): id is string => typeof id === "string")
      : [],
  }));
}

/** Older `tldr_snapshots` rows used a single `item_id` string per bullet. */
export function normalizeStoredBullets(raw: unknown): TldrBullet[] {
  if (!Array.isArray(raw)) return [];
  return capBullets(
    raw.map((b: Record<string, unknown>) => {
      const itemIds = Array.isArray(b.item_ids)
        ? (b.item_ids as string[])
        : typeof b.item_id === "string" && b.item_id
          ? [b.item_id as string]
          : [];
      return { text: (b.text as string) ?? "", item_ids: itemIds };
    })
  );
}

function parseTldrRow(
  row: {
    date: string;
    bullets_en: string;
    bullets_vi: string;
  } | null
): PublicDigest["tldr"] {
  if (!row) return null;
  try {
    return {
      date: row.date,
      bullets_en: normalizeStoredBullets(JSON.parse(row.bullets_en)),
      bullets_vi: normalizeStoredBullets(JSON.parse(row.bullets_vi)),
    };
  } catch {
    return null;
  }
}

function toPublicStory(row: StoryRow): PublicStory {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    title_vi: row.title_vi ?? null,
    category: row.category ?? null,
    image_url: row.image_url ?? null,
    published_at: row.published_at,
  };
}

async function loadTopStories(db: D1Database): Promise<PublicStory[]> {
  try {
    const { results } = await db
      .prepare(STORIES_SQL)
      .bind(PUBLIC_STORY_LIMIT)
      .all<StoryRow>();
    return (results ?? []).map(toPublicStory);
  } catch {
    const { results } = await db
      .prepare(STORIES_SQL_NO_IMAGE)
      .bind(PUBLIC_STORY_LIMIT)
      .all<StoryRow>();
    return (results ?? []).map(toPublicStory);
  }
}

function resolvePublicTldr(
  tldr: PublicDigest["tldr"],
  stories: PublicStory[]
): PublicDigest["tldr"] {
  if (!isThinDisplayTldr(tldr) && tldr) return tldr;
  if (stories.length < 2) return tldr;
  const fallback = synthesizeTldrFromItems(stories);
  if (fallback.bullets_en.length < 2) return tldr;
  return {
    date: tldr?.date ?? "",
    bullets_en: capBullets(fallback.bullets_en),
    bullets_vi: capBullets(fallback.bullets_vi),
  };
}

export async function getPublicDigest(db: D1Database): Promise<PublicDigest> {
  const [tldrRes, stories] = await Promise.all([
    db
      .prepare(TLDR_SQL)
      .all<{ date: string; bullets_en: string; bullets_vi: string }>(),
    loadTopStories(db),
  ]);

  const tldr = resolvePublicTldr(
    parseTldrRow(tldrRes.results?.[0] ?? null),
    stories
  );

  return {
    tldr,
    stories,
    updatedAt: Date.now(),
  };
}
