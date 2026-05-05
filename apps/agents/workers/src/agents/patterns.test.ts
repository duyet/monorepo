import { describe, expect, test } from "bun:test";
import { buildPatternHint, detectPattern } from "./patterns";

describe("workers patterns", () => {
  test("detectPattern maps evaluator keywords", () => {
    expect(detectPattern("please evaluate this result")).toBe("evaluator");
  });

  test("detectPattern maps parallel keywords", () => {
    expect(detectPattern("do this and that in parallel")).toBe("parallel");
  });

  test("detectPattern maps orchestrator keywords", () => {
    expect(detectPattern("break down into steps")).toBe("orchestrator");
  });

  test("detectPattern falls back to sequential", () => {
    expect(detectPattern("hello there")).toBe("sequential");
  });

  test("buildPatternHint returns stable text for each pattern", () => {
    expect(buildPatternHint("routing")).toContain("Route");
    expect(buildPatternHint("parallel")).toContain("multiple");
    expect(buildPatternHint("orchestrator")).toContain("subtasks");
    expect(buildPatternHint("evaluator")).toContain("self-check");
    expect(buildPatternHint("sequential")).toContain("sequential");
  });
});
