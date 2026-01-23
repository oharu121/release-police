# release-police

[![npm version](https://badge.fury.io/js/release-police.svg)](https://badge.fury.io/js/release-police)
![License](https://img.shields.io/npm/l/release-police)
![Types](https://img.shields.io/npm/types/release-police)
![NPM Downloads](https://img.shields.io/npm/dw/release-police)
![Last Commit](https://img.shields.io/github/last-commit/oharu121/release-police)
![Coverage](https://codecov.io/gh/oharu121/release-police/branch/main/graph/badge.svg)
![CI Status](https://github.com/oharu121/release-police/actions/workflows/ci.yml/badge.svg)
![GitHub Stars](https://img.shields.io/github/stars/oharu121/release-police?style=social)

Interactive release workflow CLI with configurable steps. Automates version bumping, testing, and publishing with beautiful prompts.

## Features

- Interactive prompts with beautiful CLI UI
- Configurable via TypeScript, JavaScript, or package.json
- Dry-run mode to preview changes
- Skip individual steps via CLI flags
- Automatic remote sync detection
- Customizable typecheck, lint, test, build, changelog, and deploy commands
- GitHub release creation (draft or published)

## Installation

```bash
npm install -D release-police
```

Or run directly:

```bash
npx release-police
```

## Quick Start

```bash
# Run with defaults
npx release-police

# Preview what would happen
npx release-police --dry-run

# Skip tests
npx release-police --skip-tests

# Pre-select version type
npx release-police --version-type minor
```

## Configuration

Generate a config file with all options:

```bash
npx release-police init
```

Or create `release.config.ts` manually:

```typescript
import { defineConfig } from 'release-police';

export default defineConfig({
  // Branches that allow releases (default: ['main', 'master'])
  releaseBranches: ['main', 'master', 'release/*'],

  // Commands to run (set to null to skip)
  commands: {
    install: 'npm install',        // run after pulling
    typecheck: null,               // optional type checking
    lint: null,                    // optional linting
    test: 'npm run test',          // default
    build: null,                   // optional pre-release build
    changelog: null,               // optional changelog generation
    deploy: null,                  // optional post-push deploy
  },

  // Git settings
  git: {
    pullStrategy: 'rebase',        // 'rebase' | 'merge' | 'ff-only'
    requireCleanWorkingDir: true,
  },

  // GitHub integration (optional)
  github: {
    release: false,        // Create GitHub release after push
    draft: true,           // Create as draft
    generateNotes: true,   // Auto-generate release notes
  },

  // Enable/disable steps
  steps: {
    checkBranch: true,
    syncRemote: true,
    runChecks: true,       // runs typecheck, lint, test in order
    commitChanges: true,
    versionBump: true,
    push: true,
    deploy: false,         // enable to run deploy command
    githubRelease: false,  // matches github.release
  },
});
```

### Alternative: Configure in package.json

For simple configurations, add to your `package.json`:

```json
{
  "releasePolice": {
    "commands": {
      "test": "npm test"
    },
    "releaseBranches": ["main"]
  }
}
```

## CLI Options

| Command/Flag | Description |
|------|-------------|
| `init` | Create a release.config.ts file with all options |
| `--dry-run` | Preview what would happen without making changes |
| `--skip-checks` | Skip typecheck, lint, and test commands |
| `--skip-tests` | Skip checks (deprecated, use `--skip-checks`) |
| `--skip-sync` | Skip remote sync step |
| `--skip-push` | Skip push to remote (local version bump only) |
| `--skip-deploy` | Skip deploy command |
| `--github-release` | Create GitHub release after push |
| `--version-type <type>` | Pre-select version bump: `patch`, `minor`, or `major` |
| `-c, --config <path>` | Path to config file |

## Workflow Steps

1. **Branch Check** - Verify you're on an allowed release branch
2. **Remote Sync** - Fetch and pull latest changes, run install command
3. **Run Checks** - Execute typecheck, lint, and test commands in order
4. **Commit Changes** - Stage and commit uncommitted changes
5. **Version Bump** - Interactive version selection, run build and changelog commands
6. **Push** - Push commits and tags to remote
7. **Deploy** - Run deploy command (optional)
8. **GitHub Release** - Create GitHub release (optional)

## Programmatic Usage

```typescript
import { runRelease, defineConfig, loadConfig } from 'release-police';

// Run with CLI options
await runRelease({
  dryRun: true,
  skipTests: false,
});

// Load and inspect config
const config = await loadConfig();
console.log(config.commands.test);
```

## Examples

### Custom test command

```typescript
// release.config.ts
import { defineConfig } from 'release-police';

export default defineConfig({
  commands: {
    test: 'npm run lint && npm run test:unit && npm run test:e2e',
  },
});
```

### Skip changelog (use AI-generated instead)

```typescript
// release.config.ts
import { defineConfig } from 'release-police';

export default defineConfig({
  commands: {
    changelog: null, // Skip - generate with Claude Code instead
  },
});
```

### CI-friendly release

```bash
# In CI, skip interactive prompts
npx release-police --version-type patch --skip-push
```

## GitHub Release Integration

Create a GitHub release automatically after pushing:

```typescript
// release.config.ts
import { defineConfig } from 'release-police';

export default defineConfig({
  github: {
    release: true,       // Enable GitHub release creation
    draft: true,         // Create as draft (recommended)
    generateNotes: true, // Auto-generate notes from commits
  },
});
```

Or via CLI flag:

```bash
npx release-police --github-release
```

**Requirements:** [GitHub CLI](https://cli.github.com/) must be installed and authenticated (`gh auth login`).

**Why draft by default?**
- Review and edit release notes before publishing
- Won't accidentally trigger CD workflows
- Matches the safe, interactive philosophy of release-police

## Development

```bash
npm run build      # Build the package
npm run test       # Run tests
npm run lint       # Lint code
npm run typecheck  # Type check
```

## License

MIT © oharu121
