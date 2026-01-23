import { exit } from 'process';
import type { ReleaseContext } from '../core/types.js';
import { exec } from '../utils/exec.js';
import { clack, dryRunNote } from '../utils/prompts.js';

/**
 * Run deploy command after push
 */
export function deploy(ctx: ReleaseContext): void {
  if (!ctx.config.steps.deploy) {
    return;
  }

  const { deploy: deployCommand } = ctx.config.commands;

  if (!deployCommand) {
    clack.log.info('Deploy command not configured, skipping');
    return;
  }

  if (ctx.dryRun) {
    dryRunNote(`Deploy: ${deployCommand}`);
    return;
  }

  const s = clack.spinner();
  s.start('Deploying...');
  try {
    exec(deployCommand);
    s.stop('Deployment complete');
  } catch (error) {
    s.stop('Deployment failed');
    clack.log.error(error instanceof Error ? error.message : String(error));
    clack.outro('Deployment failed');
    exit(1);
  }
}
