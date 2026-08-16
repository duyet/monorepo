import { describe, expect, it } from "vitest";
import { matchFilterTarget, matchStories } from "./search-match";
import type { FeedItem } from "./types";

function item(overrides: Partial<FeedItem>): FeedItem {
  return {
    id: "id",
    url: "https://example.com",
    title: "Anthropic ships Claude 5",
    title_vi: null,
    summary: null,
    summary_vi: null,
    category: "Releases",
    published_at: 1000,
    points: 1,
    comments: 0,
    rank_score: 1,
    source_id: "hn",
    tags: [],
    sources: [],
    llm_tokens: 0,
    image_url: null,
    ...overrides,
  };
}

describe("matchStories", () => {
  it("returns nothing for a query shorter than 2 chars", () => {
    expect(matchStories([item({})], "a", "en")).toEqual([]);
  });

  it("matches case-insensitively against the English title", () => {
    const it1 = item({ id: "1", title: "Anthropic ships Claude 5" });
    const matches = matchStories([it1], "claude", "en");
    expect(matches).toHaveLength(1);
    expect(matches[0].item.id).toBe("1");
    expect(matches[0].title).toBe("Anthropic ships Claude 5");
    expect(matches[0].matchStart).toBe(16);
    expect(matches[0].matchEnd).toBe(22);
  });

  it("prefers the Vietnamese title when lang is vi and it exists", () => {
    const it1 = item({
      id: "1",
      title: "New AI model",
      title_vi: "Mô hình AI mới",
    });
    const matches = matchStories([it1], "mô hình", "vi");
    expect(matches).toHaveLength(1);
    expect(matches[0].title).toBe("Mô hình AI mới");
  });

  it("falls back to the English title in vi mode when no translation exists", () => {
    const it1 = item({ id: "1", title: "New AI model", title_vi: null });
    const matches = matchStories([it1], "model", "vi");
    expect(matches).toHaveLength(1);
    expect(matches[0].title).toBe("New AI model");
  });

  it("skips items that don't match", () => {
    const matches = matchStories(
      [item({ id: "1", title: "OpenAI news" })],
      "anthropic",
      "en"
    );
    expect(matches).toEqual([]);
  });

  it("caps results at the given limit", () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      item({ id: String(i), title: `Claude update ${i}` })
    );
    const matches = matchStories(items, "claude", "en", 7);
    expect(matches).toHaveLength(7);
  });
});

describe("matchFilterTarget", () => {
  const categories = [{ name: "Releases", count: 5 }];
  const trending = [{ tag: "anthropic", count: 3 }];

  it("returns null for a short query", () => {
    expect(matchFilterTarget("a", categories, trending)).toBeNull();
  });

  it("matches a trending tag case-insensitively", () => {
    expect(matchFilterTarget("Anthropic", categories, trending)).toEqual({
      kind: "topic",
      value: "anthropic",
      count: 3,
    });
  });

  it("matches a category name case-insensitively", () => {
    expect(matchFilterTarget("releases", categories, trending)).toEqual({
      kind: "category",
      value: "Releases",
      count: 5,
    });
  });

  it("prefers a tag match over a category match", () => {
    const both = [{ name: "anthropic", count: 2 }];
    expect(matchFilterTarget("anthropic", both, trending)).toEqual({
      kind: "topic",
      value: "anthropic",
      count: 3,
    });
  });

  it("returns null when nothing matches", () => {
    expect(matchFilterTarget("openai", categories, trending)).toBeNull();
  });
});
