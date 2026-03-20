import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    react(),
    ...tailwindcss(),
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
  server: {
    port: 3004,
  },
});
