/**
 * Pin Node's react / react-dom resolution to the workspace copies.
 * The TanStack prerender host otherwise loads a nested react-dom@19.2.4
 * while the SSR bundle calls react@19.2.8 hooks, which crashes prerender.
 */
import Module from "node:module";
import { createRequire } from "node:module";
import { register } from "node:module";

const require = createRequire(import.meta.url);
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
