import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
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
