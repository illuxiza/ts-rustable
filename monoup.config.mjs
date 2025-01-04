import { defineConfig } from 'monoup';

export default defineConfig({
  name: 'rustable',
  monorepo: true,
  sourcemap: false,
  production: true,

  build: {
    mainEntry: 'index.ts',
    packageEntry: 'index.ts',

    typescript: {
      enabled: true, 
      declaration: true,
      removeComments: false,
    },

    baseExternals: ['path', 'fs', 'tslib'],
  },
});
