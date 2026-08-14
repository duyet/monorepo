import { fileURLToPath } from "node:url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    alias: {
      // @duyet/components/styles.css imports this; the package is not
      // installed on this branch yet.
      "shadcn/tailwind.css": fileURLToPath(
        new URL("./src/empty-shadcn-tailwind.css", import.meta.url),
      ),
    },
  },
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
  ],
  server: {
    port: 3011,
  },
});
