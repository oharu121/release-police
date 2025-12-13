/**
 * release-police
 * Interactive release workflow with configurable steps
 */

// Main exports for programmatic usage
export { defineConfig, runRelease, loadConfig } from './core/index.js';

// Type exports
export type {
  ReleaseConfig,
  ResolvedConfig,
  CliOptions,
  ReleaseContext,
  CommandsConfig,
  GitConfig,
  StepsConfig,
  PullStrategy,
  VersionType,
} from './core/index.js';
