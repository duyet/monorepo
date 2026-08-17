import { readdirSync, statSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Derive all KB routes that must be pre-rendered. */
function getKbRoutes(): string[] {
  const routes: string[] = [
    "/",
    "/about",
    "/c",
    "/c/",
    "/llms.txt",
    "/llms-full.txt",
    "/sitemap.xml",
    "/robots.txt",
    "/m",
    "/search",
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

  // Walk memory notes recursively (notes now live under memory/<topic>/ subdirs)
  function walkMemory(dir: string) {
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
          walkMemory(full);
        } else if (extname(entry) === ".md") {
          const slug = basename(entry, ".md");
          if (slug.startsWith("_") || slug === "index" || slug === "log")
            continue;
          routes.push(`/m/${slug}`);
        }
      } catch {
        // skip
      }
    }
  }
  walkMemory(memoryDir);

  for (const cat of categories) {
    routes.push(`/c/${cat}`);
  }

  return [...new Set(routes)];
}

export default defineConfig({
  base: "/",
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
  build: {
    // Use /static/* (not /assets/*). On 2026-08-10 the duyet.net zone cache
    // poisoned several /assets/* URLs with SPA HTML + long Cache-Control, so
    // module/CSS fetches returned text/html. New path + new hashes escape that.
    assetsDir: "static",
    // Avoid routes ↔ index circular chunks (index dynamic-imports routes while
    // routes static-imports shared runtime from the index chunk). That cycle
    // fails module evaluation on some CDNs/hosts (blank page / MIME errors).
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("sigma") || id.includes("graphology")) return "graph";
          if (
            id.includes("three") ||
            id.includes("3d-force-graph") ||
            id.includes("force-graph") ||
            id.includes("d3-force-3d")
          )
            return "graph3d";
          if (
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("\\react\\") ||
            id.endsWith("/react/index.js")
          ) {
            return "react";
          }
          if (id.includes("@tanstack")) return "tanstack";
        },
      },
    },
  },
  server: {
    port: 3009,
  },
});
