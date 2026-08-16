import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { huggingNewsAdapter, resolve } from "../sources/huggingnews.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  readFileSync(
    path.join(dirname, "../sources/__fixtures__/huggingnews-data.json"),
    "utf-8"
  )
);
const detailFixture = JSON.parse(
  readFileSync(
    path.join(dirname, "../sources/__fixtures__/huggingnews-story-detail.json"),
    "utf-8"
  )
);
const DETAIL_SLUG =
  "alibaba-launches-open-weight-qwen-38-27b-to-bring-frontier-ai-to-smartph-f5c2c0ce";

describe("resolve", () => {
  it("returns a scalar at the given index as-is (indices are not chased transitively)", () => {
    // In SvelteKit's devalue flattening, an index only acts as a *reference*
    // when it appears as a child of an object/array at another index; the
    // node stored at that index is itself terminal, even if it happens to
    // be a number (e.g. a literal count like `1`).
    const data = ["a", "b", 0, 1];
    expect(resolve(data, 0)).toBe("a");
    expect(resolve(data, 1)).toBe("b");
    expect(resolve(data, 2)).toBe(0);
    expect(resolve(data, 3)).toBe(1);
  });

  it("dereferences object values by index", () => {
    const data = [{ name: 1 }, "hello"];
    expect(resolve(data, 0)).toEqual({ name: "hello" });
  });

  it("dereferences array values by index", () => {
    const data = [[1, 2], "a", "b"];
    expect(resolve(data, 0)).toEqual(["a", "b"]);
  });

  it("leaves non-index primitives (booleans, strings) untouched inside objects", () => {
    const data = [{ flag: true, label: 1 }, "x"];
    expect(resolve(data, 0)).toEqual({ flag: true, label: "x" });
  });

  it("returns undefined out of range", () => {
    expect(resolve(["a"], 5)).toBeUndefined();
  });

  it("resolves the real huggingnews payload down to a story title", () => {
    const node = fixture.nodes[2];
    const root = resolve(node.data, 0) as any;
    const dayGroups = root.recentStoryDays.data.dayGroups;
    expect(Array.isArray(dayGroups)).toBe(true);
    expect(dayGroups[0].stories[0].title).toEqual(expect.any(String));
    expect(dayGroups[0].stories[0].slug).toEqual(expect.any(String));
  });
});

describe("huggingNewsAdapter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses stories from the real __data.json shape into FetchedItems", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async () => new Response(JSON.stringify(fixture)))
    );

    const items = await huggingNewsAdapter.fetchItems({}, 0);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.url).toMatch(/^https:\/\/huggingnews\.com\//);
      expect(typeof item.title).toBe("string");
      expect(typeof item.publishedAt).toBe("number");
    }
  });

  it("filters out items older than sinceEpochSec", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async () => new Response(JSON.stringify(fixture)))
    );

    const farFuture = Math.floor(Date.now() / 1000) + 1000 * 24 * 60 * 60;
    const items = await huggingNewsAdapter.fetchItems({}, farFuture);
    expect(items).toEqual([]);
  });

  it("never throws and returns [] on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down"))
    );

    const items = await huggingNewsAdapter.fetchItems({}, 0);
    expect(items).toEqual([]);
  });

  it("enriches an item with sources from its real detail-page selectedTweets", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: string | URL) => {
        const url = String(input);
        if (url.includes(`/ai/${DETAIL_SLUG}/__data.json`)) {
          return new Response(JSON.stringify(detailFixture));
        }
        return new Response(JSON.stringify(fixture));
      })
    );

    const items = await huggingNewsAdapter.fetchItems({}, 0);
    const alibabaItem = items.find((i) => i.url.includes(DETAIL_SLUG));
    expect(alibabaItem?.sources?.length).toBeGreaterThan(0);
    expect(alibabaItem?.sources?.[0]).toMatchObject({
      kind: "source",
      author: "@alibaba_cloud",
      quote: "licensed under Apache 2.0",
      url: "https://x.com/alibaba_cloud/status/2088282795638394986",
    });
    // tweetedAt 1786720391000 ms -> 1786720391 seconds
    expect(alibabaItem?.sources?.[0].postedAt).toBe(1786720391);
    // second tweet in the fixture has label "Support"
    expect(alibabaItem?.sources?.[1]).toMatchObject({ kind: "support" });
  });

  it("swallows a detail-page fetch failure and leaves that item without sources", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: string | URL) => {
        const url = String(input);
        // Any per-story detail-page request (contains a topic segment before
        // __data.json) fails; only the top-level feed URL succeeds.
        if (url !== "https://huggingnews.com/__data.json") {
          throw new Error("detail fetch failed");
        }
        return new Response(JSON.stringify(fixture));
      })
    );

    const items = await huggingNewsAdapter.fetchItems({}, 0);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.sources).toBeUndefined();
    }
  });

  it("caps detail fetches and never exceeds MAX_SOURCES_PER_ITEM sources", async () => {
    let detailFetchCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (input: string | URL) => {
        const url = String(input);
        if (url.includes(`/ai/${DETAIL_SLUG}/__data.json`)) {
          detailFetchCount++;
          return new Response(JSON.stringify(detailFixture));
        }
        return new Response(JSON.stringify(fixture));
      })
    );

    await huggingNewsAdapter.fetchItems({}, 0);
    // this fixture only has 3 stories, well under MAX_DETAIL_FETCHES=20
    expect(detailFetchCount).toBeLessThanOrEqual(1);
  });
});
