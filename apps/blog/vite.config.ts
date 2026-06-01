import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function getPostRoutes(): string[] {
  const dataPath = resolve(__dirname, "public/posts-data.json");
  const posts = JSON.parse(readFileSync(dataPath, "utf-8")) as Array<{
    slug: string;
  }>;
  return posts.map((p) => p.slug.replace(/\.html$/, ""));
}

export default defineConfig({
  server: { port: 3000 },
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
        routes: getPostRoutes(),
        crawlLinks: true,
        failOnError: false,
      },
    }),
    // Required by TanStack Start dev mode for the React Refresh runtime.
    viteReact(),
    tailwindcss(),
    {
      name: "wasm-resolve",
      enforce: "pre",
      resolveId(source: string) {
        if (source.startsWith("@duyet/wasm/pkg/")) {
          const relPath = source.replace("@duyet/wasm/", "");
          return resolve(__dirname, "../../packages/wasm", relPath);
        }
      },
    },
  ],
});
