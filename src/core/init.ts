import { existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { clack } from '../utils/prompts.js';

const CONFIG_TEMPLATE = `import { defineConfig } from 'release-police';

export default defineConfig({
  // Branches that allow releases
  releaseBranches: ['main', 'master'],

  // Commands to run during release
  commands: {
    install: 'npm install',    // Run after pulling changes
    typecheck: null,           // Optional: run type checking
    lint: null,                // Optional: run linter
    test: 'npm run test',      // Set to null to skip
    build: null,               // Optional: run before version bump
    changelog: null,           // Optional: generate changelog
    deploy: null,              // Optional: run after push
  },

  // Git settings
  git: {
    pullStrategy: 'rebase',        // 'rebase' | 'merge' | 'ff-only'
    requireCleanWorkingDir: true,
  },

  // GitHub integration (optional)
  github: {
    release: false,        // Create GitHub release after push
    draft: true,           // Create as draft (recommended)
    generateNotes: true,   // Auto-generate release notes
  },

  // Enable/disable steps
  steps: {
    checkBranch: true,
    syncRemote: true,
    runChecks: true,       // Runs typecheck, lint, test in order
    commitChanges: true,
    versionBump: true,
    push: true,
    deploy: false,         // Enable to run deploy command
    githubRelease: false,
  },
});
`;

/**
 * Initialize a release.config.ts file in the current directory
 */
export async function initConfig(): Promise<void> {
  const cwd = process.cwd();
  const configPath = resolve(cwd, 'release.config.ts');

  if (existsSync(configPath)) {
    clack.log.warn('release.config.ts already exists');
    clack.note('Delete the existing file first if you want to regenerate it.', 'File exists');
    process.exit(1);
  }

  writeFileSync(configPath, CONFIG_TEMPLATE, 'utf-8');
  clack.log.success('Created release.config.ts');
  clack.note(
    'Edit the config file to customize your release workflow.\n' +
      'Run `npx release-police --dry-run` to preview.',
    'Next steps'
  );
}
