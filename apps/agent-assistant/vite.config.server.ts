import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";

// Server-only build for the Cloudflare Workers entry point.
// The main vite.config.ts handles the client build; this config builds
// dist/server/server.js (the worker entry) via the TanStack Start plugin,
// which resolves the virtual modules (tanstack-start-manifest:v, etc.)
// that esbuild cannot handle.

export default defineConfig({
  plugins: [
    tanstackStart({
      router: {
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
      server: {
        output: "dist/server/server.js",
      },
    }),
    tailwindcss(),
  ],
  build: {
    ssr: true,
    outDir: "dist/server",
    rollupOptions: {
      input: "src/entry-server.tsx",
      external: ["cloudflare:workers", "vinxi/http"],
    },
  },
});
