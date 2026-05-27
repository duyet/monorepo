import { readdirSync, statSync } from "node:fs";
import { basename, extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Derive all KB routes that must be pre-rendered. */
function getKbRoutes(): string[] {
  const routes: string[] = [
    "/",
    "/c",
    "/c/",
    "/graph",
    "/llms.txt",
    "/llms-full.txt",
    "/sitemap.xml",
    "/robots.txt",
  ];

  const contentDir = join(__dirname, "content");
  const categories = new Set<string>();

  function walk(dir: string) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (extname(entry) === ".md") {
        const slug = basename(entry, ".md");
        routes.push(`/k/${slug}`);
      }
    }
  }

  // Collect categories from top-level subdirs in content/
  try {
    for (const entry of readdirSync(contentDir)) {
      const full = join(contentDir, entry);
      if (statSync(full).isDirectory()) {
        categories.add(entry);
      }
    }
  } catch {
    // content dir may not exist yet
  }

  walk(contentDir);

  for (const cat of categories) {
    routes.push(`/c/${cat}`);
  }

  return [...new Set(routes)];
}

export default defineConfig({
  plugins: [
    tanstackStart({
      router: {
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
      prerender: {
        enabled: true,
        routes: getKbRoutes(),
        crawlLinks: true,
        failOnError: false,
      },
    }),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    port: 3009,
  },
});
