import { describe, test, expect } from "bun:test";
import { cn } from "./utils";

describe("cn", () => {
  test("merges basic class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", true && "bar")).toBe("foo bar");
  });

  test("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  test("resolves conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  test("handles object syntax", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  test("handles array syntax", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  test("returns empty string with no inputs", () => {
    expect(cn()).toBe("");
  });

  test("deduplicates same Tailwind modifiers", () => {
    expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe(
      "hover:bg-blue-500"
    );
  });

  test("handles mixed input types", () => {
    const active = true;
    expect(cn("base", active && "active", { hidden: false }, ["extra"])).toBe(
      "base active extra"
    );
  });
});
