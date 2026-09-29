import { describe, expect, test } from "vitest";
import { formatNumber } from "../formatNumber";

describe("formatNumber", () => {
  test("formats numbers with K suffix", () => {
    expect(formatNumber(500)).toBe("500");
    expect(formatNumber(1500)).toBe("1.5k");
    expect(formatNumber(999)).toBe("999");
  });

  test("formats numbers with M suffix", () => {
    expect(formatNumber(1500000)).toBe("1.5m");
    expect(formatNumber(1000000)).toBe("1.0m");
  });

  test("formats numbers with B suffix", () => {
    expect(formatNumber(1500000000)).toBe("1.5b");
    expect(formatNumber(1000000000)).toBe("1.0b");
  });

  test("handles edge cases", () => {
    expect(formatNumber(0)).toBe("0");
    // Note: formatNumber is designed for positive values (token counts, metrics)
    // Negative values are returned as-is since they don't make sense for the use case
  });

  // --- added by the K/M/B consolidation -------------------------------
  // Suffixes are lowercase everywhere; see the module docblock for the
  // evidence. These assert the exact tier boundaries so a threshold change
  // has to be deliberate.

  test("lowercase suffixes, one decision for every surface", () => {
    expect(formatNumber(1500)).toBe("1.5k");
    expect(formatNumber(2_300_000)).toBe("2.3m");
    expect(formatNumber(4_000_000_000)).toBe("4.0b");
  });

  test("sub-1000 values pass through unformatted", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(1)).toBe("1");
    expect(formatNumber(1.5)).toBe("1.5");
    expect(formatNumber(999)).toBe("999");
  });

  test("k/m tier boundary sits at 1000 and 1_000_000", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1000)).toBe("1.0k");
    expect(formatNumber(1_000_000)).toBe("1.0m");
  });

  test("b tier boundary sits at 1_000_000_000", () => {
    expect(formatNumber(999_999_999)).toBe("1000.0m");
    expect(formatNumber(1_000_000_000)).toBe("1.0b");
  });

  test("zero renders bare, so a chart axis origin needs no special case", () => {
    // The deleted `value === 0` guards in the insights chart copies were
    // no-ops: the fallthrough already returned "0". Pinned here so the axis
    // can pass this function straight to `tickFormatter`.
    expect(formatNumber(0)).toBe("0");
  });

  test("negatives never match a tier and pass through", () => {
    expect(formatNumber(-1)).toBe("-1");
    expect(formatNumber(-1500)).toBe("-1500");
    expect(formatNumber(-2_500_000)).toBe("-2500000");
  });

  test("the top tier is b; there is no t tier here", () => {
    // A T tier exists only in apps/burns, which also handles sign. Keep this
    // one honest rather than silently growing.
    expect(formatNumber(2_000_000_000_000)).toBe("2000.0b");
  });

  test("known wart: 999_999 rounds up inside the k tier", () => {
    // Tier is picked before the division is rounded. Pinned so a future fix
    // to 999_950+ -> "1.0m" is a conscious change to every surface.
    expect(formatNumber(999_999)).toBe("1000.0k");
  });
});
