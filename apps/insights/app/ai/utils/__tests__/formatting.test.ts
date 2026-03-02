import { describe, expect, test } from "bun:test";
import { formatCurrency } from "../formatting";

describe("formatCurrency", () => {
  test("returns $0 for zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  test("returns <$0.01 for amounts less than $0.01", () => {
    expect(formatCurrency(0.001)).toBe("<$0.01");
    expect(formatCurrency(0.009)).toBe("<$0.01");
  });

  test("returns two decimal places for sub-dollar amounts", () => {
    expect(formatCurrency(0.05)).toBe("$0.05");
    expect(formatCurrency(0.5)).toBe("$0.50");
    expect(formatCurrency(0.99)).toBe("$0.99");
  });

  test("returns one decimal place for $1-$9 amounts", () => {
    expect(formatCurrency(1.0)).toBe("$1.0");
    expect(formatCurrency(5.6)).toBe("$5.6");
    expect(formatCurrency(9.9)).toBe("$9.9");
  });

  test("returns rounded integer for $10+ amounts", () => {
    expect(formatCurrency(12.5)).toBe("$13");
    expect(formatCurrency(100)).toBe("$100");
    expect(formatCurrency(156)).toBe("$156");
  });
});
