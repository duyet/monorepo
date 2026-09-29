import { describe, expect, it } from "vitest";
import { hoverHintText } from "./graph-mount";

/**
 * The hover hint strip under the controls. It is the one piece of the mount
 * that renders text a user actually reads, and it is written straight into the
 * DOM (not React state) so sweeping the pointer cannot re-render the overlay
 * tree — which also means nothing else would catch a regression here.
 */
describe("hoverHintText", () => {
  it("prefixes the node's title", () => {
    expect(hoverHintText("ForceAtlas2 layout", "fa2")).toBe(
      " · ForceAtlas2 layout"
    );
  });

  it("falls back to the raw id for a node with no title yet", () => {
    expect(hoverHintText(undefined, "fa2")).toBe(" · fa2");
  });

  it("keeps an empty title empty rather than substituting the id", () => {
    // `??`, not `||` — a node that is present with a blank title is a real
    // state, and showing its id there would be a lie about the label.
    expect(hoverHintText("", "fa2")).toBe(" · ");
  });
});
