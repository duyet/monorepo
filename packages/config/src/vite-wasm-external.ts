/**
 * Vite plugin that externalizes all @duyet/wasm/pkg/* imports.
 *
 * WASM modules are gitignored and built locally. CI deploys don't include
 * them, so the bundler must skip resolution. WASM is loaded at runtime
 * via dynamic import() in the consuming code.
 */
export function wasmExternal() {
  return {
    name: "wasm-external",
    enforce: "pre" as const,
    resolveId(source: string) {
      if (source.startsWith("@duyet/wasm/pkg/")) {
        return { id: source, external: true };
      }
    },
  };
}
