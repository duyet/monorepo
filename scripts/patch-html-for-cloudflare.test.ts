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
import { patchHtml, preferStaticFirstPaint } from "./patch-html-for-cloudflare";

const LIVE_RETRY = `(function(){var K="cf_stale_chunk_reload",W=3e4;function shouldReload(m){if(!m)return!1;m=String(m);return/Failed to fetch dynamically imported module/i.test(m)}function boot(n){var s=document.querySelector('script[type="module"][src*="/assets/index-"]');if(!s||!s.src)return;import(s.src+(s.src.indexOf("?")>=0?"&":"?")+"cf_retry="+n).catch(function(e){if(shouldReload(e&&e.message))location.reload();else if(n<4)setTimeout(function(){boot(n+1)},250*n)})}window.addEventListener("load",function(){setTimeout(function(){if(window.__CF_ENTRY_RAN__)return;boot(1)},800)})})();`;

/** Minimal SSG page: a prerendered shell plus a hashed entry module. */
function page(body = "<main>Building agent workflows</main>") {
  return `<html><head><link rel="modulepreload" href="/assets/index-abc.js"/></head><body>${body}<script type="module" src="/assets/index-abc.js"></script></body></html>`;
}

describe("patchHtml", () => {
  it("tags first-party scripts out of Rocket Loader", () => {
    const { html, scriptTags } = patchHtml(page());
    expect(scriptTags).toBe(1);
    expect(html).toContain('<script data-cfasync="false" type="module"');
  });

  it("does not re-tag a script that already opted out", () => {
    const already =
      '<html><head></head><body><script data-cfasync="false" src="/assets/index-a.js"></script></body></html>';
    const { scriptTags } = patchHtml(already);
    expect(scriptTags).toBe(0);
  });

  // Regression: the retry used to be skipped whenever a prerendered
  // <main>/<header> was present, which is always true for agent-ui's static
  // shell. The page rendered but never hydrated.
  it("injects the hydration retry even when a static shell is present", () => {
    const { html, addedRetry } = patchHtml(page());
    expect(addedRetry).toBe(true);
    expect(html).toContain("cf-hydrate-retry");
    expect(html).not.toContain('document.querySelector("main,header")');
  });

  it("runs the retry when __CF_ENTRY_RAN__ was never set, with no cache-bust on n=1", () => {
    const { html } = patchHtml(page());
    expect(html).toContain("if(window.__CF_ENTRY_RAN__)return;boot(1)");
    // n<=1 reuses the same URL; only later attempts cache-bust. Getting this
    // wrong re-runs hydrateRoot on `document` and blanks the page.
    expect(html).toContain("n<=1?s.src:");
    expect(html).toContain('s0.addEventListener("load"');
  });

  it("injects the retry before </body>, not after", () => {
    const { html } = patchHtml(page());
    expect(html.indexOf("cf-hydrate-retry")).toBeLessThan(html.indexOf("</body>"));
  });

  it("is idempotent: a second pass adds no second retry", () => {
    const once = patchHtml(page());
    const twice = patchHtml(once.html);
    expect(twice.addedRetry).toBe(false);
    expect(twice.html).toBe(once.html);
  });

  it("skips the retry when there is no body close tag to anchor to", () => {
    const truncated =
      '<html><head></head><body><script type="module" src="/assets/index-a.js"></script>';
    const { addedRetry } = patchHtml(truncated);
    expect(addedRetry).toBe(false);
  });

  it("does not inject a retry into a page with no entry module", () => {
    const { addedRetry } = patchHtml(
      "<html><head></head><body><main>hi</main></body></html>",
    );
    expect(addedRetry).toBe(false);
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
