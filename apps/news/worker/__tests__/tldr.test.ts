import { describe, expect, it } from "vitest";
import { sanitizeBulletIds } from "../llm.js";
import {
  buildTopItemsQuery,
  fallbackTldrFromItems,
  shouldPersistTldr,
  TLDR_REFRESH_MS,
  tldrSnapshotDate,
} from "../tldr.js";

describe("buildTopItemsQuery", () => {
  it("gates on status='published', ranks by rank_score DESC, caps at 16", () => {
    const { sql } = buildTopItemsQuery(Date.now());
    expect(sql).toContain("status = 'published'");
    expect(sql).toContain("published_at >= ?");
    expect(sql).toContain("translations");
    expect(sql).toContain("title_vi");
    expect(sql).toMatch(/ORDER BY i.rank_score DESC/);
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

describe("TLDR_REFRESH_MS", () => {
  it("refreshes the daily snapshot every few hours, not once-and-done", () => {
    expect(TLDR_REFRESH_MS).toBe(3 * 60 * 60 * 1000);
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

describe("tldrSnapshotDate", () => {
  it("keys the snapshot by Asia/Ho_Chi_Minh date, not UTC", () => {
    // 2026-08-17T17:30:00Z = 00:30 ICT on 2026-08-18
    const afterIctMidnight = Date.UTC(2026, 7, 17, 17, 30, 0);
    expect(tldrSnapshotDate(afterIctMidnight)).toBe("2026-08-18");
    // 2026-08-17T16:30:00Z = 23:30 ICT on 2026-08-17
    const beforeIctMidnight = Date.UTC(2026, 7, 17, 16, 30, 0);
    expect(tldrSnapshotDate(beforeIctMidnight)).toBe("2026-08-17");
  });
});

describe("fallbackTldrFromItems", () => {
  it("uses item titles for EN and existing translations only for VI", () => {
    expect(
      fallbackTldrFromItems([
        { id: "a", title: "GPT-6 ships", title_vi: "GPT-6 ra mắt" },
        { id: "b", title: "OpenRouter sold", title_vi: null },
      ])
    ).toEqual({
      bullets_en: [
        { text: "GPT-6 ships", item_ids: ["a"] },
        { text: "OpenRouter sold", item_ids: ["b"] },
      ],
      bullets_vi: [{ text: "GPT-6 ra mắt", item_ids: ["a"] }],
    });
  });

  it("does not invent Vietnamese when no translation exists", () => {
    const { bullets_vi } = fallbackTldrFromItems([
      { id: "a", title: "English only" },
    ]);
    expect(bullets_vi).toEqual([]);
  });
});
