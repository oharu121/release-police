import { execSync } from 'child_process';

/**
 * Executes a shell command with error handling
 * @param command - The command to execute
 * @param silent - Whether to suppress output
 * @returns Command output as string
 * @throws Error if command fails
 */
export function exec(command: string, silent = false): string {
  try {
    const result = execSync(command, {
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
    });
    return result ?? '';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Command failed: ${command}\n${message}`, { cause: error });
  }
}

/**
 * Executes a shell command, returning null instead of throwing on failure
 * @param command - The command to execute
 * @returns Command output or null if failed
 */
export function execSafe(command: string): string | null {
  try {
    return exec(command, true);
  } catch {
    return null;
  }
}
