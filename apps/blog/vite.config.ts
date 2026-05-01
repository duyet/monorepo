import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  server: { port: 3000 },
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
