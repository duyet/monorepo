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

  it("does not cache-bust the first retry (avoids a second hydrateRoot)", () => {
    expect(source).toContain("n<=1?s.src:");
    expect(source).toContain('s0.addEventListener("load"');
    expect(source).not.toMatch(
      /import\(s\.src\+\(s\.src\.indexOf\("\?"\)>=0\?"&":"\?"\)\+"cf_retry="\+n\)\.catch/,
    );
  });
});

describe("home Pages Function rewrites the old cache-busting retry", () => {
  it("patches the live boot() import so n=1 reuses the module URL", () => {
    const mw = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        "../apps/home/functions/_middleware.ts",
      ),
      "utf8",
    );
    expect(mw).toContain('n<=1?s.src:');
    expect(mw).toContain(
      'import(s.src+(s.src.indexOf("?")>=0?"&":"?")+"cf_retry="+n).catch(function(e){',
    );
  });
});
