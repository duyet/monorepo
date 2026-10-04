import { describe, expect, it } from "vitest";
import { normalizeLicense } from "./normalizers";

describe("normalizeLicense", () => {
  it("maps a small license fixture to open, closed, or partial", () => {
    expect(normalizeLicense("Apache 2.0")).toBe("open");
    expect(normalizeLicense("Proprietary")).toBe("closed");
    expect(normalizeLicense("Research only")).toBe("partial");
  });
});
