import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Importing ./normalizers pulls in the wasm-pack bundle. That artifact only
// exists after `pnpm run wasm:build`, which CI runs before the tests (#1793),
// so where it is absent — a local checkout that never ran the Rust build — the
// static import would fail at collection. Guard on the artifact and load the
// module dynamically inside the test instead. Same guard as
// scripts/sources/index.test.ts.
const wasmReady = existsSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../../packages/wasm/pkg/normalizers/normalizers.js",
  ),
);

let api: typeof import("./normalizers") | undefined;
async function load() {
  api ??= await import("./normalizers");
  return api;
}

describe.skipIf(!wasmReady)("normalizeBatch", () => {
  it("returns native results in order and maps empty strings to null", async () => {
    const results = (await load()).normalizeBatch([
      { fn: "normalize_date", args: ["2024-01"] },
      { fn: "normalize_license", args: ["Apache 2.0"] },
      { fn: "normalize_text", args: ["hello\nworld"] },
      { fn: "normalize_date", args: ["TBA"] },
    ]);

    expect(results).toEqual(["2024-01-01", "open", "hello world", null]);
  });
});

describe.skipIf(!wasmReady)("normalizeDate", () => {
  it("returns the real normalized date for a small fixture", async () => {
    expect((await load()).normalizeDate("2024-01-15")).toBe("2024-01-15");
    expect((await load()).normalizeDate("2024-01-15T00:00:00Z")).toBe(
      "2024-01-15",
    );
    expect((await load()).normalizeDate("2024-03")).toBe("2024-03-01");
    expect((await load()).normalizeDate("Q2 2024")).toBe("2024-04-01");
    expect((await load()).normalizeDate("TBA")).toBeNull();
  });
});

describe.skipIf(!wasmReady)("normalizeParams", () => {
  it("compacts a worded parameter count", async () => {
    expect((await load()).normalizeParams("175 billion")).toBe("175B");
  });

  it("returns null when the value is not a parameter count", async () => {
    expect((await load()).normalizeParams("unknown")).toBeNull();
  });
});

describe.skipIf(!wasmReady)("normalizeLicense", () => {
  it("maps a small license fixture to open, closed, or partial", async () => {
    expect((await load()).normalizeLicense("Apache 2.0")).toBe("open");
    expect((await load()).normalizeLicense("Proprietary")).toBe("closed");
    expect((await load()).normalizeLicense("Research only")).toBe("partial");
  });
});

describe.skipIf(!wasmReady)("mapAccessibility", () => {
  it("maps a small accessibility fixture to open, closed, or partial", async () => {
    expect((await load()).mapAccessibility("Open access")).toBe("open");
    expect((await load()).mapAccessibility("Closed")).toBe("closed");
    expect((await load()).mapAccessibility("Research")).toBe("partial");
  });
});

describe.skipIf(!wasmReady)("normalizeType", () => {
  it("treats a paper as a milestone", async () => {
    expect((await load()).normalizeType("Paper")).toBe("milestone");
  });

  it("treats anything else as a model", async () => {
    expect((await load()).normalizeType("llm")).toBe("model");
  });
});

describe.skipIf(!wasmReady)("normalizeText", () => {
  it("collapses whitespace and trims a small fixture", async () => {
    expect((await load()).normalizeText("  GPT\n  4  ")).toBe("GPT 4");
  });
});

describe.skipIf(!wasmReady)("convertNumericParams", () => {
  it("formats a small parameter count as millions", async () => {
    expect((await load()).convertNumericParams("175000000")).toBe("175M");
  });
});

describe.skipIf(!wasmReady)("formatTrainingCompute", () => {
  it("formats large FLOP counts in scientific notation", async () => {
    expect((await load()).formatTrainingCompute(1.2e25)).toBe("1.2e25");
    expect((await load()).formatTrainingCompute(1e25)).toBe("1e25");
  });

  it("leaves small FLOP counts as a plain number", async () => {
    expect((await load()).formatTrainingCompute(1e10)).toBe("10000000000");
  });
});
