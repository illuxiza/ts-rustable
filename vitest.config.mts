import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/test/**/*.test.ts'],
    globals: true,
    alias: {
      '@rustable/commons': resolve(__dirname, './packages/commons/src'),
      '@rustable/utils': resolve(__dirname, './packages/utils/src'),
      '@rustable/enum': resolve(__dirname, './packages/enum/src'),
      '@rustable/iter': resolve(__dirname, './packages/iter/src'),
      '@rustable/trait': resolve(__dirname, './packages/trait/src'),
    },
  },
});
