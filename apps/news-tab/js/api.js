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
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((tag) => typeof tag === "string" && tag)
      : [],
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

function itemIndexFromStories(stories) {
  const items = {};
  for (const story of stories) {
    if (!story.id) continue;
    items[story.id] = {
      tags: story.tags || [],
      category: story.category,
      image_url: story.image_url,
    };
  }
  return items;
}

function itemIndexFromFeed(raw) {
  const items = {};
  const days = Array.isArray(raw?.days) ? raw.days : [];
  for (const day of days) {
    const rows = Array.isArray(day?.items) ? day.items : [];
    for (const row of rows) {
      const story = normalizeStory(row);
      if (!story?.id) continue;
      items[story.id] = {
        tags: story.tags,
        category: story.category,
        image_url: story.image_url,
      };
    }
  }
  return items;
}

export function enrichDigest(digest, feedRaw) {
  if (!feedRaw || typeof feedRaw !== "object") return digest;
  const feedCats = Array.isArray(feedRaw.categories)
    ? feedRaw.categories
        .map((c) => ({
          name: clipText(c.name),
          count: Number(c.count) || 0,
        }))
        .filter((c) => c.name)
    : [];
  const feedTrend = Array.isArray(feedRaw.trending)
    ? feedRaw.trending
        .map((row) => ({
          tag: clipText(row.tag),
          count: Number(row.count) || 0,
        }))
        .filter((row) => row.tag)
    : [];
  return {
    ...digest,
    categories: feedCats.length ? feedCats : digest.categories,
    trending: feedTrend.length ? feedTrend : digest.trending,
    items: { ...digest.items, ...itemIndexFromFeed(feedRaw) },
    totalStories: Number(feedRaw.totalStories) || digest.totalStories,
    lastFetchedAt: Number(feedRaw.lastFetchedAt) || digest.lastFetchedAt,
  };
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

  const digest = {
    tldr,
    stories,
    categories,
    trending,
    items: itemIndexFromStories(stories),
    totalStories: Number(raw?.totalStories) || stories.length,
    lastFetchedAt: Number(raw?.lastFetchedAt) || 0,
    updatedAt: Number(raw?.updatedAt) || Date.now(),
  };
  if (raw?.items && typeof raw.items === "object") {
    digest.items = { ...digest.items, ...raw.items };
  }
  return digest;
}

const FETCH_MS = 8000;

function cacheSlot(apiBase) {
  return `${CACHE_KEY}:${normalizeApiBase(apiBase)}`;
}

async function readJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const response = await fetch(url, {
      credentials: "omit",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`http ${response.status}`);
    const type = response.headers.get("content-type") || "";
    if (!type.includes("json")) throw new Error("not json");
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function readCachedDigest(apiBase) {
  try {
    const key = cacheSlot(apiBase);
    const bag = await asChrome().storage.local.get(key);
    const cached = bag?.[key];
    if (cached?.digest) return normalizeDigest(cached.digest);
  } catch {
    // ignore
  }
  return null;
}

export async function writeCachedDigest(digest, apiBase) {
  try {
    const base = normalizeApiBase(apiBase);
    await asChrome().storage.local.set({
      [cacheSlot(base)]: { digest, apiBase: base, savedAt: Date.now() },
    });
  } catch {
    // ignore quota
  }
}

export async function fetchDigest(apiBase) {
  const base = normalizeApiBase(apiBase);
  try {
    const data = await readJson(publicUrl(base));
    let digest = normalizeDigest(data);
    try {
      const feed = await readJson(`${feedUrl(base)}?days=3`);
      digest = enrichDigest(digest, feed);
    } catch {
      // /api/feed has no CORS for web previews; unpacked MV3 host_permissions
      // still succeed. Public digest is enough for AI;DR + stories.
    }
    await writeCachedDigest(digest, base);
    return { digest, source: "public", stale: false };
  } catch {
    try {
      const data = await readJson(feedUrl(base));
      const digest = normalizeDigest(data);
      await writeCachedDigest(digest, base);
      return { digest, source: "feed", stale: false };
    } catch {
      const cached = await readCachedDigest(base);
      if (cached) return { digest: cached, source: "cache", stale: true };
      throw new Error("unavailable");
    }
  }
}
