import { describe, expect, test } from "vitest";
import { normalizeText } from "./normalizers";

describe("normalizeText", () => {
  test("collapses whitespace and trims a small fixture", () => {
    expect(normalizeText("  GPT\n  4  ")).toBe("GPT 4");
  });
});
