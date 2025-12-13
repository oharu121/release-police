import { exit } from 'process';
import type { ReleaseContext, VersionType } from '../core/types.js';
import { exec } from '../utils/exec.js';
import { clack, handleCancel, dryRunNote } from '../utils/prompts.js';

/**
 * Bump version using npm version
 */
export async function bumpVersion(ctx: ReleaseContext): Promise<void> {
  if (!ctx.config.steps.versionBump) {
    return;
  }

  let versionType: VersionType;

  if (ctx.cliOptions.versionType) {
    versionType = ctx.cliOptions.versionType;
    clack.log.info(`Using version type from CLI: ${versionType}`);
  } else {
    if (ctx.dryRun) {
      dryRunNote('Would prompt for version type selection');
      versionType = 'patch'; // Default for dry run display
    } else {
      const selected = await clack.select({
        message: 'Select version bump:',
        options: [
          { value: 'patch', label: 'Patch (bug fixes)', hint: 'x.x.X' },
          { value: 'minor', label: 'Minor (new features)', hint: 'x.X.0' },
          { value: 'major', label: 'Major (breaking changes)', hint: 'X.0.0' },
        ],
      });

      versionType = handleCancel(selected, 'Release cancelled') as VersionType;
    }
  }

  // Get current version
  let currentVersion: string;
  try {
    currentVersion = exec('npm pkg get version', true).trim().replace(/"/g, '');
    ctx.currentVersion = currentVersion;
  } catch {
    clack.log.error('Failed to get current version');
    exit(1);
  }

  if (ctx.dryRun) {
    dryRunNote(`Would bump ${versionType} version from ${currentVersion}`);
    return;
  }

  // Run build command if configured (before version bump)
  const { build } = ctx.config.commands;
  if (build) {
    const s = clack.spinner();
    s.start('Running build...');
    try {
      exec(build);
      s.stop('Build completed');
    } catch (error) {
      s.stop('Build failed');
      clack.log.error(error instanceof Error ? error.message : String(error));
      clack.outro('Fix the build and try again');
      exit(1);
    }
  }

  // Run changelog command if configured (before version bump)
  const { changelog } = ctx.config.commands;
  if (changelog) {
    const s = clack.spinner();
    s.start('Generating changelog...');
    try {
      exec(changelog);
      s.stop('Changelog generated');

      // Commit changelog changes
      const status = exec('git status --porcelain', true).trim();
      if (status) {
        exec('git add .');
        exec('git commit -m "docs: update changelog"');
        clack.log.success('Changelog committed');
      }
    } catch (error) {
      s.stop('Changelog generation failed');
      clack.log.warn(error instanceof Error ? error.message : String(error));
      clack.log.warn('Continuing without changelog...');
    }
  }

  const s = clack.spinner();
  s.start(`Bumping ${versionType} version...`);

  try {
    const output = exec(`npm version ${versionType}`, true);
    const newVersion = output.trim().replace('v', '');
    ctx.newVersion = newVersion;
    s.stop(`Version bumped: ${currentVersion} → ${newVersion}`);
  } catch (error) {
    s.stop('Version bump failed');
    clack.log.error(error instanceof Error ? error.message : String(error));
    clack.note(
      'This could happen if:\n' +
        '  - Working directory is not clean\n' +
        '  - Git tag already exists\n' +
        '  - npm version scripts failed',
      'Common causes'
    );
    clack.outro('Fix the issue and try again');
    exit(1);
  }
}
