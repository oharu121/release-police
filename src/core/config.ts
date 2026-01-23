import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import type { ReleaseConfig, ResolvedConfig } from './types.js';

const CONFIG_FILES = ['release.config.ts', 'release.config.js', 'release.config.mjs'];

const DEFAULT_CONFIG: ResolvedConfig = {
  releaseBranches: ['main', 'master'],
  commands: {
    test: 'npm run test',
    install: 'npm install',
    build: null,
    changelog: null,
    typecheck: null,
    lint: null,
    deploy: null,
  },
  git: {
    pullStrategy: 'rebase',
    requireCleanWorkingDir: true,
  },
  github: {
    release: false,
    draft: true,
    generateNotes: true,
  },
  steps: {
    checkBranch: true,
    syncRemote: true,
    runChecks: true,
    runTests: true, // @deprecated - kept for backward compatibility
    commitChanges: true,
    versionBump: true,
    push: true,
    deploy: false,
    githubRelease: false,
  },
};

/**
 * Load config from file or package.json
 */
export async function loadConfig(configPath?: string): Promise<ResolvedConfig> {
  const cwd = process.cwd();

  // If explicit config path provided, use it
  if (configPath) {
    const fullPath = resolve(cwd, configPath);
    if (!existsSync(fullPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }
    const userConfig = await loadConfigFile(fullPath);
    return mergeConfig(userConfig);
  }

  // Try to find config file
  for (const filename of CONFIG_FILES) {
    const fullPath = resolve(cwd, filename);
    if (existsSync(fullPath)) {
      const userConfig = await loadConfigFile(fullPath);
      return mergeConfig(userConfig);
    }
  }

  // Try package.json
  const pkgPath = resolve(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      if (pkg.releasePolice) {
        return mergeConfig(pkg.releasePolice);
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Return defaults
  return DEFAULT_CONFIG;
}

/**
 * Load a config file using jiti for TypeScript support
 */
async function loadConfigFile(filepath: string): Promise<ReleaseConfig> {
  try {
    // Dynamic import for JS/MJS files
    if (filepath.endsWith('.js') || filepath.endsWith('.mjs')) {
      const module = await import(`file://${filepath}`);
      return module.default ?? module;
    }

    // For TypeScript files, use jiti
    const { createJiti } = await import('jiti');
    const jiti = createJiti(import.meta.url);
    const module = await jiti.import(filepath);
    return (module as { default?: ReleaseConfig }).default ?? (module as ReleaseConfig);
  } catch (error) {
    throw new Error(
      `Failed to load config from ${filepath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Merge user config with defaults
 */
function mergeConfig(userConfig: ReleaseConfig): ResolvedConfig {
  // Handle backward compatibility: runTests → runChecks
  const steps = {
    ...DEFAULT_CONFIG.steps,
    ...userConfig.steps,
  };

  // If user specified runTests but not runChecks, use runTests value
  if (userConfig.steps?.runTests !== undefined && userConfig.steps?.runChecks === undefined) {
    steps.runChecks = userConfig.steps.runTests;
  }

  return {
    releaseBranches: userConfig.releaseBranches ?? DEFAULT_CONFIG.releaseBranches,
    commands: {
      ...DEFAULT_CONFIG.commands,
      ...userConfig.commands,
    },
    git: {
      ...DEFAULT_CONFIG.git,
      ...userConfig.git,
    },
    github: {
      ...DEFAULT_CONFIG.github,
      ...userConfig.github,
    },
    steps,
  };
}

/**
 * Helper function for users to define config with type safety
 */
export function defineConfig(config: ReleaseConfig): ReleaseConfig {
  return config;
}
