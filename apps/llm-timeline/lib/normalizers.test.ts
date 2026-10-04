import { describe, expect, it } from "vitest";
import { mapAccessibility } from "./normalizers";

describe("mapAccessibility", () => {
  it("maps a small accessibility fixture to open, closed, or partial", () => {
    expect(mapAccessibility("Open access")).toBe("open");
    expect(mapAccessibility("Closed")).toBe("closed");
    expect(mapAccessibility("Research")).toBe("partial");
  });
});
