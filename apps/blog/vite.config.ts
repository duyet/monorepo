import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: 3000 },
  define: {
    "process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "undefined",
    "process.env.NEXT_PUBLIC_MEASUREMENT_ID": "undefined",
    "process.env.NEXT_PUBLIC_POSTHOG_KEY": "undefined",
    "process.env.NEXT_PUBLIC_SELINE_TOKEN": "undefined",
    "process.env.NEXT_PUBLIC_DUYET_API_URL": "undefined",
    "process.env.NEXT_PUBLIC_API_BASE_URL": "undefined",
  },
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    tsconfigPaths(),
    viteReact(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
