import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3008,
  },
});
