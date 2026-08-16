import { describe, expect, it } from "vitest";
import {
  buildMissingSummaryQuery,
  buildMissingTranslationQuery,
  huggingNewsDetailUrl,
  planBackfillUpdate,
} from "../backfill.js";

describe("buildMissingSummaryQuery", () => {
  it("gates on status='published' and empty/null summary", () => {
    const sql = buildMissingSummaryQuery(15);
    expect(sql).toContain("status = 'published'");
    expect(sql).toMatch(/summary IS NULL OR summary = ''/);
  });

  it("orders most-recent-first and respects the given limit", () => {
    const sql = buildMissingSummaryQuery(7);
    expect(sql).toMatch(/ORDER BY published_at DESC/);
    expect(sql).toContain("LIMIT 7");
  });

  it("defaults to the standard cap when no limit is given", () => {
    expect(buildMissingSummaryQuery()).toContain("LIMIT 15");
  });
});

describe("buildMissingTranslationQuery", () => {
  it("gates on a non-empty summary and no existing vi translation with a summary", () => {
    const sql = buildMissingTranslationQuery(15);
    expect(sql).toContain("status = 'published'");
    expect(sql).toMatch(/i\.summary IS NOT NULL AND i\.summary != ''/);
    expect(sql).toContain("NOT EXISTS");
    expect(sql).toContain("lang = 'vi'");
  });

  it("respects the given limit", () => {
    expect(buildMissingTranslationQuery(3)).toContain("LIMIT 3");
  });
});

describe("huggingNewsDetailUrl", () => {
  it("appends /__data.json to the item's own canonical url", () => {
    expect(
      huggingNewsDetailUrl("https://huggingnews.com/ai/some-story-abc123")
    ).toBe("https://huggingnews.com/ai/some-story-abc123/__data.json");
  });
});

describe("planBackfillUpdate", () => {
  it("returns null when nothing usable was fetched (leaves item for next run)", () => {
    expect(planBackfillUpdate({ imageUrl: null }, {})).toBeNull();
    expect(
      planBackfillUpdate(
        { imageUrl: null },
        { imageUrl: "https://x.com/i.png" }
      )
    ).toBeNull(); // an image alone, with no summary, isn't enough to write
  });

  it("writes the fetched summary when there's no existing image", () => {
    const plan = planBackfillUpdate(
      { imageUrl: null },
      { summary: "A fetched summary", imageUrl: "https://x.com/i.png" }
    );
    expect(plan).toEqual({
      summary: "A fetched summary",
      imageUrl: "https://x.com/i.png",
    });
  });

  it("never overwrites a non-empty existing image_url with a freshly-fetched one", () => {
    const plan = planBackfillUpdate(
      { imageUrl: "https://existing.com/original.png" },
      { summary: "A fetched summary", imageUrl: "https://x.com/new.png" }
    );
    expect(plan?.imageUrl).toBe("https://existing.com/original.png");
  });

  it("falls back to null imageUrl when neither existing nor fetched has one", () => {
    const plan = planBackfillUpdate(
      { imageUrl: null },
      { summary: "A fetched summary" }
    );
    expect(plan?.imageUrl).toBeNull();
  });
});
