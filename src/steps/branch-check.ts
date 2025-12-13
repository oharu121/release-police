import { exit } from 'process';
import type { ReleaseContext } from '../core/types.js';
import { exec } from '../utils/exec.js';
import { clack, confirmOrExit, dryRunNote } from '../utils/prompts.js';

/**
 * Check if current branch is allowed for releases
 */
export async function checkBranch(ctx: ReleaseContext): Promise<void> {
  if (!ctx.config.steps.checkBranch) {
    return;
  }

  let currentBranch: string;
  try {
    currentBranch = exec('git branch --show-current', true).trim();
    ctx.currentBranch = currentBranch;
  } catch {
    clack.log.error('Failed to check current branch');
    clack.outro('Make sure you are in a git repository');
    exit(1);
  }

  const { releaseBranches } = ctx.config;

  // Check if current branch matches any allowed pattern
  const isAllowed = releaseBranches.some((pattern) => {
    if (pattern.includes('*')) {
      // Simple glob matching for patterns like 'release/*'
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(currentBranch);
    }
    return pattern === currentBranch;
  });

  if (!isAllowed) {
    clack.log.warn(`You are on branch: ${currentBranch}`);

    clack.note(
      `Releases are typically made from: ${releaseBranches.join(', ')}\n` +
        'Publishing from a feature branch may cause issues.',
      'Warning'
    );

    if (ctx.dryRun) {
      dryRunNote('Prompt user to confirm continuing from non-release branch');
      return;
    }

    const shouldContinue = await confirmOrExit('Continue anyway?', {
      initialValue: false,
      cancelMessage: 'Release cancelled - switch to an allowed branch first',
    });

    if (!shouldContinue) {
      clack.cancel('Release cancelled - switch to an allowed branch first');
      exit(0);
    }
  }
}
