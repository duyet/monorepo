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
    "/llms.txt",
    "/llms-full.txt",
    "/sitemap.xml",
    "/robots.txt",
    "/m",
    "/graph",
  ];

  const articlesDir = join(__dirname, "kb", "raw", "kb-content");
  const memoryDir = join(__dirname, "kb", "memory");
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
      try {
        if (statSync(full).isDirectory()) {
          walk(full);
        } else if (extname(entry) === ".md") {
          const slug = basename(entry, ".md");
          if (!slug.startsWith("_")) {
            routes.push(`/k/${slug}`);
          }
        }
      } catch {
        // skip
      }
    }
  }

  // Collect categories from top-level subdirs in articles/
  try {
    for (const entry of readdirSync(articlesDir)) {
      const full = join(articlesDir, entry);
      if (statSync(full).isDirectory()) {
        categories.add(entry);
      }
    }
  } catch {
    // dir may not exist
  }

  walk(articlesDir);

  // Walk memory notes and discover types
  try {
    for (const entry of readdirSync(memoryDir)) {
      const full = join(memoryDir, entry);
      if (statSync(full).isFile() && extname(entry) === ".md") {
        const slug = basename(entry, ".md");
        if (slug.startsWith("_")) continue;
        routes.push(`/m/${slug}`);
      }
    }
  } catch {
    // dir may not exist
  }

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
