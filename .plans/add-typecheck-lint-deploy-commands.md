# Plan: Add typecheck, lint, and deploy Commands

**Status:** Completed
**Date:** 2025-01-23

## Goal

Add three new fixed commands (`typecheck`, `lint`, `deploy`) to the existing command system, and change the `test` default from `'npm run test:all'` to `'npm run test'`.

## Summary of Changes

| Command | Default | When it runs |
|---------|---------|--------------|
| `install` | `'npm install'` | After git pull (unchanged) |
| `typecheck` | `null` | **NEW** - After install, before lint |
| `lint` | `null` | **NEW** - After typecheck, before test |
| `test` | `'npm run test'` | After lint (default changed) |
| `build` | `null` | Before version bump (unchanged) |
| `changelog` | `null` | Before version bump (unchanged) |
| `deploy` | `null` | **NEW** - After push, before GitHub release |

## Execution Flow (Updated)

```
1. checkBranch
2. syncRemote
   └── install command (after git pull)
3. runChecks        ← RENAMED from runTests
   ├── typecheck    ← NEW
   ├── lint         ← NEW
   └── test
4. commitChanges
5. versionBump
   ├── build
   └── changelog (with auto-commit)
6. push
7. deploy           ← NEW step
8. githubRelease
```

## Files Modified

### 1. src/core/types.ts

- Added `typecheck`, `lint`, `deploy` to `CommandsConfig`
- Renamed `runTests` → `runChecks` in `StepsConfig` (kept `runTests` as deprecated)
- Added `deploy` to `StepsConfig`
- Added `skipChecks`, `skipDeploy` to `CliOptions` (kept `skipTests` as deprecated)

### 2. src/core/config.ts

- Updated `DEFAULT_CONFIG` with new commands (all default to `null`)
- Changed `test` default from `'npm run test:all'` to `'npm run test'`
- Added `runChecks: true` and `deploy: false` to default steps
- Added backward compatibility logic in `mergeConfig()` for `runTests` → `runChecks`

### 3. src/core/init.ts

- Updated `CONFIG_TEMPLATE` with all new commands and steps
- Template now shows the full command execution order

### 4. src/steps/checks-runner.ts (NEW)

- New file that runs `typecheck` → `lint` → `test` in sequence
- Extracted common `runCommand()` helper function
- Replaces the old `test-runner.ts` functionality

### 5. src/steps/deploy.ts (NEW)

- New step file for deploy command
- Runs after push, before GitHub release
- Disabled by default (`steps.deploy: false`)

### 6. src/steps/index.ts

- Added exports for `runChecks` and `deploy`
- Kept `runTests` export as deprecated for backward compatibility

### 7. src/core/runner.ts

- Updated imports to use `runChecks` and `deploy`
- Updated CLI override logic for `skipChecks` and `skipDeploy`
- Updated execution flow to call new steps

### 8. src/cli.ts

- Added `--skip-checks` flag
- Added `--skip-deploy` flag
- Kept `--skip-tests` as deprecated alias

### 9. src/core/config.test.ts

- Updated test assertions for new default values

### 10. README.md

- Updated configuration examples
- Updated CLI options table
- Updated workflow steps section

### 11. CHANGELOG.md (NEW)

- Created changelog documenting all changes

## Backward Compatibility

- `steps.runTests` still works, maps to `runChecks`
- `--skip-tests` CLI flag still works, maps to `--skip-checks`
- Existing configs without new options continue to work

## Verification

1. ✅ `npm run typecheck` - passes
2. ✅ `npm run test` - all 9 tests pass
3. ✅ Config template updated in `init.ts`
4. ✅ README updated
5. ✅ CHANGELOG created
