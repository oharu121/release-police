import type { ReleaseContext } from '../core/types.js';
import { exec, execSafe } from '../utils/exec.js';
import { clack, dryRunNote } from '../utils/prompts.js';

/**
 * Create a GitHub release after push
 */
export async function createGithubRelease(ctx: ReleaseContext): Promise<void> {
  if (!ctx.config.steps.githubRelease && !ctx.config.github.release) {
    return;
  }

  const { draft, generateNotes } = ctx.config.github;

  if (ctx.dryRun) {
    const tag = ctx.newVersion ? `v${ctx.newVersion}` : 'v<new-version>';
    dryRunNote(`Create GitHub release for ${tag}`);
    if (draft) dryRunNote('Release will be created as draft');
    if (generateNotes) dryRunNote('Release notes will be auto-generated');
    return;
  }

  if (!ctx.newVersion) {
    clack.log.warn('No version available, skipping GitHub release');
    return;
  }

  const tag = `v${ctx.newVersion}`;

  // Check if gh CLI is available
  const ghVersion = execSafe('gh --version');
  if (!ghVersion) {
    clack.log.warn('GitHub CLI (gh) not installed, skipping release creation');
    clack.note(
      'Install GitHub CLI to enable automatic release creation:\n' +
        '  https://cli.github.com/\n\n' +
        'Or create the release manually at:\n' +
        '  https://github.com/<owner>/<repo>/releases/new',
      'GitHub CLI not found'
    );
    return;
  }

  // Check if authenticated
  const authStatus = execSafe('gh auth status');
  if (!authStatus) {
    clack.log.warn('GitHub CLI not authenticated, skipping release creation');
    clack.note('Run: gh auth login', 'Authentication required');
    return;
  }

  const s = clack.spinner();
  s.start(`Creating GitHub release ${tag}...`);

  try {
    const args = [
      'gh release create',
      tag,
      `--title "${tag}"`,
      draft ? '--draft' : '',
      generateNotes ? '--generate-notes' : '',
    ]
      .filter(Boolean)
      .join(' ');

    exec(args, true);

    if (draft) {
      s.stop(`GitHub release ${tag} created as draft`);
      clack.note(
        'The release was created as a draft.\n' +
          'Review and publish it at:\n' +
          '  https://github.com/<owner>/<repo>/releases',
        'Draft release created'
      );
    } else {
      s.stop(`GitHub release ${tag} published`);
    }
  } catch (error) {
    s.stop('Failed to create GitHub release');
    clack.log.warn(error instanceof Error ? error.message : String(error));
    clack.note(
      'You can create the release manually at:\n' +
        '  https://github.com/<owner>/<repo>/releases/new\n\n' +
        `Tag: ${tag}`,
      'Manual release required'
    );
  }
}
