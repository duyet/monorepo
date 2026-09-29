import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Shared `wrangler.toml` reading for the deploy tooling.
 *
 * Both the app-discovery path (`cf-pages-apps.ts`) and the per-app production
 * deploy (`cf-deploy-prod.ts`) need `pages_build_output_dir` out of
 * `wrangler.toml`, and they had two separate regexes for it. They now share
 * these, anchored to the start of a line so a commented-out or indented
 * assignment cannot be mistaken for the real one.
 *
 * Kept dependency-free on purpose: `cf-deploy-prod.ts` runs on the production
 * deploy path (via `pnpm exec tsx`) and must not pull in the app registry or
 * any workspace alias.
 */

/** First value of a top-level string key in a TOML file, if present. */
export function firstTomlString(
  content: string,
  key: string
): string | undefined {
  return content.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, "m"))?.[1];
}

/** `pages_build_output_dir` for an app directory, or undefined if not a Pages app. */
export function readPagesOutputDir(appDir: string): string | undefined {
  const wranglerPath = join(appDir, "wrangler.toml");
  if (!existsSync(wranglerPath)) return undefined;
  return firstTomlString(
    readFileSync(wranglerPath, "utf-8"),
    "pages_build_output_dir"
  );
}

/** True when an app's `wrangler.toml` marks it as a Cloudflare Pages project. */
export function isPagesProject(appDir: string): boolean {
  return readPagesOutputDir(appDir) !== undefined;
}
