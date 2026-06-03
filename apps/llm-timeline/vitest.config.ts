import path from "node:path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const wasmStub = path.resolve(__dirname, "../../packages/wasm/stub.ts");

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@duyet/wasm/pkg/utils/utils.js": wasmStub,
    },
  },
  test: {
    setupFiles: ["./test-setup.ts"],
    environment: "happy-dom",
    include: ["**/*.test.{ts,tsx}"],
  },
});
