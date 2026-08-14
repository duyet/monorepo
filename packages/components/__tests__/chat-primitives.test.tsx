import { describe, expect, it } from "vitest";
import { Attachment, Bubble, Marker, Message, MessageScroller } from "../index";

function isComponent(value: unknown): value is (...args: never[]) => unknown {
  return typeof value === "function";
}

describe("official shadcn chat primitives", () => {
  it("exports MessageScroller, Message, Bubble, Attachment, and Marker as components", () => {
    expect(isComponent(MessageScroller)).toBe(true);
    expect(isComponent(Message)).toBe(true);
    expect(isComponent(Bubble)).toBe(true);
    expect(isComponent(Attachment)).toBe(true);
    expect(isComponent(Marker)).toBe(true);
  });
});
