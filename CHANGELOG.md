# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.1.1] - 2026-02-18

### Fixed
- Added `{ cause: error }` to re-thrown errors in config loader and exec utility to satisfy `preserve-caught-error` lint rule
- Removed explicit `lib: ["ES2020"]` from `tsconfig.json` so `target: "ES2024"` serves as single source of truth for type definitions, fixing `TS2554` errors for `ErrorOptions`

## [1.1.0] - 2025-01-24

### Added
- New `typecheck` command - run type checking before tests
- New `lint` command - run linting before tests
- New `deploy` command - run deployment after push
- New `--skip-checks` CLI flag - skip typecheck, lint, and test commands
- New `--skip-deploy` CLI flag - skip deploy command
- New `steps.runChecks` option - replaces `runTests`, runs typecheck → lint → test in order
- New `steps.deploy` option - enable deploy step (disabled by default)
- New `/create-issue` Claude Code skill for automated issue creation

### Changed
- Default `test` command changed from `npm run test:all` to `npm run test`
- `runTests` step renamed to `runChecks` (backward compatible)
- `--skip-tests` flag now deprecated in favor of `--skip-checks`

### Deprecated
- `steps.runTests` - use `steps.runChecks` instead
- `--skip-tests` CLI flag - use `--skip-checks` instead

## [1.0.0] - 2024-01-XX

### Added
- Initial release
- Interactive release workflow with beautiful CLI prompts
- Configurable via TypeScript, JavaScript, or package.json
- Branch validation
- Remote sync with configurable pull strategy
- Test command execution
- Automatic commit of uncommitted changes
- Interactive version bump (patch/minor/major)
- Git push with tags
- GitHub release creation (draft or published)
- Dry-run mode
- CLI flags for skipping individual steps
