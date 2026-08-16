import { describe, expect, it } from "vitest";
import { sanitizeBulletIds } from "../llm.js";
import { buildTopItemsQuery, shouldPersistTldr } from "../tldr.js";

describe("buildTopItemsQuery", () => {
  it("gates on status='published', ranks by rank_score DESC, caps at 16", () => {
    const { sql } = buildTopItemsQuery(Date.now());
    expect(sql).toContain("status = 'published'");
    expect(sql).toContain("published_at >= ?");
    expect(sql).toMatch(/ORDER BY rank_score DESC/);
    expect(sql).toMatch(/LIMIT 16/);
  });

  it("normalizes `since` to epoch seconds, 24h before now", () => {
    const nowMs = 1786847892625; // a real ms timestamp from the earlier bug
    const { since } = buildTopItemsQuery(nowMs);
    const nowSec = Math.floor(nowMs / 1000);
    expect(since).toBe(nowSec - 24 * 60 * 60);
    // sanity: since is in seconds, not milliseconds
    expect(since).toBeLessThan(1e12);
  });
});

describe("shouldPersistTldr", () => {
  it("returns false for a fully empty result (never write an empty snapshot)", () => {
    expect(shouldPersistTldr({ bullets_en: [], bullets_vi: [] })).toBe(false);
  });

  it("returns true when either language has bullets", () => {
    expect(
      shouldPersistTldr({ bullets_en: [{ text: "a" }], bullets_vi: [] })
    ).toBe(true);
    expect(
      shouldPersistTldr({ bullets_en: [], bullets_vi: [{ text: "a" }] })
    ).toBe(true);
  });
});

describe("sanitizeBulletIds", () => {
  const items = [{ id: "aaaa1111bbbb" }, { id: "aaaa2222cccc" }];

  it("keeps exact-match ids and empty id lists", () => {
    expect(
      sanitizeBulletIds(
        [
          { text: "a", item_ids: ["aaaa1111bbbb"] },
          { text: "b", item_ids: [] },
        ],
        items
      )
    ).toEqual([
      { text: "a", item_ids: ["aaaa1111bbbb"] },
      { text: "b", item_ids: [] },
    ]);
  });

  it("expands a unique prefix to the full id", () => {
    expect(
      sanitizeBulletIds([{ text: "a", item_ids: ["aaaa1111"] }], items)
    ).toEqual([{ text: "a", item_ids: ["aaaa1111bbbb"] }]);
  });

  it("drops hallucinated or ambiguous ids, keeping the rest", () => {
    expect(
      sanitizeBulletIds(
        [
          { text: "a", item_ids: ["deadbeef"] },
          { text: "b", item_ids: ["aaaa", "aaaa2222cccc"] },
        ],
        items
      )
    ).toEqual([
      { text: "a", item_ids: [] },
      { text: "b", item_ids: ["aaaa2222cccc"] },
    ]);
  });

  it("validates every id when a bullet cites multiple stories", () => {
    expect(
      sanitizeBulletIds(
        [{ text: "a", item_ids: ["aaaa1111bbbb", "aaaa2222cccc"] }],
        items
      )
    ).toEqual([{ text: "a", item_ids: ["aaaa1111bbbb", "aaaa2222cccc"] }]);
  });
});
