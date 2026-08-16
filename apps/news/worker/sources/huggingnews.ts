import { toEpochSeconds } from "../time.js";
import type { FetchedItem, SourceAdapter } from "./types.js";

const DATA_URL = "https://huggingnews.com/__data.json";
const SITEMAP_URL_PREFIX = "https://huggingnews.com/sitemaps/stories-";

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

function storyToItem(story: Record<string, unknown>): FetchedItem | null {
  const title = pick(story, ["title", "headline"]);
  const slug = pick(story, ["slug"]);
  let url = pick(story, ["url", "link", "sourceUrl"]);

  if (typeof url !== "string" && typeof slug === "string") {
    const topic = pick(story, ["primaryRoutingTopic"]);
    const topicSlug = typeof topic === "string" ? topic : "ai";
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

  return {
    externalId: typeof externalId === "string" ? externalId : undefined,
    url,
    title,
    // eventTimeApprox/publishedAt from HuggingNews are epoch milliseconds;
    // normalize to seconds so this adapter's own output already matches
    // the schema (the workflow's write layer also normalizes defensively).
    publishedAt: toEpochSeconds(publishedAtMs),
    points: typeof points === "number" ? Math.round(points) : 0,
    comments: typeof comments === "number" ? comments : 0,
  };
}

async function fetchFromDataJson(): Promise<FetchedItem[]> {
  const res = await fetch(DATA_URL, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) return [];
  const payload = (await res.json()) as { nodes?: unknown[] };
  const nodes = payload.nodes ?? [];

  const items: FetchedItem[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const data = (node as { data?: unknown[] }).data;
    if (!Array.isArray(data)) continue;

    const dayGroups = findDayGroupsNode(data);
    if (!dayGroups) continue;

    for (const dayGroup of dayGroups) {
      if (!dayGroup || typeof dayGroup !== "object") continue;
      const stories = (dayGroup as Record<string, unknown>).stories;
      if (!Array.isArray(stories)) continue;
      for (const story of stories) {
        if (!story || typeof story !== "object") continue;
        const item = storyToItem(story as Record<string, unknown>);
        if (item) items.push(item);
      }
    }
  }
  return items;
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
      const items = await fetchFromDataJson();
      const filtered = items.filter(
        (item) => item.publishedAt >= sinceEpochSec
      );
      if (filtered.length > 0) return filtered;

      const sitemapItems = await fetchFromSitemap();
      return sitemapItems.filter((item) => item.publishedAt >= sinceEpochSec);
    } catch (error) {
      console.error("huggingnews adapter failed:", error);
      return [];
    }
  },
};
