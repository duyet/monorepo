/**
 * JS fallback stub for @duyet/wasm/pkg/utils/utils.js
 * Used by vitest when WASM is not built (e.g., CI test runner).
 */

export function escape_reg_exp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function init(): Promise<Record<string, never>> {
  return {};
}
