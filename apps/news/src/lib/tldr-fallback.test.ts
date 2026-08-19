import { describe, expect, it } from "vitest";
import {
  displayTldrBullets,
  isThinDisplayTldr,
  pickLast24hRanked,
  resolveTldrForDisplay,
  shouldRebuildTldrForDisplay,
  synthesizeTldrFromItems,
} from "./tldr-fallback";
import type { FeedItem } from "./types";

function item(
  id: string,
  title: string,
  opts: {
    title_vi?: string | null;
    rank_score?: number;
    published_at?: number;
  } = {}
): FeedItem {
  return {
    id,
    url: `https://example.com/${id}`,
    title,
    title_vi: opts.title_vi ?? null,
    summary: null,
    summary_vi: null,
    category: null,
    published_at: opts.published_at ?? 1_700_000_000,
    points: 0,
    comments: 0,
    rank_score: opts.rank_score ?? 1,
    source_id: "hn",
    tags: [],
    sources: [],
    llm_tokens: 0,
    image_url: null,
  };
}

describe("synthesizeTldrFromItems", () => {
  it("uses title for EN and title_vi || title for VI so counts match", () => {
    const fallback = synthesizeTldrFromItems([
      { id: "a", title: "GPT-6 ships", title_vi: "GPT-6 ra mắt" },
      { id: "b", title: "OpenRouter sold", title_vi: null },
    ]);
    expect(fallback.bullets_en).toEqual([
      { text: "GPT-6 ships", item_ids: ["a"] },
      { text: "OpenRouter sold", item_ids: ["b"] },
    ]);
    expect(fallback.bullets_vi).toEqual([
      { text: "GPT-6 ra mắt", item_ids: ["a"] },
      { text: "OpenRouter sold", item_ids: ["b"] },
    ]);
    expect(fallback.bullets_vi).toHaveLength(fallback.bullets_en.length);
  });
});

describe("pickLast24hRanked", () => {
  it("prefers last-24h items by rank_score and caps at 16", () => {
    const now = 1_800_000_000;
    const items = [
      item("old", "Yesterday+", {
        rank_score: 99,
        published_at: now - 25 * 3600,
      }),
      item("low", "Low rank", { rank_score: 1, published_at: now - 3600 }),
      item("high", "High rank", { rank_score: 10, published_at: now - 7200 }),
    ];
    expect(pickLast24hRanked(items, now).map((i) => i.id)).toEqual([
      "high",
      "low",
    ]);
  });
});

describe("resolveTldrForDisplay", () => {
  const now = 1_800_000_000;
  const items = [
    item("a", "Story A", {
      title_vi: "Tin A",
      rank_score: 8,
      published_at: now - 3600,
    }),
    item("b", "Story B", { rank_score: 5, published_at: now - 7200 }),
    item("c", "Story C", { rank_score: 3, published_at: now - 10_000 }),
  ];

  it("replaces a 1-bullet snapshot with last-24h ranked titles", () => {
    const resolved = resolveTldrForDisplay(
      {
        date: "2026-08-19",
        bullets_en: [{ text: "LLAMA leftover", item_ids: ["z"] }],
        bullets_vi: [{ text: "LLAMA Llama.cpp ra mắt phiên bản v0.1.0" }],
      },
      items,
      now
    );
    expect(resolved?.date).toBe("2026-08-19");
    expect(resolved?.bullets_en.map((b) => b.text)).toEqual([
      "Story A",
      "Story B",
      "Story C",
    ]);
    expect(resolved?.bullets_vi.map((b) => b.text)).toEqual([
      "Tin A",
      "Story B",
      "Story C",
    ]);
  });

  it("keeps a rich snapshot untouched", () => {
    const rich = {
      date: "2026-08-19",
      bullets_en: [{ text: "One" }, { text: "Two" }, { text: "Three" }],
      bullets_vi: [{ text: "Một" }, { text: "Hai" }],
    };
    expect(resolveTldrForDisplay(rich, items, now)).toBe(rich);
  });

  it("does not invent a snapshot when the feed has fewer than 2 stories", () => {
    expect(resolveTldrForDisplay(null, [items[0]], now)).toBeNull();
  });

  it("rebuilds English-only bullets_vi from title_vi and keeps EN", () => {
    const resolved = resolveTldrForDisplay(
      {
        date: "2026-08-19",
        bullets_en: [
          {
            text: "Z AI GLM-5.3 Ties Kimi K3 as Most Intelligent Open Model With 60 Score",
          },
          { text: "Story B" },
          { text: "Story C" },
        ],
        bullets_vi: [
          {
            text: "Z AI GLM-5.3 Ties Kimi K3 as Most Intelligent Open Model With 60 Score",
          },
          { text: "Story B" },
          { text: "Story C" },
        ],
      },
      items,
      now
    );
    expect(resolved?.date).toBe("2026-08-19");
    expect(resolved?.bullets_en[0]?.text).toBe(
      "Z AI GLM-5.3 Ties Kimi K3 as Most Intelligent Open Model With 60 Score"
    );
    expect(resolved?.bullets_vi.map((b) => b.text)).toEqual([
      "Tin A",
      "Story B",
      "Story C",
    ]);
    expect(
      shouldRebuildTldrForDisplay(
        {
          date: "2026-08-19",
          bullets_en: [{ text: "A" }, { text: "B" }],
          bullets_vi: [{ text: "A" }, { text: "B" }],
        },
        items
      )
    ).toBe(true);
  });

  it("does not rebuild English-only VI when no title_vi exists", () => {
    const noVi = [
      item("a", "Story A", { rank_score: 8, published_at: now - 3600 }),
      item("b", "Story B", { rank_score: 5, published_at: now - 7200 }),
    ];
    const frozen = {
      date: "2026-08-19",
      bullets_en: [{ text: "Story A" }, { text: "Story B" }],
      bullets_vi: [{ text: "Story A" }, { text: "Story B" }],
    };
    expect(resolveTldrForDisplay(frozen, noVi, now)).toBe(frozen);
    expect(shouldRebuildTldrForDisplay(frozen, noVi)).toBe(false);
  });
});

describe("isThinDisplayTldr", () => {
  it("treats a 1-bullet leftover as thin", () => {
    expect(
      isThinDisplayTldr({
        bullets_en: [{ text: "only" }],
        bullets_vi: [],
      })
    ).toBe(true);
  });

  it("treats two or more bullets as displayable", () => {
    expect(
      isThinDisplayTldr({
        bullets_en: [{ text: "a" }, { text: "b" }],
        bullets_vi: [],
      })
    ).toBe(false);
  });
});

describe("displayTldrBullets", () => {
  it("hides leftover-thin VI instead of painting EN in VI chrome", () => {
    const tldr = {
      date: "2026-08-19",
      bullets_en: [{ text: "A" }, { text: "B" }, { text: "C" }],
      bullets_vi: [{ text: "LLAMA leftover" }],
    };
    expect(displayTldrBullets(tldr, "vi")).toEqual([]);
    expect(displayTldrBullets(tldr, "en")).toHaveLength(3);
  });

  it("hides English-copied bullets_vi so VI chrome is never raw EN", () => {
    const tldr = {
      date: "2026-08-19",
      bullets_en: [
        {
          text: "Claude Code Teaching macOS to Natively Print to the HP Laser 1008a",
        },
        {
          text: "Z AI GLM-5.3 Ties Kimi K3 as Most Intelligent Open Model With 60 Score",
        },
      ],
      bullets_vi: [
        {
          text: "Claude Code Teaching macOS to Natively Print to the HP Laser 1008a",
        },
        {
          text: "Z AI GLM-5.3 Ties Kimi K3 as Most Intelligent Open Model With 60 Score",
        },
      ],
    };
    expect(displayTldrBullets(tldr, "vi")).toEqual([]);
    expect(displayTldrBullets(tldr, "en")).toHaveLength(2);
  });

  it("shows Vietnamese bullets in VI chrome", () => {
    const tldr = {
      date: "2026-08-19",
      bullets_en: [{ text: "A" }, { text: "B" }],
      bullets_vi: [
        { text: "GLM-5.3 của Z AI đạt điểm thông minh cao nhất" },
        { text: "Claude Code giúp macOS in trực tiếp ra HP Laser 1008a" },
      ],
    };
    expect(displayTldrBullets(tldr, "vi").map((b) => b.text)[0]).toContain(
      "của"
    );
  });
});
