/**
 * Postbuild script: opt every first-party <script> tag out of Cloudflare
 * Rocket Loader by adding `data-cfasync="false"`.
 *
 * Why: Cloudflare Rocket Loader rewrites `type="module"` to
 * `type="<hash>-module"` on the TanStack Start hydration entry. That MIME
 * type is dead — the browser won't run it as a module and Rocket Loader's
 * own re-executor only handles its `-text/javascript` tags. The result is a
 * page that renders (static SSG HTML) but never hydrates, so every button is
 * frozen. `data-cfasync="false"` is Cloudflare's documented opt-out: tagged
 * scripts are left untouched and run natively, in document order.
 *
 * All <script> tags in dist/client are first-party (Cloudflare injects its
 * own scripts at the edge, not into our static files), so tagging all of them
 * is safe and preserves the inline-bootstrap → module execution order.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CLIENT_DIR = join(import.meta.dir, "..", "dist", "client");

// Match a real <script> open tag that is not already opted out.
const SCRIPT_OPEN = /<script\b(?![^>]*\sdata-cfasync=)/g;

function* htmlFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) yield full;
  }
}

let files = 0;
let tags = 0;

for (const file of htmlFiles(CLIENT_DIR)) {
  const html = readFileSync(file, "utf8");
  let count = 0;
  const next = html.replace(SCRIPT_OPEN, () => {
    count += 1;
    return '<script data-cfasync="false"';
  });
  if (count > 0) {
    writeFileSync(file, next);
    files += 1;
    tags += count;
  }
}

console.log(
  `Rocket Loader opt-out: tagged ${tags} <script> tags across ${files} HTML files.`,
);
