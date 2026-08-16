import { toEpochSeconds } from "../time.js";
import type { FetchedItem, FetchedItemSource, SourceAdapter } from "./types.js";

const DATA_URL = "https://huggingnews.com/__data.json";
const SITEMAP_URL_PREFIX = "https://huggingnews.com/sitemaps/stories-";
const MAX_SOURCES_PER_ITEM = 8;
// Hard cap on the extra per-story detail fetches made to enrich items with
// selectedTweets: the feed listing itself doesn't carry this data (see
// findDayGroupsNode's stories), only each story's own detail page does.
const MAX_DETAIL_FETCHES = 20;
const DETAIL_BATCH_SIZE = 4;
const DETAIL_FETCH_TIMEOUT_MS = 8_000;
const MAX_SUMMARY_CHARS = 1200;

/**
 * SvelteKit `__data.json` payloads flatten object graphs into a single
 * array, where object/array values that are plain numbers are indices
 * into that same array rather than literal numbers. This walks the graph
 * starting at `idx`, replacing every such index with the resolved value.
 */
export function resolve(data: unknown[], idx: number, depth = 0): unknown {
  if (depth > 40) return undefined;
  if (idx < 0 || idx >= data.length) return undefined;
  const value = data[idx];

  if (Array.isArray(value)) {
    return value.map((entry) =>
      typeof entry === "number" ? resolve(data, entry, depth + 1) : entry
    );
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(
      value as Record<string, unknown>
    )) {
      out[key] =
        typeof entry === "number" ? resolve(data, entry, depth + 1) : entry;
    }
    return out;
  }

  return value;
}

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
}

function toEpochMs(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

function findDayGroupsNode(data: unknown[]): unknown[] | null {
  for (let i = 0; i < data.length; i++) {
    const resolved = resolve(data, i);
    if (!resolved || typeof resolved !== "object") continue;
    const dayGroups = deepFind(resolved, "dayGroups");
    if (Array.isArray(dayGroups)) return dayGroups;
  }
  return null;
}

function deepFind(obj: unknown, key: string, depth = 0): unknown {
  if (depth > 6 || !obj || typeof obj !== "object") return undefined;
  if (key in (obj as Record<string, unknown>)) {
    return (obj as Record<string, unknown>)[key];
  }
  for (const value of Object.values(obj as Record<string, unknown>)) {
    if (value && typeof value === "object") {
      const found = deepFind(value, key, depth + 1);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

/** A parsed feed story, plus the slug/topic/priority needed to fetch its
 * detail page for selectedTweets, kept separate from the public FetchedItem
 * shape. */
interface RawStory {
  item: FetchedItem;
  slug: string;
  topicSlug: string;
  /** Lower is more prominent when present (feed's own per-day rank);
   * falls back to Infinity so unranked stories sort last. */
  priority: number;
}

function storyToRawStory(story: Record<string, unknown>): RawStory | null {
  const title = pick(story, ["title", "headline"]);
  const slug = pick(story, ["slug"]);
  const topic = pick(story, ["primaryRoutingTopic"]);
  const topicSlug = typeof topic === "string" ? topic : "ai";
  let url = pick(story, ["url", "link", "sourceUrl"]);

  if (typeof url !== "string" && typeof slug === "string") {
    url = `https://huggingnews.com/${topicSlug}/${slug}`;
  }

  const publishedRaw = pick(story, [
    "publishedAt",
    "published_at",
    "eventTimeApprox",
  ]);
  const publishedAtMs = toEpochMs(publishedRaw);

  if (
    typeof title !== "string" ||
    typeof url !== "string" ||
    publishedAtMs === null
  ) {
    return null;
  }

  const points = pick(story, ["points", "score", "storyScore"]);
  const comments = pick(story, ["comments", "commentCount", "tweetCount"]);
  const externalId = pick(story, ["storyId", "id"]);
  const rank = pick(story, ["rank"]);
  const storyScore = pick(story, ["storyScore"]);
  const priority =
    typeof rank === "number"
      ? rank
      : typeof storyScore === "number"
        ? -storyScore
        : Number.POSITIVE_INFINITY;

  return {
    item: {
      externalId: typeof externalId === "string" ? externalId : undefined,
      url,
      title,
      // eventTimeApprox/publishedAt from HuggingNews are epoch milliseconds;
      // normalize to seconds so this adapter's own output already matches
      // the schema (the workflow's write layer also normalizes defensively).
      publishedAt: toEpochSeconds(publishedAtMs),
      points: typeof points === "number" ? Math.round(points) : 0,
      comments: typeof comments === "number" ? comments : 0,
    },
    slug: typeof slug === "string" ? slug : "",
    topicSlug,
    priority,
  };
}

async function fetchRawStories(): Promise<RawStory[]> {
  const res = await fetch(DATA_URL, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) return [];
  const payload = (await res.json()) as { nodes?: unknown[] };
  const nodes = payload.nodes ?? [];

  const stories: RawStory[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const data = (node as { data?: unknown[] }).data;
    if (!Array.isArray(data)) continue;

    const dayGroups = findDayGroupsNode(data);
    if (!dayGroups) continue;

    for (const dayGroup of dayGroups) {
      if (!dayGroup || typeof dayGroup !== "object") continue;
      const rawStories = (dayGroup as Record<string, unknown>).stories;
      if (!Array.isArray(rawStories)) continue;
      for (const story of rawStories) {
        if (!story || typeof story !== "object") continue;
        const raw = storyToRawStory(story as Record<string, unknown>);
        if (raw) stories.push(raw);
      }
    }
  }
  return stories;
}

interface SelectedTweet {
  label?: unknown;
  authorHandle?: unknown;
  author?: unknown;
  bestBit?: unknown;
  quote?: unknown;
  url?: unknown;
  link?: unknown;
  tweetedAt?: unknown;
  postedAt?: unknown;
}

function tweetToSource(tweet: SelectedTweet): FetchedItemSource | null {
  const url = pick(tweet as Record<string, unknown>, ["url", "link"]);
  if (typeof url !== "string") return null;

  const label = pick(tweet as Record<string, unknown>, ["label"]);
  const kind: FetchedItemSource["kind"] =
    typeof label === "string" && label.toLowerCase() === "source"
      ? "source"
      : "support";

  const authorRaw = pick(tweet as Record<string, unknown>, [
    "authorHandle",
    "author",
  ]);
  const author =
    typeof authorRaw === "string"
      ? authorRaw.startsWith("@")
        ? authorRaw
        : `@${authorRaw}`
      : undefined;

  const postedAtRaw = pick(tweet as Record<string, unknown>, [
    "tweetedAt",
    "postedAt",
  ]);
  const postedAtMs = toEpochMs(postedAtRaw);

  const quoteRaw = pick(tweet as Record<string, unknown>, ["bestBit", "quote"]);

  return {
    kind,
    author,
    postedAt: postedAtMs === null ? undefined : toEpochSeconds(postedAtMs),
    quote: typeof quoteRaw === "string" ? quoteRaw : undefined,
    url,
  };
}

export interface StoryDetail {
  sources: FetchedItemSource[];
  /** The story's written body, from `focusedStoryDetail.data.summary` — a
   * plain string (paragraphs already separated by blank lines), NOT an
   * array of paragraph objects. Capped to MAX_SUMMARY_CHARS. */
  summary?: string;
}

const EMPTY_STORY_DETAIL: StoryDetail = { sources: [] };

/** Parses a fetched `__data.json` detail payload, extracting both the
 * written body (`focusedStoryDetail.data.summary`) and up to
 * MAX_SOURCES_PER_ITEM sources (`focusedStoryDetail.data.selectedTweets`)
 * from the SAME resolved object. Returns an empty result on any shape
 * mismatch; never throws. */
function parseStoryDetailPayload(payload: { nodes?: unknown[] }): StoryDetail {
  const nodes = payload.nodes ?? [];

  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const data = (node as { data?: unknown[] }).data;
    if (!Array.isArray(data)) continue;

    for (let i = 0; i < data.length; i++) {
      const resolved = resolve(data, i);
      if (!resolved || typeof resolved !== "object") continue;
      const tweets = deepFind(resolved, "selectedTweets");
      const summaryRaw = deepFind(resolved, "summary");
      if (!Array.isArray(tweets) && typeof summaryRaw !== "string") {
        continue;
      }

      const sources: FetchedItemSource[] = [];
      if (Array.isArray(tweets)) {
        for (const tweet of tweets) {
          if (!tweet || typeof tweet !== "object") continue;
          const source = tweetToSource(tweet as SelectedTweet);
          if (source) sources.push(source);
          if (sources.length >= MAX_SOURCES_PER_ITEM) break;
        }
      }
      const summary =
        typeof summaryRaw === "string" && summaryRaw.trim()
          ? summaryRaw.trim().slice(0, MAX_SUMMARY_CHARS)
          : undefined;

      if (sources.length > 0 || summary) return { sources, summary };
    }
  }
  return EMPTY_STORY_DETAIL;
}

/** Fetches a story's `__data.json` detail page directly at `detailUrl` and
 * parses it. Any failure (network, non-2xx, shape mismatch) resolves to an
 * empty result, never throws. Shared by the feed adapter (which knows the
 * topic/slug split) and the backfill pass (which only has the item's own
 * canonical URL and appends `/__data.json` to it). */
export async function fetchStoryDetailByUrl(
  detailUrl: string
): Promise<StoryDetail> {
  try {
    const res = await fetch(detailUrl, {
      signal: AbortSignal.timeout(DETAIL_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return EMPTY_STORY_DETAIL;
    const payload = (await res.json()) as { nodes?: unknown[] };
    return parseStoryDetailPayload(payload);
  } catch (error) {
    console.error(`huggingnews detail fetch failed for ${detailUrl}:`, error);
    return EMPTY_STORY_DETAIL;
  }
}

async function fetchStoryDetail(
  topicSlug: string,
  slug: string
): Promise<StoryDetail> {
  return fetchStoryDetailByUrl(
    `https://huggingnews.com/${topicSlug}/${slug}/__data.json`
  );
}

/** Enriches the highest-priority stories with per-story sources and body
 * text, bounded by MAX_DETAIL_FETCHES total requests, DETAIL_BATCH_SIZE at
 * a time. */
async function enrichWithDetail(stories: RawStory[]): Promise<FetchedItem[]> {
  const prioritized = [...stories].sort((a, b) => a.priority - b.priority);
  const toEnrich = prioritized.slice(0, MAX_DETAIL_FETCHES);

  for (let i = 0; i < toEnrich.length; i += DETAIL_BATCH_SIZE) {
    const batch = toEnrich.slice(i, i + DETAIL_BATCH_SIZE);
    await Promise.all(
      batch.map(async (raw) => {
        const detail = await fetchStoryDetail(raw.topicSlug, raw.slug);
        if (detail.sources.length > 0) raw.item.sources = detail.sources;
        if (detail.summary) raw.item.summary = detail.summary;
      })
    );
  }

  return stories.map((raw) => raw.item);
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/-[0-9a-f]{8}$/i, "")
    .split("-")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

async function fetchFromSitemap(): Promise<FetchedItem[]> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const res = await fetch(`${SITEMAP_URL_PREFIX}${dateStr}.xml`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return [];
  const xml = await res.text();

  const items: FetchedItem[] = [];
  const urlRe = /<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>/g;
  for (const match of xml.matchAll(urlRe)) {
    const url = match[1];
    const lastmod = match[2];
    const publishedAtMs = Date.parse(lastmod);
    const slugMatch = url.match(/\/([^/]+)$/);
    if (!slugMatch || Number.isNaN(publishedAtMs)) continue;
    items.push({
      url,
      title: slugToTitle(slugMatch[1]),
      publishedAt: toEpochSeconds(publishedAtMs),
    });
  }
  return items;
}

export const huggingNewsAdapter: SourceAdapter = {
  type: "huggingnews",

  async fetchItems(_config, sinceEpochSec) {
    try {
      const stories = await fetchRawStories();
      const freshStories = stories.filter(
        (raw) => raw.item.publishedAt >= sinceEpochSec
      );
      if (freshStories.length > 0) return enrichWithDetail(freshStories);

      // Sitemap fallback carries no slug/topic split usable for the detail
      // fetch (URL is already assembled), so these items are never enriched.
      const sitemapItems = await fetchFromSitemap();
      return sitemapItems.filter((item) => item.publishedAt >= sinceEpochSec);
    } catch (error) {
      console.error("huggingnews adapter failed:", error);
      return [];
    }
  },
};
