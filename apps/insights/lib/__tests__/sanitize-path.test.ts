import { describe, expect, test } from "vitest";
import { sanitizePathLabel } from "../sanitize-path";

describe("sanitizePathLabel", () => {
  test("keeps a bare label unchanged", () => {
    expect(sanitizePathLabel("monorepo")).toBe("monorepo");
  });

  test("strips unix directory structure", () => {
    expect(sanitizePathLabel("/home/duyet/code/monorepo")).toBe("monorepo");
  });

  test("strips windows directory structure", () => {
    expect(sanitizePathLabel("C:\\Users\\duyet\\code\\monorepo")).toBe(
      "monorepo"
    );
  });

  test("handles mixed and repeated separators", () => {
    expect(sanitizePathLabel("C:/Users\\\\duyet//monorepo")).toBe("monorepo");
  });

  test("drops trailing separators", () => {
    expect(sanitizePathLabel("/home/duyet/monorepo/")).toBe("monorepo");
  });

  test("returns Unknown for empty and missing values", () => {
    expect(sanitizePathLabel("")).toBe("Unknown");
    expect(sanitizePathLabel(null)).toBe("Unknown");
    expect(sanitizePathLabel(undefined)).toBe("Unknown");
  });

  test("returns Unknown when the value is only separators", () => {
    expect(sanitizePathLabel("///")).toBe("Unknown");
  });

  test("stringifies non-string values rather than leaking them raw", () => {
    expect(sanitizePathLabel(42)).toBe("42");
  });
});
