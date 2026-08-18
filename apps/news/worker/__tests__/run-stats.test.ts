import { describe, expect, it } from "vitest";
import { buildRunStats, recordStep, serializeRunStats } from "../run-stats.js";

describe("buildRunStats", () => {
  it("defaults every field to zero/false/empty when given nothing", () => {
    expect(buildRunStats()).toEqual({
      bySource: {},
      steps: [],
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
      notified: {},
      notifyReason: {},
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
      steps: [],
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
      notified: {},
      notifyReason: {},
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

describe("recordStep", () => {
  it("appends a step with name/action/reason", () => {
    const steps: { name: string; action: string; reason?: string }[] = [];
    recordStep(steps, "dedupe", "0 new", "27 already in db");
    expect(steps).toEqual([
      { name: "dedupe", action: "0 new", reason: "27 already in db" },
    ]);
  });

  it("omits reason when not given", () => {
    const steps: { name: string; action: string; reason?: string }[] = [];
    recordStep(steps, "fetch", "27 items from 2 sources");
    expect(steps).toEqual([{ name: "fetch", action: "27 items from 2 sources" }]);
  });

  it("never throws, even if pushing fails", () => {
    const frozen = Object.freeze([]) as unknown as {
      name: string;
      action: string;
      reason?: string;
    }[];
    expect(() => recordStep(frozen, "x", "y")).not.toThrow();
  });
});
