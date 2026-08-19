import path from "node:path";
import { defineConfig } from "vitest/config";

const wasmStub = path.resolve(__dirname, "../../packages/wasm/stub.ts");

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    tsconfigPaths: true,
    alias: {
      "@duyet/wasm/pkg/utils/utils.js": wasmStub,
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
