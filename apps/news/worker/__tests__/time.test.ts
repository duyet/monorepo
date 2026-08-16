import { describe, expect, it } from "vitest";
import { toEpochSeconds } from "../time.js";

describe("toEpochSeconds", () => {
  it("converts a millisecond epoch timestamp to seconds", () => {
    // 2026-08-15T21:12:54.000Z in ms, as reported by the huggingnews bug
    expect(toEpochSeconds(1786847892625)).toBe(1786847892);
  });

  it("leaves an already-in-seconds timestamp unchanged", () => {
    expect(toEpochSeconds(1786847892)).toBe(1786847892);
  });

  it("floors fractional seconds input", () => {
    expect(toEpochSeconds(1786847892.9)).toBe(1786847892);
  });

  it("treats 0 as already seconds", () => {
    expect(toEpochSeconds(0)).toBe(0);
  });
});
