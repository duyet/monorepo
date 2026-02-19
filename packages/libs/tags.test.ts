import { describe, expect, test } from "bun:test";
import { normalizeTag } from "./tags";

describe("normalizeTag", () => {
  test("should capitalize first letter of single word", () => {
    expect(normalizeTag("javascript")).toBe("Javascript");
    expect(normalizeTag("JAVASCRIPT")).toBe("Javascript");
    expect(normalizeTag("javaScript")).toBe("Javascript");
  });

  test("should capitalize first letter of each word", () => {
    expect(normalizeTag("javascript framework")).toBe("Javascript Framework");
    expect(normalizeTag("JAVASCRIPT FRAMEWORK")).toBe("Javascript Framework");
    expect(normalizeTag("javaScript frameWork")).toBe("Javascript Framework");
  });

  test("should handle empty string", () => {
    expect(normalizeTag("")).toBe("");
  });

  test("should handle multiple spaces between words", () => {
    expect(normalizeTag("javascript    framework")).toBe(
      "Javascript Framework"
    );
  });

  test("should handle special characters", () => {
    expect(normalizeTag("node.js")).toBe("Node.js");
    expect(normalizeTag("c++")).toBe("C++");
  });
});
