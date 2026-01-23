import { defineCommand, runMain, runCommand } from 'citty';
import { runRelease } from './core/runner.js';
import { initConfig } from './core/init.js';
import type { CliOptions, VersionType } from './core/types.js';

const init = defineCommand({
  meta: {
    name: 'init',
    description: 'Create a release.config.ts file',
  },
  async run() {
    await initConfig();
  },
});

const main = defineCommand({
  meta: {
    name: 'release-police',
    version: '0.1.0',
    description: 'Interactive release workflow with configurable steps\n\nCommands:\n  init    Create a release.config.ts file',
  },
  args: {
    'dry-run': {
      type: 'boolean',
      description: 'Preview what would happen without making changes',
      default: false,
    },
    'skip-tests': {
      type: 'boolean',
      description: 'Skip checks (deprecated, use --skip-checks)',
      default: false,
    },
    'skip-checks': {
      type: 'boolean',
      description: 'Skip typecheck, lint, and test commands',
      default: false,
    },
    'skip-sync': {
      type: 'boolean',
      description: 'Skip remote sync step',
      default: false,
    },
    'skip-push': {
      type: 'boolean',
      description: 'Skip push to remote (version bump only)',
      default: false,
    },
    'skip-deploy': {
      type: 'boolean',
      description: 'Skip deploy command',
      default: false,
    },
    'github-release': {
      type: 'boolean',
      description: 'Create GitHub release after push',
      default: false,
    },
    'version-type': {
      type: 'string',
      description: 'Pre-select version bump type (patch, minor, major)',
    },
    config: {
      type: 'string',
      alias: 'c',
      description: 'Path to config file',
    },
  },
  async run({ args }) {
    const options: CliOptions = {
      dryRun: args['dry-run'],
      skipTests: args['skip-tests'],
      skipChecks: args['skip-checks'],
      skipSync: args['skip-sync'],
      skipPush: args['skip-push'],
      skipDeploy: args['skip-deploy'],
      githubRelease: args['github-release'],
      config: args.config,
    };

    // Validate version type if provided
    if (args['version-type']) {
      const validTypes: VersionType[] = ['patch', 'minor', 'major'];
      if (!validTypes.includes(args['version-type'] as VersionType)) {
        console.error(`Invalid version type: ${args['version-type']}`);
        console.error('Valid types: patch, minor, major');
        process.exit(1);
      }
      options.versionType = args['version-type'] as VersionType;
    }

    await runRelease(options);
  },
});

// Handle subcommands manually
const args = process.argv.slice(2);
if (args[0] === 'init') {
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Create a release.config.ts file\n');
    console.log('USAGE  release-police init\n');
    console.log('Creates a release.config.ts file in the current directory');
    console.log('with all available options documented.\n');
  } else {
    runCommand(init, { rawArgs: args.slice(1) });
  }
} else {
  // Show init in help
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    // Will be handled by runMain, but we want to append init info
  }
  runMain(main);
}
