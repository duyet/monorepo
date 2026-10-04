import { describe, expect, it } from "vitest";
import { normalizeDate } from "./normalizers";

describe("normalizeDate", () => {
  it("returns the real normalized date for a small fixture", () => {
    expect(normalizeDate("2024-01-15")).toBe("2024-01-15");
    expect(normalizeDate("2024-01-15T00:00:00Z")).toBe("2024-01-15");
    expect(normalizeDate("2024-03")).toBe("2024-03-01");
    expect(normalizeDate("Q2 2024")).toBe("2024-04-01");
    expect(normalizeDate("TBA")).toBeNull();
  });
});
