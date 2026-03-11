import { describe, expect, test } from "bun:test";
import { formatNumber } from "../formatNumber";

describe("formatNumber", () => {
  test("formats numbers with K suffix", () => {
    expect(formatNumber(500)).toBe("500");
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(999)).toBe("999");
  });

  test("formats numbers with M suffix", () => {
    expect(formatNumber(1500000)).toBe("1.5M");
    expect(formatNumber(1000000)).toBe("1.0M");
  });

  test("formats numbers with B suffix", () => {
    expect(formatNumber(1500000000)).toBe("1.5B");
    expect(formatNumber(1000000000)).toBe("1.0B");
  });

  test("handles edge cases", () => {
    expect(formatNumber(0)).toBe("0");
    // Note: formatNumber is designed for positive values (token counts, metrics)
    // Negative values are returned as-is since they don't make sense for the use case
  });
});
