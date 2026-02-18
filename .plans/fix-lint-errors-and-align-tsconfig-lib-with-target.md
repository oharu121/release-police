# Plan: Fix lint errors and align tsconfig lib with target

**Status:** Completed
**Date:** 2026-02-18

## Goal

Fix two `preserve-caught-error` lint violations and resolve TypeScript type-check failures caused by a `lib`/`target` mismatch in `tsconfig.json`.

## Summary of Changes

- Added `{ cause: error }` to re-thrown errors in `config.ts` and `exec.ts` to satisfy the `preserve-caught-error` ESLint rule
- Removed the explicit `lib: ["ES2020"]` from `tsconfig.json` so that `target: "ES2024"` serves as the single source of truth for both compilation target and type definitions
- This resolved the `TS2554` error where TypeScript didn't recognize the `ErrorOptions` parameter (available since ES2022)

## Files Modified

- [src/core/config.ts](src/core/config.ts) - Added `{ cause: error }` to preserve caught error in config loader
- [src/utils/exec.ts](src/utils/exec.ts) - Added `{ cause: error }` to preserve caught error in exec utility
- [tsconfig.json](tsconfig.json) - Removed redundant `lib` field; `target` now controls both compilation and type definitions

## Breaking Changes

None

## Deprecations

None
