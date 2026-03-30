import { describe, expect, test } from "bun:test";

describe("SkeletonCard Component", () => {
  test("should export SkeletonCard as a function", async () => {
    const { SkeletonCard } = await import("../components/SkeletonCard");
    expect(typeof SkeletonCard).toBe("function");
  });

  test("should be a named export", async () => {
    const mod = await import("../components/SkeletonCard");
    expect(mod.SkeletonCard).toBeDefined();
    expect(typeof mod.SkeletonCard).toBe("function");
  });
});
