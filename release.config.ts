import { defineConfig } from './dist/index.js';

export default defineConfig({
  commands: {
    typecheck: 'npm run typecheck',
    lint: 'npm run lint',
    test: 'npm run test',
    build: 'npm run build',
  },
});
