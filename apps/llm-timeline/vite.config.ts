import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Static pages to prerender — year range 2017–2026
const yearPages = Array.from({ length: 10 }, (_, i) => ({
  path: `/year/${2017 + i}`,
}));

export default defineConfig({
  server: { port: 3005 },
  build: {
    outDir: ".output",
  },
  environments: {
    client: {
      build: {
        outDir: ".output/public",
      },
    },
    ssr: {
      build: {
        outDir: ".output/server",
      },
    },
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      pages: [
        { path: "/" },
        { path: "/compare" },
        { path: "/lite" },
        { path: "/open" },
        { path: "/org" },
        { path: "/license/open" },
        { path: "/license/closed" },
        { path: "/license/partial" },
        ...yearPages,
      ],
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
        failOnError: false,
      },
      sitemap: {
        enabled: true,
        host: "https://llm-timeline.duyet.net",
      },
    }),
    viteReact(),
  ],
});
