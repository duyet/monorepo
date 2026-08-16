export type SuggestField = "title" | "summary";

/** Minimal DOM node shape this needs — duck-typed so it's easy to unit
 * test without a jsdom environment. */
export interface SuggestFieldNode {
  nodeType?: number;
  getAttribute?(name: string): string | null;
  parentElement: SuggestFieldNode | null;
}

/**
 * Walks up from a DOM node to the nearest ancestor (or itself) carrying a
 * `data-suggest-field="title"|"summary"` attribute, used to figure out
 * which field a text selection belongs to for the selection-to-suggest
 * floating button.
 */
export function detectSuggestField(
  node: SuggestFieldNode | null
): SuggestField | null {
  // Text nodes (nodeType === 3) have no getAttribute — start from the
  // parent element instead.
  let el: SuggestFieldNode | null =
    node && typeof node.getAttribute === "function"
      ? node
      : (node?.parentElement ?? null);
  while (el) {
    const field = el.getAttribute?.("data-suggest-field") ?? null;
    if (field === "title" || field === "summary") return field;
    el = el.parentElement;
  }
  return null;
}
