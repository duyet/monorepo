import { describe, expect, it } from "vitest";
import { getSourceBadgeVariant } from "./utils";

describe("getSourceBadgeVariant", () => {
  it("maps known sources and falls back to default", () => {
    expect(getSourceBadgeVariant("curated")).toBe("curated");
    expect(getSourceBadgeVariant("epoch")).toBe("epoch");
    expect(getSourceBadgeVariant("papers")).toBe("default");
    expect(getSourceBadgeVariant(undefined)).toBe("default");
  });
});
