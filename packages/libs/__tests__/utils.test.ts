import { describe, expect, test } from "bun:test";
import { cn } from "../utils";

describe("cn utility", () => {
  test("should merge class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  test("should handle conditional classes", () => {
    const result = cn("base", false && "hidden", "active");
    expect(result).toBe("base active");
  });

  test("should handle undefined and null values", () => {
    const result = cn("base", undefined, null, "end");
    expect(result).toBe("base end");
  });

  test("should merge tailwind conflict classes correctly", () => {
    // tailwind-merge should resolve conflicts (last one wins)
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  test("should merge conflicting responsive classes", () => {
    const result = cn("md:text-base", "md:text-lg");
    expect(result).toBe("md:text-lg");
  });

  test("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  test("should handle array of classes", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).toContain("baz");
  });

  test("should handle object notation", () => {
    const result = cn({ active: true, disabled: false });
    expect(result).toBe("active");
  });
});
