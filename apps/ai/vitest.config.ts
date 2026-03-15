import { defineConfig } from 'vitest/config';

export default defineConfig({
  css: {
    postcss: {},
  },
  test: {
    environment: 'happy-dom',
    setupFiles: [],
    include: ['**/*.test.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules'],
  },
});
