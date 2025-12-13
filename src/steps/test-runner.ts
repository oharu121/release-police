import { exit } from 'process';
import type { ReleaseContext } from '../core/types.js';
import { exec } from '../utils/exec.js';
import { clack, dryRunNote } from '../utils/prompts.js';

/**
 * Run test command
 */
export async function runTests(ctx: ReleaseContext): Promise<void> {
  if (!ctx.config.steps.runTests) {
    return;
  }

  const { test } = ctx.config.commands;

  if (!test) {
    clack.log.info('Test command not configured, skipping');
    return;
  }

  if (ctx.dryRun) {
    dryRunNote(`Run tests: ${test}`);
    return;
  }

  const s = clack.spinner();
  s.start('Running tests...');

  try {
    exec(test);
    s.stop('All tests passed');
  } catch (error) {
    s.stop('Tests failed');
    clack.log.error(error instanceof Error ? error.message : String(error));
    clack.outro('Fix the tests and try again');
    exit(1);
  }
}
