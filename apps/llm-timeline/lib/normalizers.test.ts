import { describe, expect, it } from "vitest";
import { normalizeType } from "./normalizers";

describe("normalizeType", () => {
  it("treats a paper as a milestone", () => {
    expect(normalizeType("Paper")).toBe("milestone");
  });

  it("treats anything else as a model", () => {
    expect(normalizeType("llm")).toBe("model");
  });
});
