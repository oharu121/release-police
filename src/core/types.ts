/**
 * Configuration types for release-police
 */

export type PullStrategy = 'rebase' | 'merge' | 'ff-only';
export type VersionType = 'patch' | 'minor' | 'major';

export interface CommandsConfig {
  /** Command to run tests (default: 'npm run test:all') */
  test?: string | null;
  /** Command to install dependencies after pull (default: 'npm install') */
  install?: string | null;
  /** Optional build command to run before release */
  build?: string | null;
  /** Optional changelog generation command */
  changelog?: string | null;
}

export interface GitConfig {
  /** Pull strategy when syncing with remote (default: 'rebase') */
  pullStrategy?: PullStrategy;
  /** Whether to require clean working directory (default: true) */
  requireCleanWorkingDir?: boolean;
}

export interface StepsConfig {
  /** Check if on allowed release branch (default: true) */
  checkBranch?: boolean;
  /** Sync with remote before release (default: true) */
  syncRemote?: boolean;
  /** Run test command (default: true) */
  runTests?: boolean;
  /** Commit uncommitted changes (default: true) */
  commitChanges?: boolean;
  /** Bump version (default: true) */
  versionBump?: boolean;
  /** Push to remote after version bump (default: true) */
  push?: boolean;
  /** Create GitHub release after push (default: false) */
  githubRelease?: boolean;
}

export interface GithubConfig {
  /** Create GitHub release after push (default: false) */
  release?: boolean;
  /** Create as draft - user can review before publishing (default: true) */
  draft?: boolean;
  /** Auto-generate release notes from commits (default: true) */
  generateNotes?: boolean;
}

export interface ReleaseConfig {
  /** Branches that allow releases (default: ['main', 'master']) */
  releaseBranches?: string[];
  /** Commands configuration */
  commands?: CommandsConfig;
  /** Git configuration */
  git?: GitConfig;
  /** GitHub integration configuration */
  github?: GithubConfig;
  /** Steps to enable/disable */
  steps?: StepsConfig;
}

export interface ResolvedGithubConfig {
  release: boolean;
  draft: boolean;
  generateNotes: boolean;
}

export interface ResolvedConfig {
  releaseBranches: string[];
  commands: Required<CommandsConfig>;
  git: Required<GitConfig>;
  github: ResolvedGithubConfig;
  steps: Required<StepsConfig>;
}

export interface CliOptions {
  dryRun?: boolean;
  skipTests?: boolean;
  skipSync?: boolean;
  skipPush?: boolean;
  githubRelease?: boolean;
  versionType?: VersionType;
  config?: string;
}

export interface ReleaseContext {
  config: ResolvedConfig;
  cliOptions: CliOptions;
  dryRun: boolean;
  currentBranch?: string;
  currentVersion?: string;
  newVersion?: string;
}
