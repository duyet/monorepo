import "./preview-shim.js";
import { normalizeApiBase } from "./settings.js";

const CACHE_KEY = "newsTabFeedCache";

function asChrome() {
  return globalThis.chrome;
}

export function publicUrl(apiBase) {
  return `${normalizeApiBase(apiBase)}/api/public`;
}

export function feedUrl(apiBase) {
  return `${normalizeApiBase(apiBase)}/api/feed`;
}

function clipText(value) {
  return typeof value === "string" ? value : "";
}

function normalizeBullet(raw) {
  if (!raw || typeof raw !== "object") {
    return { text: "", item_ids: [], image_url: null };
  }
  const itemIds = Array.isArray(raw.item_ids)
    ? raw.item_ids.filter((id) => typeof id === "string")
    : typeof raw.item_id === "string" && raw.item_id
      ? [raw.item_id]
      : [];
  const image = raw.image_url || raw.imageUrl || null;
  return {
    text: clipText(raw.text),
    item_ids: itemIds,
    image_url: typeof image === "string" ? image : null,
  };
}

function normalizeStory(raw) {
  if (!raw || typeof raw !== "object") return null;
  const url = clipText(raw.url);
  const title = clipText(raw.title);
  if (!url && !title) return null;
  const image = raw.image_url || raw.imageUrl || null;
  return {
    id: clipText(raw.id),
    url,
    title,
    title_vi: raw.title_vi ? clipText(raw.title_vi) : null,
    category: raw.category ? clipText(raw.category) : null,
    image_url: typeof image === "string" ? image : null,
    published_at: Number(raw.published_at) || 0,
  };
}

function categoriesFromStories(stories) {
  const counts = new Map();
  for (const story of stories) {
    if (!story.category) continue;
    counts.set(story.category, (counts.get(story.category) || 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

export function normalizeDigest(raw) {
  const tldr =
    raw?.tldr && typeof raw.tldr === "object"
      ? {
          date: clipText(raw.tldr.date),
          bullets_en: (raw.tldr.bullets_en || []).map(normalizeBullet),
          bullets_vi: (raw.tldr.bullets_vi || []).map(normalizeBullet),
        }
      : null;

  let stories = [];
  if (Array.isArray(raw?.stories)) {
    stories = raw.stories.map(normalizeStory).filter(Boolean);
  } else if (Array.isArray(raw?.days)) {
    stories = raw.days
      .flatMap((day) => (Array.isArray(day.items) ? day.items : []))
      .map(normalizeStory)
      .filter(Boolean);
  }

  const categories = Array.isArray(raw?.categories)
    ? raw.categories
        .map((c) => ({
          name: clipText(c.name),
          count: Number(c.count) || 0,
        }))
        .filter((c) => c.name)
    : categoriesFromStories(stories);

  const trending = Array.isArray(raw?.trending)
    ? raw.trending
        .map((row) => ({
          tag: clipText(row.tag),
          count: Number(row.count) || 0,
        }))
        .filter((row) => row.tag)
    : [];

  return {
    tldr,
    stories,
    categories,
    trending,
    updatedAt: Number(raw?.updatedAt) || Date.now(),
  };
}

async function readJson(url) {
  const response = await fetch(url, { credentials: "omit" });
  if (!response.ok) throw new Error(`http ${response.status}`);
  const type = response.headers.get("content-type") || "";
  if (!type.includes("json")) throw new Error("not json");
  return response.json();
}

export async function readCachedDigest() {
  try {
    const bag = await asChrome().storage.local.get(CACHE_KEY);
    const cached = bag?.[CACHE_KEY];
    if (cached?.digest) return normalizeDigest(cached.digest);
  } catch {
    // ignore
  }
  return null;
}

export async function writeCachedDigest(digest) {
  try {
    await asChrome().storage.local.set({
      [CACHE_KEY]: { digest, savedAt: Date.now() },
    });
  } catch {
    // ignore quota
  }
}

export async function fetchDigest(apiBase) {
  try {
    const data = await readJson(publicUrl(apiBase));
    const digest = normalizeDigest(data);
    await writeCachedDigest(digest);
    return { digest, source: "public", stale: false };
  } catch {
    try {
      const data = await readJson(feedUrl(apiBase));
      const digest = normalizeDigest(data);
      await writeCachedDigest(digest);
      return { digest, source: "feed", stale: false };
    } catch {
      const cached = await readCachedDigest();
      if (cached) return { digest: cached, source: "cache", stale: true };
      throw new Error("unavailable");
    }
  }
}
