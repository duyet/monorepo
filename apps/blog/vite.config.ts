import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: 3000 },
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
      pages: [{ path: "/" }],
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
        failOnError: false,
      },
      sitemap: {
        enabled: true,
        host: "https://blog.duyet.net",
      },
    }),
    viteReact(),
  ],
});
