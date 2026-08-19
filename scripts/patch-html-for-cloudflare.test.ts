import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "patch-html-for-cloudflare.ts"),
  "utf8",
);

describe("Cloudflare hydration retry", () => {
  it("retries the entry module even when a static header/main shell is present", () => {
    expect(source).toContain("cf-hydrate-retry");
    expect(source).toContain("if(window.__CF_ENTRY_RAN__)return;boot(1)");
    expect(source).not.toContain('document.querySelector("main,header")');
  });
});
