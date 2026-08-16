import { describe, expect, it } from "vitest";
import { type SuggestionInput, validateSuggestion } from "./suggest-fn";

function input(overrides: Partial<SuggestionInput> = {}): SuggestionInput {
  return {
    item_id: "abc123",
    field: "summary",
    suggestion: "Bản dịch chính xác hơn.",
    user_id: "user_1",
    user_name: "duyet",
    ...overrides,
  };
}

describe("validateSuggestion", () => {
  it("trims and returns a valid suggestion", () => {
    expect(validateSuggestion(input({ suggestion: "  hi  " }))).toBe("hi");
  });

  it("rejects empty/whitespace-only suggestions", () => {
    expect(() => validateSuggestion(input({ suggestion: "   " }))).toThrow();
  });

  it("rejects suggestions over 2000 characters", () => {
    expect(() =>
      validateSuggestion(input({ suggestion: "a".repeat(2001) }))
    ).toThrow();
    expect(() =>
      validateSuggestion(input({ suggestion: "a".repeat(2000) }))
    ).not.toThrow();
  });

  it("rejects an invalid field", () => {
    // @ts-expect-error deliberately invalid for the test
    expect(() => validateSuggestion(input({ field: "body" }))).toThrow();
  });

  it("rejects a missing item_id", () => {
    expect(() => validateSuggestion(input({ item_id: "" }))).toThrow();
  });

  it("rejects a missing user_id (not signed in)", () => {
    expect(() => validateSuggestion(input({ user_id: "" }))).toThrow();
  });
});
