import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["worker/**/*.test.ts", "src/**/*.test.ts"],
    environment: "node",
  },
});
