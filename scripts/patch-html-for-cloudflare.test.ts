import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  hydrationRetryHref,
  LEGACY_CACHE_BUST_IMPORT,
  rewriteHydrationRetryHtml,
  SAME_URL_FIRST_RETRY_IMPORT,
} from "../apps/home/functions/_middleware";
import { preferStaticFirstPaint } from "./patch-html-for-cloudflare";

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "patch-html-for-cloudflare.ts"),
  "utf8",
);

const LIVE_RETRY = `(function(){var K="cf_stale_chunk_reload",W=3e4;function shouldReload(m){if(!m)return!1;m=String(m);return/Failed to fetch dynamically imported module/i.test(m)}function boot(n){var s=document.querySelector('script[type="module"][src*="/assets/index-"]');if(!s||!s.src)return;import(s.src+(s.src.indexOf("?")>=0?"&":"?")+"cf_retry="+n).catch(function(e){if(shouldReload(e&&e.message))location.reload();else if(n<4)setTimeout(function(){boot(n+1)},250*n)})}window.addEventListener("load",function(){setTimeout(function(){if(window.__CF_ENTRY_RAN__)return;boot(1)},800)})})();`;

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
  it("patches currently deployed HTML so n=1 reuses the module URL", () => {
    expect(LIVE_RETRY).toContain(LEGACY_CACHE_BUST_IMPORT);

    const patched = rewriteHydrationRetryHtml(LIVE_RETRY);
    expect(patched).toContain(SAME_URL_FIRST_RETRY_IMPORT);
    expect(patched).not.toContain(LEGACY_CACHE_BUST_IMPORT);
    expect(patched).toContain(
      "if(window.__CF_ENTRY_RAN__)return;boot(1)",
    );
  });

  it("keeps the original module URL for n=1 and cache-busts later retries", () => {
    const src = "https://duyet.net/assets/index-Dvc9AEaz.js";
    expect(hydrationRetryHref(src, 1)).toBe(src);
    expect(hydrationRetryHref(src, 2)).toBe(`${src}?cf_retry=2`);
    expect(hydrationRetryHref(`${src}?x=1`, 3)).toBe(`${src}?x=1&cf_retry=3`);
  });
});

describe("home TanStack client entry", () => {
  const client = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../apps/home/src/client.tsx"),
    "utf8",
  );

  it("sets __CF_ENTRY_RAN__ before hydrateRoot so the CF retry does not run twice", () => {
    const flag = client.indexOf("w.__CF_ENTRY_RAN__ = true");
    const hydrate = client.indexOf("hydrateRoot(");
    expect(flag).toBeGreaterThan(0);
    expect(hydrate).toBeGreaterThan(flag);
  });

  it("hydrates after first paint so prerendered HTML is the first body", () => {
    expect(client).toContain("afterFirstPaint");
    expect(client).toContain("requestIdleCallback");
    expect(client.indexOf("afterFirstPaint")).toBeLessThan(
      client.indexOf("hydrateRoot("),
    );
  });
});

describe("preferStaticFirstPaint", () => {
  it("puts CSS before JS and drops head modulepreloads", () => {
    const html = `<html><head><link rel="modulepreload" href="/assets/main-abc.js"/><link rel="icon" href="/icon.svg"/><link rel="stylesheet" href="/assets/main-abc.css#" type="text/css"/></head><body><main>Building agent workflows</main><script type="module">import("/assets/main-abc.js")</script></body></html>`;
    const out = preferStaticFirstPaint(html);
    expect(out).toContain("Building agent workflows");
    expect(out).not.toContain("modulepreload");
    expect(out).toContain('href="/assets/main-abc.css"');
    expect(out).not.toContain(".css#");
    expect(out.indexOf('rel="stylesheet"')).toBeLessThan(
      out.indexOf('rel="icon"'),
    );
    expect(out).toContain('import("/assets/main-abc.js")');
  });
});
