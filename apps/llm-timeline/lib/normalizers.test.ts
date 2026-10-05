import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// lib/normalizers loads the wasm-pack bundle. That artifact exists only after
// `pnpm run wasm:build`. CI unit tests do not build it, so a static import
// fails at collection. Same guard as scripts/sources/index.test.ts.
const wasmReady = existsSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../../packages/wasm/pkg/normalizers/normalizers.js",
  ),
);

describe.skipIf(!wasmReady)("normalizeDate", () => {
  it("returns the real normalized date for a small fixture", async () => {
    const { normalizeDate } = await import("./normalizers");

    expect(normalizeDate("2024-01-15")).toBe("2024-01-15");
    expect(normalizeDate("2024-01-15T00:00:00Z")).toBe("2024-01-15");
    expect(normalizeDate("2024-03")).toBe("2024-03-01");
    expect(normalizeDate("Q2 2024")).toBe("2024-04-01");
    expect(normalizeDate("TBA")).toBeNull();
  });
});
