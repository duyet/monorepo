/**
 * Postbuild: opt every first-party <script> out of Cloudflare Rocket Loader
 * by adding `data-cfasync="false"`. Shared by all SSG apps.
 *
 * Why: Rocket Loader (enabled zone-wide on duyet.net) rewrites the TanStack
 * Start hydration entry `type="module"` to `type="<hash>-module"`, a dead MIME
 * the browser never executes and Rocket Loader's own re-executor ignores. The
 * page renders (static SSG HTML) but never hydrates — menus, dropdowns, theme
 * toggles all freeze; SPA-style routes (e.g. ai-percentage) go blank.
 *
 * `data-cfasync="false"` is Cloudflare's documented opt-out: tagged scripts are
 * left untouched and run natively, in document order. Every <script> in
 * dist/client is first-party (Cloudflare injects its own scripts at the edge,
 * not into our static files), so tagging all of them is safe and preserves the
 * inline-bootstrap -> module execution order.
 *
 * Run from an app directory: `tsx ../../scripts/patch-html-for-cloudflare.ts`
 * (operates on `<cwd>/dist/client`). See apps/kb cloudflare-rocket-loader note.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist", "client");

// Match a real <script> open tag that is not already opted out.
const SCRIPT_OPEN = /<script\b(?![^>]*\bdata-cfasync=)/g;

/**
 * Cloudflare zone scripts (Zaraz/GTM/bot signals) on custom hostnames can race
 * the first type=module load so hydration never starts (blank page / MIME errors
 * when stale assets 404 as HTML). Retry the entry module once if React never
 * mounts a <main>.
 */
const HYDRATION_RETRY = `<script data-cfasync="false">(function(){function boot(n){var s=document.querySelector('script[type="module"][src*="/assets/index-"]');if(!s||!s.src)return;import(s.src+(s.src.indexOf("?")>=0?"&":"?")+"cf_retry="+n).catch(function(e){if(n<4)setTimeout(function(){boot(n+1)},250*n);else console.error("[cf-hydrate-retry]",e)})}window.addEventListener("load",function(){setTimeout(function(){if(!document.querySelector("main"))boot(1)},800)})})();</script>`;

let files = 0;
let tags = 0;
let retries = 0;

function patchHtmlFiles(dir: string) {
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    if (statSync(filePath).isDirectory()) {
      patchHtmlFiles(filePath);
      continue;
    }
    if (!filePath.endsWith(".html")) continue;

    const original = readFileSync(filePath, "utf8");
    let count = 0;
    let updated = original.replace(SCRIPT_OPEN, () => {
      count += 1;
      return '<script data-cfasync="false"';
    });
    if (
      updated.includes("/assets/index-") &&
      !updated.includes("cf-hydrate-retry") &&
      updated.includes("</body>")
    ) {
      updated = updated.replace("</body>", `${HYDRATION_RETRY}</body>`);
      retries += 1;
    }
    if (count > 0 || updated !== original) {
      writeFileSync(filePath, updated);
      files += 1;
      tags += count;
    }
  }
}

patchHtmlFiles(distDir);
console.log(
  `Rocket Loader opt-out: tagged ${tags} <script> tags across ${files} HTML files; hydration retry on ${retries} files.`,
);
