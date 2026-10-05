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


describe.skipIf(!wasmReady)("normalizeText", () => {
  let api;
  async function load() {
    api ??= await import("./normalizers");
    return api;
  }
  test("collapses whitespace and trims a small fixture", async () => {
    expect((await load()).normalizeText("  GPT\n  4  ")).toBe("GPT 4");
  });
});
