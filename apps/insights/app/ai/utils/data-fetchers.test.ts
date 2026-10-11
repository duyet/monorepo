import { describe, expect, test } from "vitest";
import { getDuckDBDateCondition } from "./data-fetchers";

describe("getDuckDBDateCondition", () => {
  test("returns an empty filter for all time and a day interval otherwise", () => {
    expect(getDuckDBDateCondition("all", "created_at")).toBe("");
    expect(getDuckDBDateCondition(7, "created_at")).toBe(
      "WHERE created_at > current_date - INTERVAL 7 DAY",
    );
  });
});
