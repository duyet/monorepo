import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const wasmStub = path.resolve(__dirname, "../wasm/stub.ts");

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@duyet/wasm/pkg/utils/utils.js": wasmStub,
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  test: {
    setupFiles: ["./test-setup.tsx"],
    environment: "happy-dom",
    include: ["__tests__/**/*.test.{ts,tsx}"],
  },
});
