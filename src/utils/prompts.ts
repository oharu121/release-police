import * as clack from '@clack/prompts';
import { exit } from 'process';

/**
 * Handle cancellation from clack prompts
 */
export function handleCancel<T>(value: T | symbol, message = 'Operation cancelled'): T {
  if (clack.isCancel(value)) {
    clack.cancel(message);
    exit(0);
  }
  return value as T;
}

/**
 * Confirm with the user, exit if cancelled or declined
 */
export async function confirmOrExit(
  message: string,
  options: { initialValue?: boolean; cancelMessage?: string } = {}
): Promise<boolean> {
  const { initialValue = true, cancelMessage = 'Operation cancelled' } = options;

  const result = await clack.confirm({
    message,
    initialValue,
  });

  if (clack.isCancel(result)) {
    clack.cancel(cancelMessage);
    exit(0);
  }

  return result;
}

/**
 * Show a note in dry-run mode
 */
export function dryRunNote(action: string): void {
  clack.log.info(`[DRY RUN] Would: ${action}`);
}

export { clack };
