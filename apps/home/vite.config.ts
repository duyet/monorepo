import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({
  server: { port: 3001 },
  // Native tsconfig `paths` resolution (replaces the vite-tsconfig-paths plugin).
  resolve: { tsconfigPaths: true },
  build: {
    rolldownOptions: {
      output: {
        // Keep client output as a single bundle to avoid runtime dynamic chunk loads.
        codeSplitting: false,
      },
    },
  },
  plugins: [
    tanstackStart({
      router: {
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: false,
      },
    }),
    // Required by TanStack Start dev mode for the React Refresh runtime.
    viteReact(),
    tailwindcss(),
    {
      name: "wasm-external",
      enforce: "pre",
      resolveId(source: string) {
        if (source.startsWith("@duyet/wasm/pkg/")) {
          return { id: source, external: true };
        }
      },
    },
  ],
});
