import { describe, expect, it } from "vitest";
import type { Model } from "./data";
import { getRelatedModels } from "./utils";

const model = (
  over: Partial<Model> & { name: string; date: string }
): Model => ({
  org: "Other",
  params: null,
  type: "model",
  license: "closed",
  desc: "",
  ...over,
});

describe("getRelatedModels", () => {
  // Scoring in lib/utils.ts: same org +30, same license +20, same type +10,
  // param proximity up to +40 (ratio >= 0.5), recency bonus up to +10.
  const current = model({
    name: "Current",
    date: "2024-06-01",
    org: "OpenAI",
    params: "70B",
    license: "open",
  });

  // 30 + 20 + 10 + round(40 * 70/70) = 100
  const a = model({
    name: "A",
    date: "2024-01-15",
    org: "OpenAI",
    params: "70B",
    license: "open",
  });
  // 30 + 20 + 10 = 60 (no params to compare)
  const b = model({
    name: "B",
    date: "2024-02-01",
    org: "OpenAI",
    license: "open",
  });
  // 20 + 10 + recency floor(60)/30 = 32
  const r = model({ name: "R", date: "2024-07-31", license: "open" });
  // 20 + 10 = 30
  const c = model({ name: "C", date: "2024-03-01", license: "open" });
  // Same name as current — always excluded
  const dup = model({
    name: "Current",
    date: "2024-05-01",
    org: "OpenAI",
    license: "open",
  });
  // Different org, license, and type — scores 0, filtered out
  const z = model({ name: "Z", date: "2024-01-01", type: "milestone" });

  const all = [current, z, c, a, dup, r, b];

  it("returns related models sorted by score descending", () => {
    expect(getRelatedModels(current, all)).toEqual([a, b, r, c]);
  });

  it("excludes the current model and unrelated models", () => {
    const names = getRelatedModels(current, all).map((m) => m.name);
    expect(names).not.toContain("Current");
    expect(names).not.toContain("Z");
  });

  it("respects the limit argument", () => {
    expect(getRelatedModels(current, all, 2)).toEqual([a, b]);
  });

  it("returns an empty array when nothing is related", () => {
    expect(getRelatedModels(current, [z])).toEqual([]);
  });
});
