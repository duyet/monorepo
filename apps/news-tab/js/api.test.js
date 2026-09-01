import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  enrichDigest,
  feedUrl,
  fetchDigest,
  normalizeDigest,
  publicUrl,
  writeCachedDigest,
} from "./api.js";
import { resetPreviewStores } from "./preview-shim.js";

afterEach(() => {
  globalThis.fetch = originalFetch;
  resetPreviewStores();
});

const originalFetch = globalThis.fetch;

test("publicUrl and feedUrl use the normalized API base", () => {
  assert.equal(
    publicUrl("https://news.duyet.net/"),
    "https://news.duyet.net/api/public"
  );
  assert.equal(
    feedUrl("https://news.duyet.net"),
    "https://news.duyet.net/api/feed"
  );
});

test("normalizeDigest maps public payload and image aliases", () => {
  const digest = normalizeDigest({
    tldr: {
      date: "2026-08-28",
      bullets_en: [
        { text: "Hello", item_ids: ["a"], imageUrl: "https://img/a" },
      ],
      bullets_vi: [{ text: "Xin chào", item_id: "b" }],
    },
    stories: [
      {
        id: "1",
        url: "https://example.com",
        title: "Title",
        title_vi: "Tiêu đề",
        category: "Chips",
        imageUrl: "https://img/s",
        published_at: 100,
      },
    ],
    updatedAt: 50,
  });

  assert.equal(digest.tldr.date, "2026-08-28");
  assert.equal(digest.tldr.bullets_en[0].image_url, "https://img/a");
  assert.deepEqual(digest.tldr.bullets_vi[0].item_ids, ["b"]);
  assert.equal(digest.stories[0].image_url, "https://img/s");
  assert.deepEqual(digest.categories, [{ name: "Chips", count: 1 }]);
  assert.equal(digest.updatedAt, 50);
});

test("normalizeDigest flattens /api/feed days", () => {
  const digest = normalizeDigest({
    tldr: null,
    days: [{ items: [{ id: "x", url: "https://x", title: "X" }] }],
    categories: [{ name: "Infra", count: 2 }],
    trending: [{ tag: "gpu", count: 3 }],
  });
  assert.equal(digest.stories[0].id, "x");
  assert.equal(digest.categories[0].name, "Infra");
  assert.equal(digest.trending[0].tag, "gpu");
});

test("fetchDigest prefers /api/public then caches", async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return {
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        tldr: { date: "d", bullets_en: [], bullets_vi: [] },
        stories: [{ id: "1", url: "https://x", title: "T" }],
        updatedAt: 1,
      }),
    };
  };

  const first = await fetchDigest("https://news.duyet.net");
  assert.equal(first.source, "public");
  assert.equal(first.stale, false);
  assert.equal(first.digest.stories[0].title, "T");
  assert.deepEqual(calls, [
    "https://news.duyet.net/api/public",
    "https://news.duyet.net/api/feed?days=3",
  ]);
});

test("fetchDigest falls back to /api/feed", async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    if (String(url).endsWith("/api/public")) {
      throw new Error("public down");
    }
    return {
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({
        tldr: null,
        days: [{ items: [{ id: "f", url: "https://f", title: "Feed" }] }],
      }),
    };
  };

  const result = await fetchDigest("https://news.duyet.net");
  assert.equal(result.source, "feed");
  assert.equal(result.digest.stories[0].id, "f");
  assert.deepEqual(calls, [
    "https://news.duyet.net/api/public",
    "https://news.duyet.net/api/feed",
  ]);
});

test("fetchDigest falls back to last-good cache", async () => {
  await writeCachedDigest(
    {
      tldr: null,
      stories: [{ id: "cached", url: "https://c", title: "Cached" }],
      categories: [],
      trending: [],
      updatedAt: 9,
    },
    "https://news.duyet.net"
  );

  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  const result = await fetchDigest("https://news.duyet.net");
  assert.equal(result.source, "cache");
  assert.equal(result.stale, true);
  assert.equal(result.digest.stories[0].id, "cached");
});

test("fetchDigest does not reuse another API base cache", async () => {
  await writeCachedDigest(
    {
      tldr: null,
      stories: [{ id: "other", url: "https://o", title: "Other" }],
      categories: [],
      trending: [],
      updatedAt: 1,
    },
    "https://other.example"
  );
  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  await assert.rejects(
    () => fetchDigest("https://news.duyet.net"),
    /unavailable/
  );
});

test("enrichDigest copies categories, trending, and item tags from feed", () => {
  const digest = normalizeDigest({
    tldr: { date: "d", bullets_en: [], bullets_vi: [] },
    stories: [{ id: "1", url: "https://x", title: "T" }],
  });
  const next = enrichDigest(digest, {
    categories: [{ name: "Industry", count: 37 }],
    trending: [{ tag: "agent", count: 15 }],
    totalStories: 163,
    lastFetchedAt: 99,
    days: [
      {
        items: [
          {
            id: "abc",
            url: "https://x",
            title: "OpenAI news",
            tags: ["openai", "agent"],
            category: "Industry",
          },
        ],
      },
    ],
  });
  assert.deepEqual(next.categories, [{ name: "Industry", count: 37 }]);
  assert.deepEqual(next.trending, [{ tag: "agent", count: 15 }]);
  assert.equal(next.totalStories, 163);
  assert.deepEqual(next.items.abc.tags, ["openai", "agent"]);
});
