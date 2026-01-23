import type { CliOptions, ReleaseContext, ResolvedConfig } from './types.js';
import { loadConfig } from './config.js';
import { clack } from '../utils/prompts.js';
import {
  checkBranch,
  syncRemote,
  runChecks,
  checkAndCommit,
  bumpVersion,
  pushToRemote,
  deploy,
  createGithubRelease,
} from '../steps/index.js';

/**
 * Main release workflow runner
 */
export async function runRelease(cliOptions: CliOptions = {}): Promise<void> {
  console.clear();

  clack.intro('Release Police');

  if (cliOptions.dryRun) {
    clack.note('No changes will be made', 'DRY RUN MODE');
  } else {
    clack.note('Press Ctrl+C at any time to cancel', 'Tip');
  }

  // Load config
  let config: ResolvedConfig;
  try {
    config = await loadConfig(cliOptions.config);
  } catch (error) {
    clack.log.error(`Failed to load config: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // Apply CLI overrides to steps
  if (cliOptions.skipTests || cliOptions.skipChecks) {
    config.steps.runChecks = false;
  }
  if (cliOptions.skipDeploy) {
    config.steps.deploy = false;
  }
  if (cliOptions.skipSync) {
    config.steps.syncRemote = false;
  }
  if (cliOptions.skipPush) {
    config.steps.push = false;
  }
  if (cliOptions.githubRelease) {
    config.steps.githubRelease = true;
    config.github.release = true;
  }

  // Create context
  const ctx: ReleaseContext = {
    config,
    cliOptions,
    dryRun: cliOptions.dryRun ?? false,
  };

  // Run release steps
  await checkBranch(ctx);
  await syncRemote(ctx);
  runChecks(ctx);
  await checkAndCommit(ctx);
  await bumpVersion(ctx);
  await pushToRemote(ctx);
  deploy(ctx);
  await createGithubRelease(ctx);

  if (ctx.dryRun) {
    clack.outro('Dry run complete - no changes were made');
  } else {
    clack.outro('Release complete!');
  }
}
