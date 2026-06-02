import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ["./test-setup.tsx"],
    environment: "happy-dom",
    include: ["__tests__/**/*.test.{ts,tsx}"],
  },
});
