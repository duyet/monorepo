import { describe, expect, test } from "vitest";
import { convertNumericParams } from "./normalizers";

describe("convertNumericParams", () => {
  test("formats a small parameter count as millions", () => {
    expect(convertNumericParams("175000000")).toBe("175M");
  });
});
