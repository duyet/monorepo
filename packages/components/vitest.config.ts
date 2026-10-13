import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const wasmStub = path.resolve(__dirname, "../wasm/stub.ts");

export default defineConfig({
  plugins: [tsconfigPaths()],
  // Test-only Clerk key so AuthButtons renders its Clerk-backed branches.
  // `test.env` only reaches the test file's import.meta.env; source modules
  // get a statically replaced one, so it has to be a compile-time define.
  define: {
    "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
      "pk_test_components"
    ),
  },
  resolve: {
    dedupe: ["react", "react-dom"],
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
