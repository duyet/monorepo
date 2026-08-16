import { describe, expect, it } from "vitest";
import {
  buildItemBindArgs,
  buildItemSourceBindArgs,
  buildTranslationBindArgs,
  MAX_SOURCES_PER_ITEM,
  nn,
} from "../d1-bind.js";
import type { FetchedItemSource } from "../sources/types.js";

describe("nn", () => {
  it("coerces undefined and null to null, passes through other values", () => {
    expect(nn(undefined)).toBeNull();
    expect(nn(null)).toBeNull();
    expect(nn(0)).toBe(0);
    expect(nn("")).toBe("");
    expect(nn("x")).toBe("x");
  });
});

describe("buildItemBindArgs", () => {
  it("never contains undefined for an item missing all optional fields", () => {
    const args = buildItemBindArgs({
      id: "abc123",
      sourceId: "hn",
      item: {
        url: "https://example.com/story",
        title: "A story with no summary or points",
        publishedAt: 1700000000, // already epoch seconds
        // externalId, summary, points, comments all omitted
      },
      // score omitted entirely (e.g. LLM batch failed and was skipped)
      rank: 0,
      status: "published",
      now: 1700000100000, // Date.now()-style, epoch ms
    });

    expect(args).not.toContain(undefined);
    // optional fields fall back to null / 0, never undefined
    expect(args).toEqual([
      "abc123",
      "hn",
      null, // externalId
      "https://example.com/story",
      "A story with no summary or points",
      null, // summary
      1700000000, // published_at, seconds
      1700000100, // fetched_at, normalized from ms `now` to seconds
      0, // points
      0, // comments
      null, // llm_relevance
      null, // llm_importance
      null, // llm_quality
      null, // category
      "[]", // tags
      0, // rank
      "published",
      0, // llm_tokens, defaulted since llmTokens was omitted
    ]);
  });

  it("passes through llm scores when present, including a zero relevance", () => {
    const args = buildItemBindArgs({
      id: "abc123",
      sourceId: "hn",
      item: {
        url: "https://example.com/story",
        title: "Title",
        publishedAt: 1700000000,
      },
      score: {
        relevance: 0,
        importance: 5,
        quality: 7,
        category: "Models",
        tags: ["gpt"],
      },
      rank: 3.2,
      status: "rejected",
      now: 1700000100000,
    });

    expect(args).not.toContain(undefined);
    expect(args[10]).toBe(0); // llm_relevance must stay 0, not become null
    expect(args[13]).toBe("Models");
    expect(args[14]).toBe(JSON.stringify(["gpt"]));
  });

  it("normalizes a millisecond publishedAt (e.g. an unfixed adapter) down to seconds", () => {
    // Regression: HuggingNews originally emitted epoch milliseconds for
    // publishedAt, which stored directly produced nonsense future dates.
    const args = buildItemBindArgs({
      id: "abc123",
      sourceId: "huggingnews",
      item: {
        url: "https://huggingnews.com/ai/some-story",
        title: "Some story",
        publishedAt: 1786847892625, // ms
      },
      rank: 1,
      status: "published",
      now: 1786847892625,
    });

    expect(args[6]).toBe(1786847892); // published_at, coerced to seconds
    expect(args[7]).toBe(1786847892); // fetched_at, coerced to seconds
  });

  it("includes llm_tokens with no undefined when provided", () => {
    const args = buildItemBindArgs({
      id: "abc123",
      sourceId: "hn",
      item: {
        url: "https://example.com/story",
        title: "Title",
        publishedAt: 1700000000,
      },
      rank: 1,
      status: "published",
      now: 1700000100000,
      llmTokens: 342,
    });

    expect(args).not.toContain(undefined);
    expect(args[args.length - 1]).toBe(342);
  });

  it("defaults llm_tokens to 0, never undefined, when omitted", () => {
    const args = buildItemBindArgs({
      id: "abc123",
      sourceId: "hn",
      item: {
        url: "https://example.com/story",
        title: "Title",
        publishedAt: 1700000000,
      },
      rank: 1,
      status: "published",
      now: 1700000100000,
      // llmTokens omitted
    });

    expect(args).not.toContain(undefined);
    expect(args[args.length - 1]).toBe(0);
  });
});

describe("buildItemSourceBindArgs", () => {
  it("never contains undefined for a source missing every optional field", () => {
    const rows = buildItemSourceBindArgs("abc123", [{ kind: "source" }]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).not.toContain(undefined);
    expect(rows[0]).toEqual([
      "abc123",
      0, // position
      "source",
      null, // author
      null, // posted_at
      null, // quote
      null, // url
    ]);
  });

  it("assigns 0-based positions in input order", () => {
    const sources: FetchedItemSource[] = [
      { kind: "discussion", url: "https://a" },
      { kind: "source", url: "https://b" },
      { kind: "support", url: "https://c" },
    ];
    const rows = buildItemSourceBindArgs("abc123", sources);
    expect(rows.map((r) => r[1])).toEqual([0, 1, 2]);
    expect(rows.map((r) => r[2])).toEqual(["discussion", "source", "support"]);
  });

  it("normalizes a millisecond postedAt to seconds", () => {
    const rows = buildItemSourceBindArgs("abc123", [
      { kind: "source", postedAt: 1786720391000 },
    ]);
    expect(rows[0][4]).toBe(1786720391);
  });

  it("caps at MAX_SOURCES_PER_ITEM, dropping the rest", () => {
    const sources: FetchedItemSource[] = Array.from({ length: 12 }, (_, i) => ({
      kind: "support" as const,
      url: `https://example.com/${i}`,
    }));
    const rows = buildItemSourceBindArgs("abc123", sources);
    expect(rows).toHaveLength(MAX_SOURCES_PER_ITEM);
    expect(rows[rows.length - 1][6]).toBe(
      `https://example.com/${MAX_SOURCES_PER_ITEM - 1}`
    );
  });
});

describe("buildTranslationBindArgs", () => {
  it("never contains undefined", () => {
    const args = buildTranslationBindArgs({
      id: "abc123",
      title: "Tiêu đề",
      summary: "Tóm tắt",
    });
    expect(args).not.toContain(undefined);
    expect(args).toEqual(["abc123", "Tiêu đề", "Tóm tắt"]);
  });
});
