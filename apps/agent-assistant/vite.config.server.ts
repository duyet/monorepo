import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";

// Server-only build for the Cloudflare Workers entry point.
// The main vite.config.ts handles the client build; this config builds
// dist/server/server.js (the wrangler main module) via the TanStack Start
// plugin, which resolves the virtual modules (tanstack-start-manifest:v,
// etc.) that esbuild cannot handle.
//
// `server.entry` must be the file whose exports reach the Worker entrypoint —
// wrangler requires Durable Object classes to be exported from the main
// module, so entry-server.tsx exports both the fetch handler and
// ThreadStateDO. Build outDir/externals live under environments.ssr.build
// (the legacy top-level build.ssr bypasses the plugin's environment plan).
export default defineConfig({
  plugins: [
    tanstackStart({
      router: {
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
      server: {
        entry: "entry-server.tsx",
      },
    }),
    tailwindcss(),
  ],
  environments: {
    ssr: {
      build: {
        outDir: "dist/server",
        rollupOptions: {
          external: ["cloudflare:workers", "vinxi/http"],
          output: {
            // wrangler.toml main = dist/server/server.js. Keep the SSR bundle
            // single-module: split dynamic chunks hang when workerd resolves
            // them at serve time and break `wrangler dev` interop.
            entryFileNames: "server.js",
            inlineDynamicImports: true,
          },
        },
      },
    },
  },
});
