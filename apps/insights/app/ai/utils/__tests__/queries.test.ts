import { describe, test, expect } from "bun:test";
import {
  getDateCondition,
  getCreatedAtCondition,
  validateDaysParameter,
} from "../queries";

describe("getDateCondition", () => {
  test("returns empty string for 'all'", () => {
    expect(getDateCondition("all")).toBe("");
  });

  test("returns WHERE clause with INTERVAL for valid number", () => {
    expect(getDateCondition(7)).toBe(
      "WHERE date > today() - INTERVAL 7 DAY"
    );
    expect(getDateCondition(30)).toBe(
      "WHERE date > today() - INTERVAL 30 DAY"
    );
    expect(getDateCondition(90)).toBe(
      "WHERE date > today() - INTERVAL 90 DAY"
    );
  });
});

describe("getCreatedAtCondition", () => {
  test("returns empty string for 'all'", () => {
    expect(getCreatedAtCondition("all")).toBe("");
  });

  test("returns WHERE clause with created_at for valid number", () => {
    expect(getCreatedAtCondition(7)).toBe(
      "WHERE created_at > today() - INTERVAL 7 DAY"
    );
    expect(getCreatedAtCondition(30)).toBe(
      "WHERE created_at > today() - INTERVAL 30 DAY"
    );
  });
});

describe("validateDaysParameter", () => {
  test("passes 'all' through unchanged", () => {
    expect(validateDaysParameter("all")).toBe("all");
  });

  test("passes valid positive numbers through", () => {
    expect(validateDaysParameter(7)).toBe(7);
    expect(validateDaysParameter(30)).toBe(30);
    expect(validateDaysParameter(365)).toBe(365);
    expect(validateDaysParameter(3650)).toBe(3650);
  });

  test("falls back to 30 for out-of-range values", () => {
    expect(validateDaysParameter(0)).toBe(30);
    expect(validateDaysParameter(-1)).toBe(30);
    expect(validateDaysParameter(3651)).toBe(30);
    expect(validateDaysParameter(9999)).toBe(30);
  });
});
