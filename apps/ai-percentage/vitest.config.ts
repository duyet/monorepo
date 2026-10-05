import { defineConfig } from "vitest/config";

// Unit tests run in plain Node — no need to load the TanStack Start
// plugin stack from vite.config.ts.
export default defineConfig({ test: { environment: "node" } });
