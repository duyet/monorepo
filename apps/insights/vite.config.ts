import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const PRERENDER_ROUTES = [
  "/",
  "/agents",
  "/blog",
  "/blog/7",
  "/blog/30",
  "/blog/365",
  "/blog/all",
  "/github",
  "/github/7",
  "/github/30",
  "/github/365",
  "/github/all",
  "/wakatime",
  "/wakatime/7",
  "/wakatime/30",
  "/wakatime/365",
  "/wakatime/all",
  "/ai",
  "/ai/7",
  "/ai/30",
  "/ai/365",
  "/ai/all",
  "/compare/ai/30/7",
  "/compare/ai/365/30",
  "/compare/ai/365/7",
  "/compare/ai/all/365",
  "/compare/ai/all/30",
  "/compare/wakatime/30/7",
  "/compare/wakatime/365/30",
  "/compare/wakatime/365/7",
  "/compare/wakatime/all/365",
  "/compare/wakatime/all/30",
];

export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
      pages: PRERENDER_ROUTES.map((path) => ({
        path,
        prerender: { enabled: true },
      })),
    }),
  ],
});
