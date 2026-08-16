import type { FetchedItem, SourceAdapter } from "./types.js";

const AI_KEYWORD_RE =
  /\b(ai|llm|gpt|claude|gemini|openai|anthropic|deepseek|qwen|mistral|llama|model|agent|transformer|neural|machine learning|nvidia|hugging ?face)\b/i;

interface AlgoliaHit {
  objectID: string;
  title?: string;
  story_title?: string;
  url?: string;
  story_url?: string;
  created_at_i: number;
  points?: number;
  num_comments?: number;
  author?: string;
}

interface AlgoliaResponse {
  hits: AlgoliaHit[];
}

function hitToItem(hit: AlgoliaHit): FetchedItem | null {
  const title = hit.title ?? hit.story_title;
  const url = hit.url ?? hit.story_url;
  if (!title || !url) return null;
  return {
    externalId: hit.objectID,
    url,
    title,
    publishedAt: hit.created_at_i * 1000,
    points: hit.points ?? 0,
    comments: hit.num_comments ?? 0,
    sources: [
      {
        kind: "discussion",
        author: hit.author,
        postedAt: hit.created_at_i,
        url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
      },
    ],
  };
}

async function search(url: string): Promise<AlgoliaHit[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) return [];
  const data = (await res.json()) as AlgoliaResponse;
  return data.hits ?? [];
}

export const hnAdapter: SourceAdapter = {
  type: "hn",

  async fetchItems(config, sinceEpochSec) {
    const query = typeof config.query === "string" ? config.query : "";
    const numericFilters = `created_at_i>${sinceEpochSec}`;

    const byDateUrl = new URL("https://hn.algolia.com/api/v1/search_by_date");
    byDateUrl.searchParams.set("tags", "story");
    if (query) byDateUrl.searchParams.set("query", query);
    byDateUrl.searchParams.set("numericFilters", numericFilters);
    byDateUrl.searchParams.set("hitsPerPage", "100");

    const frontPageUrl = new URL("https://hn.algolia.com/api/v1/search");
    frontPageUrl.searchParams.set("tags", "front_page");
    frontPageUrl.searchParams.set("numericFilters", numericFilters);
    frontPageUrl.searchParams.set("hitsPerPage", "100");

    const [byDateHits, frontPageHits] = await Promise.all([
      search(byDateUrl.toString()),
      search(frontPageUrl.toString()),
    ]);

    const seen = new Map<string, AlgoliaHit>();
    for (const hit of [...byDateHits, ...frontPageHits]) {
      if (!seen.has(hit.objectID)) seen.set(hit.objectID, hit);
    }

    const items: FetchedItem[] = [];
    for (const hit of seen.values()) {
      const item = hitToItem(hit);
      if (!item) continue;
      if (!AI_KEYWORD_RE.test(item.title)) continue;
      items.push(item);
    }
    return items;
  },
};
