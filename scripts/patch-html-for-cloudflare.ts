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
 * when stale assets 404 as HTML). Retry the entry module if `window.__CF_ENTRY_RAN__`
 * was never set — do not treat a prerendered <main>/<header> as a successful boot
 * (agent-ui's static shell always has both, which used to skip the retry forever).
 *
 * Also hard-reload once (sessionStorage, 30s) when a dynamic import / module
 * script fails — common after deploys when an edge still has SPA HTML cached
 * under a previous /assets/* hash with immutable headers.
 */
const HYDRATION_RETRY = `<script data-cfasync="false">(function(){var K="cf_stale_chunk_reload",W=3e4;function shouldReload(m){if(!m)return!1;m=String(m);return/Failed to fetch dynamically imported module|Importing a module script failed|Expected a JavaScript-or-Wasm module script|text\\/html|loading module script|error loading dynamically imported module|Invariant failed/i.test(m)}function softReload(reason){try{var n=Date.now(),p=parseInt(sessionStorage.getItem(K)||"0",10);if(p&&n-p<W)return;sessionStorage.setItem(K,String(n));console.warn("[cf-stale-chunk]",reason);location.reload()}catch(e){location.reload()}}function boot(n){var s=document.querySelector('script[type="module"][src*="/static/index-"],script[type="module"][src*="/assets/index-"],script[type="module"][src*="/assets/main-"]');if(!s||!s.src)return;import(s.src+(s.src.indexOf("?")>=0?"&":"?")+"cf_retry="+n).catch(function(e){if(shouldReload(e&&e.message))softReload(e.message);else if(n<4)setTimeout(function(){boot(n+1)},250*n);else console.error("[cf-hydrate-retry]",e)})}window.addEventListener("unhandledrejection",function(e){var r=e&&e.reason,m=r&&(r.message||r);if(shouldReload(m))softReload(m)});window.addEventListener("error",function(e){var m=(e&&e.message)||(e&&e.error&&e.error.message)||"";var t=e&&e.target;if(t&&t.tagName==="SCRIPT"&&t.src&&(t.src.indexOf("/static/")!==-1||t.src.indexOf("/assets/")!==-1))softReload("script error "+t.src);else if(shouldReload(m))softReload(m)},!0);window.addEventListener("vite:preloadError",function(e){try{e.preventDefault()}catch(_){}softReload("vite:preloadError")});window.addEventListener("load",function(){setTimeout(function(){if(window.__CF_ENTRY_RAN__)return;boot(1)},800)})})();</script>`;

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
      (updated.includes("/assets/index-") ||
        updated.includes("/static/index-") ||
        updated.includes("/assets/main-")) &&
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
