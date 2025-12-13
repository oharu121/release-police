import { exit } from 'process';
import type { ReleaseContext } from '../core/types.js';
import { exec } from '../utils/exec.js';
import { clack, confirmOrExit, dryRunNote } from '../utils/prompts.js';

/**
 * Push changes and tags to remote
 */
export async function pushToRemote(ctx: ReleaseContext): Promise<void> {
  if (!ctx.config.steps.push) {
    return;
  }

  if (ctx.dryRun) {
    dryRunNote('Would prompt to push to remote');
    dryRunNote('Would run: git push && git push --tags');
    return;
  }

  const shouldPush = await confirmOrExit('Push to remote? (triggers CD workflow)', {
    initialValue: true,
    cancelMessage: 'Release cancelled',
  });

  if (!shouldPush) {
    clack.note(
      'Version bumped locally. Push manually when ready:\n  git push && git push --tags',
      'Manual push required'
    );
    clack.outro('Release prepared');
    exit(0);
  }

  const s = clack.spinner();
  s.start('Pushing to remote...');

  try {
    exec('git push && git push --tags');
    s.stop('Pushed to remote');
  } catch (error) {
    s.stop('Push failed');
    clack.log.error(error instanceof Error ? error.message : String(error));
    clack.note(
      'This could happen if:\n' +
        '  - Network connection issues\n' +
        '  - No upstream branch configured\n' +
        '  - Remote rejected push (conflicts)\n' +
        '\n' +
        'Your version was bumped locally. Push manually:\n' +
        '  git push && git push --tags',
      'Common causes'
    );
    clack.outro('Push manually to complete release');
    exit(1);
  }
}
