import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  server: { port: 3004 },
  plugins: [
    tanstackStart({
      router: {
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
      prerender: {
        enabled: true,
        crawlLinks: false,
        failOnError: false,
      },
    }),
    tailwindcss(),
    tsconfigPaths(),
    {
      name: "wasm-external",
      enforce: "pre",
      resolveId(source: string) {
        if (source.startsWith("@duyet/wasm/pkg/")) {
          return { id: source, external: true };
        }
      },
    },
    {
      name: "spa-route-prerender",
      closeBundle() {
        const outDir = join(process.cwd(), "dist");
        const analyticsDir = join(outDir, "analytics");
        try {
          mkdirSync(analyticsDir, { recursive: true });
          copyFileSync(
            join(outDir, "index.html"),
            join(analyticsDir, "index.html")
          );
        } catch (err: unknown) {
          // Only ignore "file not found" errors that occur in non-build contexts
          if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": process.cwd(),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
