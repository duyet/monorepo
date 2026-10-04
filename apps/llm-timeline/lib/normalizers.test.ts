import { describe, expect, it } from "vitest";
import { normalizeParams } from "./normalizers";

describe("normalizeParams", () => {
  it("compacts a worded parameter count", () => {
    expect(normalizeParams("175 billion")).toBe("175B");
  });

  it("returns null when the value is not a parameter count", () => {
    expect(normalizeParams("unknown")).toBeNull();
  });
});
