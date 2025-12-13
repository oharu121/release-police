import { defineConfig } from 'tsup';

export default defineConfig([
  // Library build
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
  },
  // CLI build
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
