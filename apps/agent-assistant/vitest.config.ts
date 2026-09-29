import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Default stays `node`: `src/` and `lib/` hold server-side and pure-logic
    // suites. Component suites opt into a DOM with a
    // `// @vitest-environment happy-dom` pragma, which is cheaper than making
    // every suite in the app pay for a DOM it does not need.
    environment: "node",
    include: [
      "src/**/*.test.{ts,tsx}",
      "lib/**/*.test.{ts,tsx}",
      // `components/` had no test coverage at all, so nothing under it could be
      // refactored with a rendering proof. The thread component is now
      // covered by a golden-render test.
      "components/**/*.test.{ts,tsx}",
    ],
  },
});
