import { exit } from 'process';
import type { ReleaseContext } from '../core/types.js';
import { exec, execSafe } from '../utils/exec.js';
import { clack, confirmOrExit, handleCancel, dryRunNote } from '../utils/prompts.js';

/**
 * Check git status and commit changes if needed
 */
export async function checkAndCommit(ctx: ReleaseContext): Promise<void> {
  if (!ctx.config.steps.commitChanges) {
    return;
  }

  let status: string;
  try {
    status = exec('git status --porcelain', true).trim();
  } catch {
    clack.log.error('Failed to check git status');
    clack.outro('Make sure you are in a git repository');
    exit(1);
  }

  if (!status) {
    clack.note('No changes to commit');

    if (ctx.dryRun) {
      dryRunNote('Would prompt to continue with version bump despite no changes');
      return;
    }

    const continueAnyway = await confirmOrExit('No changes detected. Continue with version bump?', {
      initialValue: false,
      cancelMessage: 'Release cancelled',
    });

    if (!continueAnyway) {
      clack.cancel('Release cancelled');
      exit(0);
    }
    return;
  }

  // Show what will be committed
  const statusOutput = execSafe('git status --short');
  if (statusOutput) {
    clack.note(statusOutput, 'Changes to be committed');
  }

  if (ctx.dryRun) {
    dryRunNote('Would prompt for commit message and commit changes');
    return;
  }

  const shouldCommit = await confirmOrExit('Commit these changes?', {
    initialValue: true,
    cancelMessage: 'Release cancelled',
  });

  if (!shouldCommit) {
    clack.cancel('Release cancelled');
    exit(0);
  }

  // Get commit message
  const commitMsg = await clack.text({
    message: 'Commit message:',
    placeholder: 'feat: add new feature',
    validate: (value) => {
      if (!value) return 'Commit message is required';
      return undefined;
    },
  });

  const message = handleCancel(commitMsg, 'Release cancelled');

  // Commit changes with error handling
  try {
    exec('git add .');
    // Escape double quotes in commit message
    const escapedMessage = message.replace(/"/g, '\\"');
    exec(`git commit -m "${escapedMessage}"`);
    clack.log.success('Changes committed');
  } catch (error) {
    clack.log.error('Failed to commit changes');
    clack.log.error(error instanceof Error ? error.message : String(error));
    clack.note(
      'This could happen if:\n' +
        '  - Pre-commit hooks failed\n' +
        '  - Commit message has special characters\n' +
        '  - Working directory has issues',
      'Common causes'
    );
    clack.outro('Fix the issue and try again');
    exit(1);
  }
}
