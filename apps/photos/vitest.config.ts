import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    setupFiles: ["./test-setup.ts"],
    environment: "happy-dom",
    include: ["**/*.test.{ts,tsx}"],
  },
});
