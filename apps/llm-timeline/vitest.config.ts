import path from "node:path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const wasmStub = path.resolve(__dirname, "../../packages/wasm/stub.ts");

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@duyet/wasm/pkg/utils/utils.js": wasmStub,
      // App-local bun links still point at react@19.2.4; RTL uses the
      // workspace 19.2.8 copy. Pin both to the same root copies.
      react: path.resolve(__dirname, "../../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
    },
  },
  test: {
    setupFiles: ["./test-setup.ts"],
    environment: "happy-dom",
    include: ["**/*.test.{ts,tsx}"],
  },
});
