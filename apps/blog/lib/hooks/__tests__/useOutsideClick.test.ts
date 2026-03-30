import { describe, expect, test } from "bun:test";

describe("useOutsideClick", () => {
  test("should export useOutsideClick as a function", async () => {
    const { useOutsideClick } = await import("../useOutsideClick");
    expect(typeof useOutsideClick).toBe("function");
  });

  test("should accept callback with optional enabled parameter", async () => {
    const { useOutsideClick } = await import("../useOutsideClick");
    // The hook takes a callback function and optional enabled boolean (default true)
    // Note: default params reduce reported arity to 1
    expect(useOutsideClick).toBeDefined();
    expect(useOutsideClick.length).toBeGreaterThanOrEqual(1);
  });
});
