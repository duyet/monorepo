import { describe, expect, it } from "vitest";
import { rankScore } from "../ranking.js";

const NOW = Date.now();

describe("rankScore", () => {
  it("decays with age", () => {
    const fresh = rankScore({
      importance: 8,
      quality: 8,
      points: 100,
      comments: 20,
      publishedAt: NOW,
      now: NOW,
    });
    const old = rankScore({
      importance: 8,
      quality: 8,
      points: 100,
      comments: 20,
      publishedAt: NOW - 48 * 60 * 60 * 1000,
      now: NOW,
    });
    expect(old).toBeLessThan(fresh);
  });

  it("is monotonic in engagement (points/comments)", () => {
    const base = { importance: 5, quality: 5, publishedAt: NOW, now: NOW };
    const low = rankScore({ ...base, points: 1, comments: 0 });
    const high = rankScore({ ...base, points: 500, comments: 200 });
    expect(high).toBeGreaterThan(low);
  });

  it("is monotonic in quality", () => {
    const base = {
      importance: 5,
      points: 10,
      comments: 5,
      publishedAt: NOW,
      now: NOW,
    };
    const lowQuality = rankScore({ ...base, quality: 1 });
    const highQuality = rankScore({ ...base, quality: 10 });
    expect(highQuality).toBeGreaterThan(lowQuality);
  });

  it("scales with importance", () => {
    const base = {
      quality: 5,
      points: 10,
      comments: 5,
      publishedAt: NOW,
      now: NOW,
    };
    const lowImportance = rankScore({ ...base, importance: 1 });
    const highImportance = rankScore({ ...base, importance: 10 });
    expect(highImportance).toBeGreaterThan(lowImportance);
  });

  it("never returns negative for valid inputs", () => {
    const score = rankScore({
      importance: 0,
      quality: 0,
      points: 0,
      comments: 0,
      publishedAt: NOW,
      now: NOW,
    });
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("TRENDING_MIN_RANK reachability", () => {
  it("can exceed 25 for an exceptional fresh, well-engaged story", () => {
    // importance 10 × quality 1.0 × decay 1.0 × (1+log10(1+200+20))
    const score = rankScore({
      importance: 10,
      quality: 10,
      points: 200,
      comments: 40,
      publishedAt: NOW,
      now: NOW,
    });
    expect(score).toBeGreaterThanOrEqual(25);
  });

  it("stays below 25 for a typical live-max story (~importance 8, modest engagement)", () => {
    const score = rankScore({
      importance: 8,
      quality: 8,
      points: 40,
      comments: 10,
      publishedAt: NOW - 6 * 60 * 60 * 1000,
      now: NOW,
    });
    expect(score).toBeLessThan(25);
  });
});
