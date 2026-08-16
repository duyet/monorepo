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
