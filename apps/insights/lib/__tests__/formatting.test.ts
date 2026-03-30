import { describe, expect, test } from "bun:test";
import { formatCurrency } from "../../app/ai/utils/formatting";

describe("formatCurrency", () => {
  test("should format zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  test("should format very small amounts", () => {
    expect(formatCurrency(0.001)).toBe("<$0.01");
    expect(formatCurrency(0.009)).toBe("<$0.01");
  });

  test("should format amounts less than 1 with two decimals", () => {
    expect(formatCurrency(0.05)).toBe("$0.05");
    expect(formatCurrency(0.99)).toBe("$0.99");
  });

  test("should format amounts from 1 to 9.99 with one decimal", () => {
    expect(formatCurrency(1.6)).toBe("$1.6");
    expect(formatCurrency(5.5)).toBe("$5.5");
    expect(formatCurrency(9.9)).toBe("$9.9");
  });

  test("should format amounts 10 and above as rounded integers", () => {
    expect(formatCurrency(10)).toBe("$10");
    expect(formatCurrency(12.5)).toBe("$13");
    expect(formatCurrency(156)).toBe("$156");
    expect(formatCurrency(156.7)).toBe("$157");
  });

  test("should handle boundary values", () => {
    expect(formatCurrency(0.01)).toBe("$0.01");
    expect(formatCurrency(1)).toBe("$1.0");
    expect(formatCurrency(10)).toBe("$10");
  });
});
