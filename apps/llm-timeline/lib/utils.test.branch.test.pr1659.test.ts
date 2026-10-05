import { describe, expect, it } from "vitest";
import type { Model } from "./data";
import { getLicenseBadgeVariant } from "./utils";

describe("getLicenseBadgeVariant", () => {
  it("maps each license to its badge variant", () => {
    expect(getLicenseBadgeVariant("open")).toBe("open");
    expect(getLicenseBadgeVariant("closed")).toBe("closed");
    expect(getLicenseBadgeVariant("partial")).toBe("partial");
  });

  it("falls back to default for an unknown license", () => {
    expect(getLicenseBadgeVariant("other" as Model["license"])).toBe("default");
  });
});
