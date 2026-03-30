import { describe, expect, test } from "bun:test";
import {
  DEFAULT_PERIOD,
  generatePeriodStaticParams,
  getAllPeriodValues,
  getPeriodConfig,
  getPeriodDays,
  isPeriodValue,
  PERIODS,
} from "../periods";

describe("PERIODS constant", () => {
  test("should have 4 period options", () => {
    expect(PERIODS).toHaveLength(4);
  });

  test("should have correct period values", () => {
    const values = PERIODS.map((p) => p.value);
    expect(values).toEqual(["7", "30", "365", "all"]);
  });

  test("each period should have value, label, and days", () => {
    for (const period of PERIODS) {
      expect(period.value).toBeDefined();
      expect(period.label).toBeDefined();
      expect(period.days).toBeDefined();
      expect(typeof period.value).toBe("string");
      expect(typeof period.label).toBe("string");
    }
  });

  test("each period should have a description", () => {
    for (const period of PERIODS) {
      expect(period.description).toBeDefined();
    }
  });
});

describe("DEFAULT_PERIOD", () => {
  test("should be 30", () => {
    expect(DEFAULT_PERIOD).toBe("30");
  });
});

describe("getPeriodConfig", () => {
  test("should return config for known period values", () => {
    expect(getPeriodConfig("7").days).toBe(7);
    expect(getPeriodConfig("30").days).toBe(30);
    expect(getPeriodConfig("365").days).toBe(365);
    expect(getPeriodConfig("all").days).toBe("all");
  });

  test("should return default period for unknown value", () => {
    const config = getPeriodConfig("unknown");
    expect(config.value).toBe(DEFAULT_PERIOD);
  });

  test("should return default period for empty string", () => {
    const config = getPeriodConfig("");
    expect(config.value).toBe(DEFAULT_PERIOD);
  });
});

describe("getPeriodDays", () => {
  test("should return numeric days for numeric periods", () => {
    expect(getPeriodDays("7")).toBe(7);
    expect(getPeriodDays("30")).toBe(30);
    expect(getPeriodDays("365")).toBe(365);
  });

  test("should return 'all' for all period", () => {
    expect(getPeriodDays("all")).toBe("all");
  });

  test("should return default days for unknown value", () => {
    expect(getPeriodDays("unknown")).toBe(30);
  });
});

describe("isPeriodValue", () => {
  test("should return true for valid period values", () => {
    expect(isPeriodValue("7")).toBe(true);
    expect(isPeriodValue("30")).toBe(true);
    expect(isPeriodValue("365")).toBe(true);
    expect(isPeriodValue("all")).toBe(true);
  });

  test("should return false for invalid values", () => {
    expect(isPeriodValue("1")).toBe(false);
    expect(isPeriodValue("90")).toBe(false);
    expect(isPeriodValue("")).toBe(false);
    expect(isPeriodValue("ALL")).toBe(false);
  });
});

describe("getAllPeriodValues", () => {
  test("should return all period values", () => {
    const values = getAllPeriodValues();
    expect(values).toEqual(["7", "30", "365", "all"]);
  });
});

describe("generatePeriodStaticParams", () => {
  test("should return params for each period", () => {
    const params = generatePeriodStaticParams();
    expect(params).toHaveLength(4);
    expect(params[0]).toEqual({ period: "7" });
    expect(params[1]).toEqual({ period: "30" });
    expect(params[2]).toEqual({ period: "365" });
    expect(params[3]).toEqual({ period: "all" });
  });
});
