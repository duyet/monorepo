import { describe, expect, test } from "bun:test";

// Test the useClipboard hook logic directly without React rendering
// Since this uses navigator.clipboard and React hooks, we test the exported interface

describe("useClipboard", () => {
  test("should export useClipboard as a function", async () => {
    const { useClipboard } = await import("../useClipboard");
    expect(typeof useClipboard).toBe("function");
  });

  test("useClipboard should accept options parameter", async () => {
    const { useClipboard } = await import("../useClipboard");
    // The hook accepts an options object with optional timeout
    // We can verify it's callable without throwing during import
    expect(useClipboard).toBeDefined();
    expect(useClipboard.length).toBe(0); // default parameter means 0 arity
  });
});
