import { describe, expect, test } from "bun:test";
import { deepMerge } from "./object-utils";

describe("deepMerge", () => {
  test("merges top-level keys", () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 99, c: 3 } as any);
    expect(result).toEqual({ a: 1, b: 99, c: 3 });
  });

  test("recursively merges nested objects", () => {
    const target = { a: 1, b: { c: 2, d: 3 } };
    const source = { b: { d: 99, e: 4 } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: { c: 2, d: 99, e: 4 } });
  });

  test("replaces arrays instead of merging", () => {
    const target = { items: [1, 2, 3] };
    const source = { items: [4, 5] };
    const result = deepMerge(target, source);
    expect(result).toEqual({ items: [4, 5] });
  });

  test("ignores undefined source values", () => {
    const target = { a: 1, b: 2 };
    const result = deepMerge(target, { b: undefined });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("merges empty source into target unchanged", () => {
    const target = { a: 1, b: { c: 2 } };
    const result = deepMerge(target, {});
    expect(result).toEqual({ a: 1, b: { c: 2 } });
  });

  test("merges into empty target from source", () => {
    const result = deepMerge({} as any, { a: 1, b: { c: 2 } } as any);
    expect(result).toEqual({ a: 1, b: { c: 2 } });
  });

  test("does not mutate original target", () => {
    const target = { a: 1, b: { c: 2 } };
    deepMerge(target, { b: { c: 99 } });
    expect(target.b.c).toBe(2);
  });

  test("source null value overrides target", () => {
    const target = { a: 1 };
    const result = deepMerge(target, { a: null } as any);
    expect(result.a).toBeNull();
  });

  test("handles deeply nested merge", () => {
    const target = { level1: { level2: { level3: { value: "original" } } } };
    const source = { level1: { level2: { level3: { value: "updated" } } } };
    const result = deepMerge(target, source);
    expect(result.level1.level2.level3.value).toBe("updated");
  });
});
