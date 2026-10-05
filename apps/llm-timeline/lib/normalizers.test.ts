import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, test } from "vitest";

// lib/normalizers loads the wasm-pack bundle. That artifact exists only after
// `pnpm run wasm:build`. CI unit tests do not build it, so a static import
// fails at collection. Same guard as scripts/sources/index.test.ts.
const wasmReady = existsSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../../packages/wasm/pkg/normalizers/normalizers.js",
  ),
);


describe.skipIf(!wasmReady)("formatTrainingCompute", () => {
  let api;
  async function load() {
    api ??= await import("./normalizers");
    return api;
  }
  it("formats large FLOP counts in scientific notation", async () => {
    expect((await load()).formatTrainingCompute(1.2e25)).toBe("1.2e25");
    expect((await load()).formatTrainingCompute(1e25)).toBe("1e25");
  });

  it("leaves small FLOP counts as a plain number", async () => {
    expect((await load()).formatTrainingCompute(1e10)).toBe("10000000000");
  });
});
