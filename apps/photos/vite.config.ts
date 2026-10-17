import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * The `/<year>` routes the baked gallery data actually contains.
 *
 * Reads the same `created_at` field `/$year` filters on, so every emitted path
 * is a year the page can actually render instead of 404.
 */
function getYearRoutes(): string[] {
  const dataPath = resolve(__dirname, "public/photos-data.json");
  const photos = JSON.parse(readFileSync(dataPath, "utf-8")) as Array<{
    created_at?: string;
  }>;
  const maxYear = new Date().getFullYear();
  const years = new Set<string>();
  for (const photo of photos) {
    const year = new Date(photo.created_at ?? "").getFullYear();
    // Same bounds as `/$year`'s beforeLoad: outside them the route throws
    // notFound(), and an invalid date yields NaN, which fails both checks.
    if (year >= 2000 && year <= maxYear) years.add(String(year));
  }
  return [...years].sort();
}

export default defineConfig({
  server: { port: 3003 },
  resolve: { dedupe: ["react", "react-dom"] },
  plugins: [
    tanstackStart({
      router: {
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
      // `/$year` is a dynamic route, so TanStack's static-path discovery skips
      // it (`routePath.includes("$")`) and `crawlLinks` cannot rediscover it —
      // the gallery loads photos client-side, so the prerendered `/` is a
      // loading skeleton with no year anchors. Seed the years the baked data
      // contains, the way apps/blog seeds its post routes.
      //
      // `/` and `/feed` are still discovered automatically; listing them here
      // would only duplicate that (and would suppress the `[{ path: "/" }]`
      // default the prerenderer falls back to when this list is empty).
      pages: getYearRoutes().map((year) => ({ path: `/${year}` })),
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
