import { describe, expect, it } from "vitest";
import { getLicenseBarColor } from "./utils";

describe("getLicenseBarColor", () => {
  it("maps each license to its bar color", () => {
    expect(getLicenseBarColor("open")).toBe("var(--rd-ok)");
    expect(getLicenseBarColor("closed")).toBe("var(--rd-down)");
    expect(getLicenseBarColor("partial")).toBe("var(--rd-accent)");
  });
});
