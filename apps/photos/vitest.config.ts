import path from "node:path";
import { defineConfig } from "vitest/config";

const exifStub = path.resolve(__dirname, "../../packages/wasm/stub-exif.ts");

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // WASM bindings are a build artifact; tests stub them out.
      "@duyet/wasm/pkg/exif/exif.js": exifStub,
    },
  },
  test: {
    setupFiles: ["./test-setup.ts"],
    environment: "happy-dom",
    include: ["**/*.test.{ts,tsx}"],
  },
});
