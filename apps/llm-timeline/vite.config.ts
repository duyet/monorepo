import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { LICENSES } from "./lib/og";
export default defineConfig({
  server: { port: 3005 },
  resolve: { dedupe: ["react", "react-dom"] },
  plugins: [
    tanstackStart({
      router: {
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
      // `license/$type` is a dynamic route, so TanStack's static-path
      // discovery skips it (`routePath.includes("$")`). `crawlLinks` only
      // reaches these pages through `/open`, which redirects to
      // `/license/open`, and the prerenderer then writes the destination's
      // HTML under the source path, leaving `dist/license/<type>/` with no
      // index.html. Seed the license pages explicitly so each unfurls with
      // its own og:url instead of the homepage's.
      pages: LICENSES.map((type) => ({ path: `/license/${type}` })),
      prerender: {
        enabled: true,
        crawlLinks: true,
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
  ],
});
