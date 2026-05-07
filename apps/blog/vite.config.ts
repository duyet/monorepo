import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function getPostRoutes(): string[] {
  const dataPath = resolve(__dirname, "public/posts-data.json");
  const posts = JSON.parse(readFileSync(dataPath, "utf-8")) as Array<{
    slug: string;
  }>;
  return posts.map((p) => p.slug.replace(/\.html$/, ""));
}

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
        routes: getPostRoutes(),
        crawlLinks: true,
        failOnError: false,
      },
    }),
    tailwindcss(),
    tsconfigPaths(),
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
