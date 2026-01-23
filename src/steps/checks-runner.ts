import { exit } from 'process';
import type { ReleaseContext } from '../core/types.js';
import { exec } from '../utils/exec.js';
import { clack, dryRunNote } from '../utils/prompts.js';

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Run a single command with spinner and error handling
 */
function runCommand(
  ctx: ReleaseContext,
  name: string,
  command: string | null,
  message: string
): void {
  if (!command) return;

  if (ctx.dryRun) {
    dryRunNote(`${capitalize(name)}: ${command}`);
    return;
  }

  const s = clack.spinner();
  s.start(message);
  try {
    exec(command);
    s.stop(`${capitalize(name)} passed`);
  } catch (error) {
    s.stop(`${capitalize(name)} failed`);
    clack.log.error(error instanceof Error ? error.message : String(error));
    clack.outro(`Fix the ${name} errors and try again`);
    exit(1);
  }
}

/**
 * Run all check commands: typecheck, lint, test
 */
export function runChecks(ctx: ReleaseContext): void {
  if (!ctx.config.steps.runChecks) {
    return;
  }

  const { typecheck, lint, test } = ctx.config.commands;

  // Run in order: typecheck → lint → test
  runCommand(ctx, 'typecheck', typecheck, 'Running type checks...');
  runCommand(ctx, 'lint', lint, 'Running linter...');
  runCommand(ctx, 'test', test, 'Running tests...');
}
