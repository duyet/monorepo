import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(`news-tab build: ${message}`);
  process.exit(1);
}

const manifestPath = join(root, "manifest.json");
if (!existsSync(manifestPath)) fail("manifest.json missing");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (manifest.manifest_version !== 3) fail("expected Manifest V3");
if (manifest.chrome_url_overrides?.newtab !== "newtab.html") {
  fail("newtab override must be newtab.html");
}
if (!manifest.permissions?.includes("storage")) fail("storage permission");
if (!manifest.host_permissions?.includes("https://news.duyet.net/*")) {
  fail("host_permissions must include https://news.duyet.net/*");
}

const required = [
  "newtab.html",
  "options.html",
  "css/newtab.css",
  "js/api.js",
  "js/settings.js",
  "js/newtab.js",
  "js/options.js",
  "js/i18n.js",
  "js/boot.js",
  "js/settings-panel.js",
  "js/preview-shim.js",
  "icons/icon16.png",
  "icons/icon32.png",
  "icons/icon48.png",
  "icons/icon128.png",
  "icons/icon.svg",
  "_locales/en/messages.json",
  "_locales/vi/messages.json",
];

for (const rel of required) {
  if (!existsSync(join(root, rel))) fail(`missing ${rel}`);
}

if (existsSync(join(root, "wrangler.toml"))) {
  fail("do not add wrangler.toml; this is not a Worker");
}

const stampDir = join(root, "dist");
mkdirSync(stampDir, { recursive: true });
writeFileSync(join(stampDir, ".valid"), "unpacked-ok\n");
console.log("news-tab: unpacked MV3 tree is valid");
