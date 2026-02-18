# Plan: Fix pnpm publish detached HEAD error in CI

**Status:** Completed
**Date:** 2026-02-18

## Goal

Fix the GitHub Actions publish workflow failing with `ERR_PNPM_GIT_UNKNOWN_BRANCH` when triggered by a release event, caused by `actions/checkout` checking out a detached HEAD instead of a branch.

## Summary of Changes

- Added `--no-git-checks` flag to `pnpm publish` command in the publish workflow
- This bypasses pnpm's branch validation which fails in CI because release-triggered checkouts are in detached HEAD state

## Files Modified

- [.github/workflows/publish.yml](.github/workflows/publish.yml) - Added `--no-git-checks` to `pnpm publish --access public`

## Breaking Changes

None

## Deprecations

None
