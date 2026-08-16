import { describe, expect, it } from "vitest";
import { detectSuggestField, type SuggestFieldNode } from "./selection-field";

function el(
  attrs: Record<string, string>,
  parentElement: SuggestFieldNode | null = null
): SuggestFieldNode {
  return {
    getAttribute: (name) => attrs[name] ?? null,
    parentElement,
  };
}

function textNode(parentElement: SuggestFieldNode | null): SuggestFieldNode {
  return { nodeType: 3, parentElement };
}

describe("detectSuggestField", () => {
  it("returns null for a null node", () => {
    expect(detectSuggestField(null)).toBeNull();
  });

  it("returns the field when the node itself carries the attribute", () => {
    const node = el({ "data-suggest-field": "summary" });
    expect(detectSuggestField(node)).toBe("summary");
  });

  it("walks up to find an ancestor with the attribute", () => {
    const parent = el({ "data-suggest-field": "title" });
    const child = el({}, parent);
    const text = textNode(child);
    expect(detectSuggestField(text)).toBe("title");
  });

  it("returns null when no ancestor has the attribute", () => {
    const parent = el({});
    const child = el({}, parent);
    expect(detectSuggestField(child)).toBeNull();
  });

  it("ignores an invalid attribute value", () => {
    const node = el({ "data-suggest-field": "bogus" });
    expect(detectSuggestField(node)).toBeNull();
  });

  it("starts from the parent element when given a text node directly", () => {
    const parent = el({ "data-suggest-field": "summary" });
    const text = textNode(parent);
    expect(detectSuggestField(text)).toBe("summary");
  });
});
