import { describe, expect, it } from "vitest";
import { formatTrainingCompute } from "./normalizers";

describe("formatTrainingCompute", () => {
  it("formats large FLOP counts in scientific notation", () => {
    expect(formatTrainingCompute(1.2e25)).toBe("1.2e25");
    expect(formatTrainingCompute(1e25)).toBe("1e25");
  });

  it("leaves small FLOP counts as a plain number", () => {
    expect(formatTrainingCompute(1e10)).toBe("10000000000");
  });
});
