import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const wasmStub = path.resolve(__dirname, "../wasm/stub.ts");

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@duyet/wasm/pkg/utils/utils.js": wasmStub,
    },
  },
  test: {
    setupFiles: ["./test-setup.tsx"],
    environment: "happy-dom",
    include: ["__tests__/**/*.test.{ts,tsx}"],
  },
});
