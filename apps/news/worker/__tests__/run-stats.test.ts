import { describe, expect, it } from "vitest";
import { buildRunStats, serializeRunStats } from "../run-stats.js";

describe("buildRunStats", () => {
  it("defaults every field to zero/false/empty when given nothing", () => {
    expect(buildRunStats()).toEqual({
      bySource: {},
      new: 0,
      merged: 0,
      rejected: 0,
      published: 0,
      tokens: 0,
      backfilledSummaries: 0,
      backfilledTranslations: 0,
      qaRated: 0,
      qaAdjusted: 0,
      suggestionsReviewed: 0,
      submissionsReviewed: 0,
      tldrGenerated: false,
      emailsSent: 0,
    });
  });

  it("fills in only the provided fields, defaulting the rest", () => {
    const stats = buildRunStats({
      bySource: { hn: 5, huggingnews: 3 },
      new: 8,
      published: 6,
      tokens: 1200,
      tldrGenerated: true,
    });
    expect(stats).toEqual({
      bySource: { hn: 5, huggingnews: 3 },
      new: 8,
      merged: 0,
      rejected: 0,
      published: 6,
      tokens: 1200,
      backfilledSummaries: 0,
      backfilledTranslations: 0,
      qaRated: 0,
      qaAdjusted: 0,
      suggestionsReviewed: 0,
      submissionsReviewed: 0,
      tldrGenerated: true,
      emailsSent: 0,
    });
  });

  it("never leaves undefined in the built object, even for a partially-failed run", () => {
    const stats = buildRunStats({ bySource: { hn: 2 }, new: 2 });
    for (const value of Object.values(stats)) {
      expect(value).not.toBeUndefined();
    }
  });
});

describe("serializeRunStats", () => {
  it("round-trips through JSON with no undefined values", () => {
    const stats = buildRunStats({ new: 3, tokens: 500, tldrGenerated: true });
    const parsed = JSON.parse(serializeRunStats(stats));
    expect(parsed).toEqual(stats);
    expect(JSON.stringify(stats)).not.toContain("undefined");
  });
});
