import { exit } from 'process';
import type { ReleaseContext } from '../core/types.js';
import { exec, execSafe } from '../utils/exec.js';
import { clack, confirmOrExit, dryRunNote } from '../utils/prompts.js';

/**
 * Sync with remote - fetch, check if behind, pull if needed
 */
export async function syncRemote(ctx: ReleaseContext): Promise<void> {
  if (!ctx.config.steps.syncRemote) {
    return;
  }

  const s1 = clack.spinner();
  s1.start('Checking remote status...');

  try {
    // Fetch latest from remote without merging
    exec('git fetch', true);

    // Check if remote is ahead of local
    // Use cross-platform approach
    const behindOutput = execSafe('git rev-list --count HEAD..@{u}');
    const behind = behindOutput?.trim() ?? '0';

    if (behind !== '0' && behind !== '') {
      s1.stop('Remote has new commits');

      clack.note(
        `Remote has ${behind} commit(s) you don't have locally.\n` +
          'This is likely from Dependabot or another developer.',
        'Remote ahead'
      );

      if (ctx.dryRun) {
        dryRunNote('Would prompt to pull latest changes');
        dryRunNote(`Would pull with strategy: ${ctx.config.git.pullStrategy}`);
        return;
      }

      const shouldPull = await confirmOrExit('Pull latest changes before continuing?', {
        initialValue: true,
        cancelMessage: 'Release cancelled - pull changes first',
      });

      if (!shouldPull) {
        clack.cancel('Release cancelled - pull changes first');
        exit(0);
      }

      // Check for uncommitted changes before pulling
      await handleUncommittedChanges(ctx);

      // Safe to pull now
      await pullChanges(ctx);
    } else {
      s1.stop('Up to date with remote');
    }
  } catch {
    s1.stop('Could not check remote status');
    clack.log.warn('Proceeding anyway...');
  }
}

async function handleUncommittedChanges(ctx: ReleaseContext): Promise<void> {
  const status = execSafe('git status --porcelain')?.trim();

  if (!status) {
    return;
  }

  clack.log.warn('You have uncommitted changes');

  const statusOutput = execSafe('git status --short');
  if (statusOutput) {
    clack.note(statusOutput, 'Uncommitted changes');
  }

  if (ctx.dryRun) {
    dryRunNote('Would prompt to commit changes before pulling');
    return;
  }

  const shouldCommitFirst = await confirmOrExit('Commit changes before pulling? (recommended)', {
    initialValue: true,
    cancelMessage: 'Release cancelled - commit or stash your changes first',
  });

  if (!shouldCommitFirst) {
    clack.cancel('Release cancelled - commit or stash your changes first');
    exit(0);
  }

  // Commit the changes
  try {
    exec('git add .');
    exec('git commit -m "WIP: save changes before pulling remote updates"');
    clack.log.success('Changes committed');
  } catch (error) {
    clack.log.error('Failed to commit changes');
    clack.log.error(error instanceof Error ? error.message : String(error));
    clack.outro('Fix the issue and try again');
    exit(1);
  }
}

async function pullChanges(ctx: ReleaseContext): Promise<void> {
  const s = clack.spinner();
  s.start('Pulling latest changes...');

  try {
    const { pullStrategy } = ctx.config.git;
    const pullCommand =
      pullStrategy === 'rebase'
        ? 'git pull --rebase'
        : pullStrategy === 'ff-only'
          ? 'git pull --ff-only'
          : 'git pull';

    exec(pullCommand, true);

    // Run install command if configured
    const { install } = ctx.config.commands;
    if (install) {
      exec(install, true);
    }

    s.stop('Pulled and synced successfully');
  } catch (error) {
    s.stop('Pull failed');
    clack.log.error(error instanceof Error ? error.message : String(error));
    clack.outro('Fix conflicts and try again');
    exit(1);
  }
}
