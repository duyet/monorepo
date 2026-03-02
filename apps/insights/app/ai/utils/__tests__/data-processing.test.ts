import { describe, expect, test } from "bun:test";
import { anonymizeProjects, distributePercentages } from "../data-processing";

describe("anonymizeProjects", () => {
  test("returns empty array for empty input", () => {
    expect(anonymizeProjects([])).toEqual([]);
  });

  test("labels projects as Project A, B, C, ...", () => {
    const input = [
      { total_tokens: 100, last_activity: "2024-01-01" },
      { total_tokens: 200, last_activity: "2024-01-02" },
      { total_tokens: 300, last_activity: "2024-01-03" },
    ];
    const result = anonymizeProjects(input);
    expect(result[0].projectName).toBe("Project A");
    expect(result[1].projectName).toBe("Project B");
    expect(result[2].projectName).toBe("Project C");
  });

  test("caps at 15 projects", () => {
    const input = Array.from({ length: 20 }, (_, _i) => ({
      total_tokens: 100,
      last_activity: "2024-01-01",
    }));
    const result = anonymizeProjects(input);
    expect(result.length).toBe(15);
  });

  test("calculates relative usage as percentage of total tokens", () => {
    const input = [
      { total_tokens: 100, last_activity: "2024-01-01" },
      { total_tokens: 300, last_activity: "2024-01-02" },
    ];
    const result = anonymizeProjects(input);
    expect(result[0].relativeUsage).toBe(25);
    expect(result[1].relativeUsage).toBe(75);
  });

  test("sets relativeUsage to 0 when total tokens is 0", () => {
    const input = [
      { total_tokens: 0, last_activity: "2024-01-01" },
      { total_tokens: 0, last_activity: "2024-01-02" },
    ];
    const result = anonymizeProjects(input);
    expect(result[0].relativeUsage).toBe(0);
    expect(result[1].relativeUsage).toBe(0);
  });

  test("preserves token counts and last activity", () => {
    const input = [{ total_tokens: 500, last_activity: "2024-06-15" }];
    const result = anonymizeProjects(input);
    expect(result[0].tokens).toBe(500);
    expect(result[0].lastActivity).toBe("2024-06-15");
  });
});

describe("distributePercentages", () => {
  test("returns empty array for empty input", () => {
    expect(distributePercentages([])).toEqual([]);
  });

  test("returns all zeros when all inputs are zero", () => {
    expect(distributePercentages([0, 0, 0])).toEqual([0, 0, 0]);
  });

  test("output sums to 100 for basic case", () => {
    const input = [33.33, 33.33, 33.34];
    const result = distributePercentages(input);
    const sum = result.reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  test("distributes using largest remainder method", () => {
    const input = [33.333, 33.333, 33.334];
    const result = distributePercentages(input);
    expect(result.reduce((a, b) => a + b, 0)).toBe(100);
    result.forEach((v) => { expect([33, 34]).toContain(v); });
  });

  test("handles single item at 100%", () => {
    const result = distributePercentages([100]);
    expect(result).toEqual([100]);
  });

  test("handles two items at 50/50", () => {
    const result = distributePercentages([50, 50]);
    expect(result.reduce((a, b) => a + b, 0)).toBe(100);
  });
});
