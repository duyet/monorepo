import { describe, expect, it } from "vitest";
import { sanitizeBulletIds } from "../llm.js";
import {
  buildTopItemsQuery,
  fallbackTldrFromItems,
  isThinTldr,
  shouldPersistTldr,
  shouldRefreshExistingSnapshot,
  TLDR_REFRESH_MS,
  tldrSnapshotDate,
  usefulTldrFloor,
} from "../tldr.js";
import {
  isEnglishOnlyViTldr,
  itemsHaveTitleVi,
  looksVietnamese,
  needsViTitleFallback,
} from "../tldr-lang.js";

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

  it("uses a rolling 24h window, not ICT calendar-day-so-far", () => {
    // 00:30 ICT on 2026-08-19 = 2026-08-18T17:30:00Z
    const afterIctMidnight = Date.UTC(2026, 7, 18, 17, 30, 0);
    const { since } = buildTopItemsQuery(afterIctMidnight);
    const ictMidnightSec = Math.floor(Date.UTC(2026, 7, 18, 17, 0, 0) / 1000);
    expect(since).toBe(Math.floor(afterIctMidnight / 1000) - 24 * 60 * 60);
    // calendar-day-so-far would bind ICT midnight (~30 minutes back)
    expect(since).toBeLessThan(ictMidnightSec);
    expect(tldrSnapshotDate(afterIctMidnight)).toBe("2026-08-19");
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
  it("uses item titles for EN and title_vi || title for VI (counts match)", () => {
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
      bullets_vi: [
        { text: "GPT-6 ra mắt", item_ids: ["a"] },
        { text: "OpenRouter sold", item_ids: ["b"] },
      ],
    });
  });

  it("reuses the English title when no translation exists, never invents prose", () => {
    const { bullets_vi } = fallbackTldrFromItems([
      { id: "a", title: "English only" },
    ]);
    expect(bullets_vi).toEqual([{ text: "English only", item_ids: ["a"] }]);
  });
});

describe("isThinTldr", () => {
  it("uses min(8, itemCount) and at least 2 when there are 2+ stories", () => {
    expect(usefulTldrFloor(0)).toBe(0);
    expect(usefulTldrFloor(1)).toBe(1);
    expect(usefulTldrFloor(2)).toBe(2);
    expect(usefulTldrFloor(5)).toBe(5);
    expect(usefulTldrFloor(16)).toBe(8);
  });

  it("replaces a 1-bullet LLM result with a fallback of all ranked items", () => {
    const items = Array.from({ length: 16 }, (_, i) => ({
      id: `id-${i}`,
      title: `Story ${i}`,
      title_vi: i === 0 ? "Llama.cpp ra mắt phiên bản v0.1.0" : null,
    }));
    const llm = {
      bullets_en: [{ text: "Llama.cpp v0.1.0" }],
      bullets_vi: [{ text: "Llama.cpp ra mắt phiên bản v0.1.0" }],
    };
    expect(isThinTldr(llm, items.length)).toBe(true);
    const fallback = fallbackTldrFromItems(items);
    expect(fallback.bullets_en).toHaveLength(16);
    expect(fallback.bullets_vi).toHaveLength(16);
    expect(fallback.bullets_vi[0]?.text).toBe(
      "Llama.cpp ra mắt phiên bản v0.1.0"
    );
    expect(fallback.bullets_vi[1]?.text).toBe("Story 1");
  });

  it("keeps a full-size LLM digest", () => {
    const bullets = Array.from({ length: 8 }, (_, i) => ({ text: `b${i}` }));
    expect(isThinTldr({ bullets_en: bullets, bullets_vi: bullets }, 16)).toBe(
      false
    );
  });
});

describe("shouldRefreshExistingSnapshot", () => {
  const useful = {
    created_at: 1_000,
    bullets_en: Array.from({ length: 8 }, (_, i) => ({ text: `b${i}` })),
    bullets_vi: Array.from({ length: 8 }, (_, i) => ({ text: `v${i}` })),
  };

  it("refreshes a 1-item leftover even when it is only minutes old", () => {
    expect(
      shouldRefreshExistingSnapshot({
        existing: {
          created_at: 1_000,
          bullets_en: [{ text: "LLAMA leftover" }],
          bullets_vi: [{ text: "Llama.cpp ra mắt phiên bản v0.1.0" }],
        },
        itemCount: 16,
        nowMs: 1_000 + 2 * 60 * 1000,
      })
    ).toBe(true);
  });

  it("keeps a useful snapshot inside the 3h window", () => {
    expect(
      shouldRefreshExistingSnapshot({
        existing: useful,
        itemCount: 16,
        nowMs: useful.created_at + 30 * 60 * 1000,
      })
    ).toBe(false);
  });

  it("refreshes a useful snapshot after 3h", () => {
    expect(
      shouldRefreshExistingSnapshot({
        existing: useful,
        itemCount: 16,
        nowMs: useful.created_at + TLDR_REFRESH_MS,
      })
    ).toBe(true);
  });

  it("refreshes an EN-only snapshot so the next run can fill bullets_vi", () => {
    expect(
      shouldRefreshExistingSnapshot({
        existing: {
          created_at: 1_000,
          bullets_en: Array.from({ length: 8 }, (_, i) => ({ text: `b${i}` })),
          bullets_vi: [],
        },
        itemCount: 16,
        nowMs: 1_000 + 2 * 60 * 1000,
      })
    ).toBe(true);
  });

  it("refreshes English-copied bullets_vi once title_vi exists, even minutes old", () => {
    const en = [
      "Claude Code Teaching macOS to Natively Print to the HP Laser 1008a",
      "Z AI GLM-5.3 Ties Kimi K3 as Most Intelligent Open Model With 60 Score",
      ...Array.from({ length: 6 }, (_, i) => `English leftover ${i}`),
    ];
    expect(
      shouldRefreshExistingSnapshot({
        existing: {
          created_at: 1_000,
          bullets_en: en.map((text) => ({ text })),
          bullets_vi: en.map((text) => ({ text })),
        },
        itemCount: 16,
        nowMs: 1_000 + 2 * 60 * 1000,
        hasTitleVi: true,
      })
    ).toBe(true);
  });

  it("keeps English-copied bullets_vi inside 3h when no title_vi exists", () => {
    const en = Array.from({ length: 8 }, (_, i) => `English leftover ${i}`);
    expect(
      shouldRefreshExistingSnapshot({
        existing: {
          created_at: 1_000,
          bullets_en: en.map((text) => ({ text })),
          bullets_vi: en.map((text) => ({ text })),
        },
        itemCount: 16,
        nowMs: 1_000 + 2 * 60 * 1000,
        hasTitleVi: false,
      })
    ).toBe(false);
  });
});

describe("looksVietnamese / isEnglishOnlyViTldr", () => {
  it("detects Vietnamese diacritics and rejects the live EN leftover lines", () => {
    expect(
      looksVietnamese(
        "GLM-5.3 của Z AI đạt điểm thông minh cao nhất nhóm mã nguồn mở"
      )
    ).toBe(true);
    expect(
      looksVietnamese(
        "Z AI GLM-5.3 Ties Kimi K3 as Most Intelligent Open Model With 60 Score"
      )
    ).toBe(false);
    expect(
      isEnglishOnlyViTldr([
        {
          text: "Claude Code Teaching macOS to Natively Print to the HP Laser 1008a",
        },
        {
          text: "Z AI GLM-5.3 Ties Kimi K3 as Most Intelligent Open Model With 60 Score",
        },
      ])
    ).toBe(true);
    expect(
      isEnglishOnlyViTldr([
        {
          text: "GLM-5.3 của Z AI đạt điểm thông minh cao nhất nhóm mã nguồn mở",
        },
        { text: "Norway Should Buy OpenAI" },
      ])
    ).toBe(false);
  });

  it("needs a title_vi fallback only when VI is English-only and translations exist", () => {
    const items = [
      {
        title_vi:
          "GLM-5.3 của Z AI đạt điểm thông minh cao nhất nhóm mã nguồn mở",
      },
      { title_vi: null },
    ];
    expect(itemsHaveTitleVi(items)).toBe(true);
    expect(
      needsViTitleFallback(
        [
          {
            text: "Z AI GLM-5.3 Ties Kimi K3 as Most Intelligent Open Model With 60 Score",
          },
        ],
        items
      )
    ).toBe(true);
    expect(
      needsViTitleFallback(
        [
          {
            text: "Z AI GLM-5.3 Ties Kimi K3 as Most Intelligent Open Model With 60 Score",
          },
        ],
        [{ title_vi: null }]
      )
    ).toBe(false);
  });
});
