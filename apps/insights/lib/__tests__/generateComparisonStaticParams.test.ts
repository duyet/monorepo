import { describe, expect, test } from "vitest";
import { generateComparisonStaticParams } from "../comparison";

describe("generateComparisonStaticParams", () => {
  test("returns every period pair except a period compared with itself", () => {
    expect(generateComparisonStaticParams()).toEqual([
      { period1: "7", period2: "30" },
      { period1: "7", period2: "365" },
      { period1: "7", period2: "all" },
      { period1: "30", period2: "7" },
      { period1: "30", period2: "365" },
      { period1: "30", period2: "all" },
      { period1: "365", period2: "7" },
      { period1: "365", period2: "30" },
      { period1: "365", period2: "all" },
      { period1: "all", period2: "7" },
      { period1: "all", period2: "30" },
      { period1: "all", period2: "365" },
    ]);
  });
});
