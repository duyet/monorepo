import { describe, expect, it } from "vitest";
import { normalizeHeader } from "./csv";

describe("normalizeHeader", () => {
  it("lowercases, drops symbols, and keeps parentheses", () => {
    expect(normalizeHeader("Parameters \n(B)")).toBe("parameters (b)");
    expect(normalizeHeader("Announced\n▼")).toBe("announced");
    expect(normalizeHeader("Public?")).toBe("public");
  });
});
