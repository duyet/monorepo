import { describe, expect, it } from "vitest";
import { normalizeBatch } from "./normalizers";

describe("normalizeBatch", () => {
  it("returns native results in order and maps empty strings to null", () => {
    const results = normalizeBatch([
      { fn: "normalize_date", args: ["2024-01"] },
      { fn: "normalize_license", args: ["Apache 2.0"] },
      { fn: "normalize_text", args: ["hello\nworld"] },
      { fn: "normalize_date", args: ["TBA"] },
    ]);

    expect(results).toEqual(["2024-01-01", "open", "hello world", null]);
  });
});
