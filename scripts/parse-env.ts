import { existsSync, readFileSync } from "node:fs";

/**
 * Minimal `.env` reader shared by the deploy tooling.
 *
 * Three scripts parsed dotenv files independently (`cf-deploy.ts`,
 * `cf-deploy-prod.ts`, `sync-app-secrets.ts`) and the copies had already
 * drifted in variable naming. They now share this module so a quoting or
 * comment-handling fix lands in all three at once.
 *
 * Deliberately not a full dotenv implementation: no `export` prefix, no
 * variable expansion, no `KEY=`-only overrides beyond what the callers
 * already relied on.
 */
export function parseEnvContent(content: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Remove quotes if present. A bare single `"` or `'` is also stripped
    // (it matches both startsWith and endsWith); the previous copies did the
    // same, so this quirk is preserved rather than "fixed" mid-deploy.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

/** Parse an `.env` file, treating a missing file as empty. */
export function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  return parseEnvContent(readFileSync(filePath, "utf-8"));
}
