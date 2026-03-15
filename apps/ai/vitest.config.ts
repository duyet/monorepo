import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: [],
    include: ['**/*.test.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules'],
  },
});
