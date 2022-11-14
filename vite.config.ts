import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      enabled: true,
      include: ['src/**/*.{ts,tsx}'],
      '100': true,
    },
  },
});
