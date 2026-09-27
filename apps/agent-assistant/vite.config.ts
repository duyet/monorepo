import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Cloudflare Workers build is handled by `wrangler deploy` directly.
// The @cloudflare/vite-plugin is intentionally omitted here because it
// requires dist/server/server.js to exist before the Vite build completes.

export default defineConfig({
  plugins: [
    tanstackStart({
      router: {
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
    }),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      external: ["cloudflare:workers", "vinxi/http"],
    },
  },
  server: {
    port: 3004,
    strictPort: true,
  },
});
