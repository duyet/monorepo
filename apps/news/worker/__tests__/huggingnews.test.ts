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
});
