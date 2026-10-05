import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Importing ./index pulls in the source adapters, which import
// lib/normalizers → the wasm-pack bundle. That artifact only exists after
// `pnpm run wasm:build`, which CI runs before the tests (#1793),
// so where it is absent — a local checkout that never ran the Rust build — the
// static import would fail at collection. Guard on the artifact and load
// the module dynamically inside the test instead. Same guard as
// lib/normalizers.test.ts.
const wasmReady = existsSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../../../packages/wasm/pkg/normalizers/normalizers.js",
  ),
);

describe.skipIf(!wasmReady)("getEnabledSources", () => {
  it("returns every registered source except disabled names", async () => {
    const { ALL_SOURCES, getEnabledSources } = await import("./index");

    expect(ALL_SOURCES.map((s) => s.name)).toEqual(["curated", "epoch"]);
    expect(getEnabledSources(new Set()).map((s) => s.name)).toEqual([
      "curated",
      "epoch",
    ]);
    expect(getEnabledSources(new Set(["epoch"])).map((s) => s.name)).toEqual([
      "curated",
    ]);
    expect(getEnabledSources(new Set(["curated", "epoch"]))).toEqual([]);
  });
});
