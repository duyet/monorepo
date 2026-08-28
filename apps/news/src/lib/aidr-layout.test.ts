import { describe, expect, it } from "vitest";
import { DEFAULT_AIDR_LAYOUT, parseAidrLayout } from "./aidr-layout";

describe("parseAidrLayout", () => {
  it("defaults to A", () => {
    expect(parseAidrLayout(undefined)).toBe(DEFAULT_AIDR_LAYOUT);
    expect(parseAidrLayout("")).toBe("a");
    expect(parseAidrLayout("z")).toBe("a");
  });

  it("accepts a, b, and c only", () => {
    expect(parseAidrLayout("a")).toBe("a");
    expect(parseAidrLayout("b")).toBe("b");
    expect(parseAidrLayout("c")).toBe("c");
  });
});
