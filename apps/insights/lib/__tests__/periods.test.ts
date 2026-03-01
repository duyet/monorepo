import { describe, test, expect } from "bun:test";
import {
  PERIODS,
  getPeriodConfig,
  getPeriodDays,
  isPeriodValue,
  getAllPeriodValues,
  generatePeriodStaticParams,
  DEFAULT_PERIOD,
} from "../periods";

describe("PERIODS constant", () => {
  test("has exactly 4 periods", () => {
    expect(PERIODS.length).toBe(4);
  });

  test("contains 7, 30, 365, and 'all' periods", () => {
    const values = PERIODS.map((p) => p.value);
    expect(values).toContain("7");
    expect(values).toContain("30");
    expect(values).toContain("365");
    expect(values).toContain("all");
  });

  test("each period has value, label, and days", () => {
    for (const period of PERIODS) {
      expect(period.value).toBeDefined();
      expect(period.label).toBeDefined();
      expect(period.days).toBeDefined();
    }
  });

  test("days match period values numerically or 'all'", () => {
    expect(PERIODS.find((p) => p.value === "7")?.days).toBe(7);
    expect(PERIODS.find((p) => p.value === "30")?.days).toBe(30);
    expect(PERIODS.find((p) => p.value === "365")?.days).toBe(365);
    expect(PERIODS.find((p) => p.value === "all")?.days).toBe("all");
  });
});

describe("getPeriodConfig", () => {
  test("returns correct config for '7'", () => {
    const config = getPeriodConfig("7");
    expect(config.value).toBe("7");
    expect(config.days).toBe(7);
  });

  test("returns correct config for '30'", () => {
    const config = getPeriodConfig("30");
    expect(config.value).toBe("30");
    expect(config.days).toBe(30);
  });

  test("returns correct config for 'all'", () => {
    const config = getPeriodConfig("all");
    expect(config.value).toBe("all");
    expect(config.days).toBe("all");
  });

  test("falls back to DEFAULT_PERIOD for unknown value", () => {
    const config = getPeriodConfig("unknown");
    expect(config.value).toBe(DEFAULT_PERIOD);
  });
});

describe("getPeriodDays", () => {
  test("returns correct days for each period value", () => {
    expect(getPeriodDays("7")).toBe(7);
    expect(getPeriodDays("30")).toBe(30);
    expect(getPeriodDays("365")).toBe(365);
    expect(getPeriodDays("all")).toBe("all");
  });

  test("falls back to default period days for unknown value", () => {
    expect(getPeriodDays("unknown")).toBe(getPeriodDays(DEFAULT_PERIOD));
  });
});

describe("isPeriodValue", () => {
  test("returns true for valid period values", () => {
    expect(isPeriodValue("7")).toBe(true);
    expect(isPeriodValue("30")).toBe(true);
    expect(isPeriodValue("365")).toBe(true);
    expect(isPeriodValue("all")).toBe(true);
  });

  test("returns false for invalid values", () => {
    expect(isPeriodValue("14")).toBe(false);
    expect(isPeriodValue("")).toBe(false);
    expect(isPeriodValue("ALL")).toBe(false);
    expect(isPeriodValue("90")).toBe(false);
  });
});

describe("getAllPeriodValues", () => {
  test("returns all four period values", () => {
    expect(getAllPeriodValues()).toEqual(["7", "30", "365", "all"]);
  });
});

describe("generatePeriodStaticParams", () => {
  test("returns array with period property for each period", () => {
    const params = generatePeriodStaticParams();
    expect(params.length).toBe(4);
    expect(params[0]).toHaveProperty("period");
  });

  test("includes all period values as { period: value } objects", () => {
    const params = generatePeriodStaticParams();
    const periodValues = params.map((p) => p.period);
    expect(periodValues).toContain("7");
    expect(periodValues).toContain("30");
    expect(periodValues).toContain("365");
    expect(periodValues).toContain("all");
  });
});
