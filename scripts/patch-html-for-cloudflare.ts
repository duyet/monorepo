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
 * The first retry imports the SAME URL as the <script type=module> tag so a
 * successful first evaluation is a no-op (ESM module cache). Cache-busting
 * `?cf_retry=` on that first retry re-runs hydrateRoot on `document` and
 * blanks the page ~800ms after load. Only n>1 cache-busts.
 *
 * Also hard-reload once (sessionStorage, 30s) when a dynamic import / module
 * script fails — common after deploys when an edge still has SPA HTML cached
 * under a previous /assets/* hash with immutable headers.
 */
const HYDRATION_RETRY = `<script data-cfasync="false">(function(){var K="cf_stale_chunk_reload",W=3e4;function shouldReload(m){if(!m)return!1;m=String(m);return/Failed to fetch dynamically imported module|Importing a module script failed|Expected a JavaScript-or-Wasm module script|text\\/html|loading module script|error loading dynamically imported module|Invariant failed/i.test(m)}function softReload(reason){try{var n=Date.now(),p=parseInt(sessionStorage.getItem(K)||"0",10);if(p&&n-p<W)return;sessionStorage.setItem(K,String(n));console.warn("[cf-stale-chunk]",reason);location.reload()}catch(e){location.reload()}}function entryScript(){return document.querySelector('script[type="module"][src*="/static/index-"],script[type="module"][src*="/assets/index-"],script[type="module"][src*="/assets/main-"]')}function boot(n){var s=entryScript();if(!s||!s.src)return;var href=n<=1?s.src:s.src+(s.src.indexOf("?")>=0?"&":"?")+"cf_retry="+n;import(href).then(function(){window.__CF_ENTRY_RAN__=true}).catch(function(e){if(shouldReload(e&&e.message))softReload(e.message);else if(n<4)setTimeout(function(){boot(n+1)},250*n);else console.error("[cf-hydrate-retry]",e)})}var s0=entryScript();if(s0)s0.addEventListener("load",function(){window.__CF_ENTRY_RAN__=true});window.addEventListener("unhandledrejection",function(e){var r=e&&e.reason,m=r&&(r.message||r);if(shouldReload(m))softReload(m)});window.addEventListener("error",function(e){var m=(e&&e.message)||(e&&e.error&&e.error.message)||"";var t=e&&e.target;if(t&&t.tagName==="SCRIPT"&&t.src&&(t.src.indexOf("/static/")!==-1||t.src.indexOf("/assets/")!==-1))softReload("script error "+t.src);else if(shouldReload(m))softReload(m)},!0);window.addEventListener("vite:preloadError",function(e){try{e.preventDefault()}catch(_){}softReload("vite:preloadError")});window.addEventListener("load",function(){setTimeout(function(){if(window.__CF_ENTRY_RAN__)return;boot(1)},800)})})();</script>`;

let files = 0;
let tags = 0;
let retries = 0;

/**
 * Prerendered pages already contain the full body. Head `modulepreload` of the
 * 600kB+ client graph races the stylesheet, so first paint looks like the body
 * arrived later. Drop those preloads (the body module script still loads JS)
 * and put stylesheets first in `<head>`.
 */
export function preferStaticFirstPaint(html: string): string {
  let out = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>/gi, "");
  const sheets = [
    ...out.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi),
  ].map((m) => m[0]);
  if (sheets.length === 0) return out;
  for (const sheet of sheets) {
    out = out.replace(sheet, "");
  }
  const cleaned = sheets.map((sheet) =>
    sheet.replace(/(\.css)#(["'\s>])/g, "$1$2"),
  );
  return out.replace(/<head([^>]*)>/i, `<head$1>${cleaned.join("")}`);
}

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
    let updated = preferStaticFirstPaint(original).replace(SCRIPT_OPEN, () => {
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

const launched = process.argv[1]?.replace(/\\/g, "/") ?? "";
if (
  launched.endsWith("patch-html-for-cloudflare.ts") ||
  launched.endsWith("patch-html-for-cloudflare.js")
) {
  patchHtmlFiles(distDir);
  console.log(
    `Rocket Loader opt-out: tagged ${tags} <script> tags across ${files} HTML files; hydration retry on ${retries} files.`,
  );
}
