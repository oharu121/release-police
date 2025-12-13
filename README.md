# release-police


[![npm version](https://badge.fury.io/js/release-police.svg)](https://badge.fury.io/js/release-police)
![License](https://img.shields.io/npm/l/release-police)
![Types](https://img.shields.io/npm/types/release-police)
![NPM Downloads](https://img.shields.io/npm/dw/release-police)
![Last Commit](https://img.shields.io/github/last-commit/oharu121/release-police)
![Coverage](https://codecov.io/gh/oharu121/release-police/branch/main/graph/badge.svg)
![CI Status](https://github.com/oharu121/release-police/actions/workflows/ci.yml/badge.svg)
![GitHub Stars](https://img.shields.io/github/stars/oharu121/release-police?style=social)
A new npm package created with forge-npm-pkg.

## Installation

```bash
npm install release-police
```

## Usage

```typescript
import { greet } from 'release-police';

console.log(greet('World')); // Hello, World!
```

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
npm run format
```

### Validate Package Exports

```bash
npm run check:exports
```

## Release Workflow

This package uses automated publishing via GitHub Actions.

### Creating a Release

1. **Make your changes** and commit them
2. **Update the version:**
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```
3. **Push the changes and tags:**
   ```bash
   git push && git push --tags
   ```
4. **Package automatically publishes to npm** 🎉

The GitHub Actions workflow will automatically:
- Run all tests
- Build the package
- Publish to npm when a git tag is pushed


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any issues, please report them [here](https://github.com/oharu121/release-police/issues).


## License

MIT © oharu121
