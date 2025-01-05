import { defineConfig } from 'monoup';

export default defineConfig({
  monorepo: true,
  sourcemap: false,

  build: {
    main: true,
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
