import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({
  server: { port: 3001 },
  build: {
    rollupOptions: {
      output: {
        // Keep lucide in one chunk. Per-icon chunks mean every new icon adds a
        // new hashed URL, and any asset URL that 404s during a deploy rollout
        // gets the SPA fallback HTML cached against it under the immutable
        // /assets/* rule in public/_headers.
        manualChunks(id: string) {
          if (id.includes("node_modules/lucide-react")) return "icons";
        },
      },
    },
  },
  // Native tsconfig `paths` resolution (replaces the vite-tsconfig-paths plugin).
  resolve: { tsconfigPaths: true },
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
