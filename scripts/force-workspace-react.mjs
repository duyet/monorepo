/**
 * Pin Node's react / react-dom resolution to the current app's copies.
 * The TanStack prerender host otherwise loads a nested react-dom while the
 * SSR bundle calls a newer react, which crashes prerender and leaves
 * empty HTML shells on Cloudflare Pages.
 *
 * Run from an app directory:
 *   node --import ../../scripts/force-workspace-react.mjs ../../node_modules/vite/bin/vite.js build
 */
import Module from "node:module";
import { createRequire } from "node:module";
import { register } from "node:module";
import { join } from "node:path";

const require = createRequire(join(process.cwd(), "package.json"));
const aliases = new Map();
for (const spec of [
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom",
  "react-dom/client",
  "react-dom/server",
  "react-dom/server.node",
]) {
  try {
    aliases.set(spec, require.resolve(spec));
  } catch {
    // optional export
  }
}

const original = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  const pinned = aliases.get(request);
  if (pinned) return pinned;
  return original.call(this, request, parent, isMain, options);
};

register("./force-workspace-react-loader.mjs", import.meta.url);
