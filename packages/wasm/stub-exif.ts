/**
 * JS fallback stub for @duyet/wasm/pkg/exif/exif.js
 * Used by vitest when WASM is not built (e.g., CI test runner).
 */

export function extract_exif(_data: Uint8Array): string {
  return "null";
}

export function initSync(): Record<string, never> {
  return {};
}

export default async function init(): Promise<Record<string, never>> {
  return {};
}
