import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadConfig, defineConfig } from './config.js';
import * as fs from 'fs';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('loadConfig', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return defaults when no config file exists', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.readFileSync).mockReturnValue('{}');

    const config = await loadConfig();

    expect(config).toEqual({
      releaseBranches: ['main', 'master'],
      commands: {
        test: 'npm run test:all',
        install: 'npm install',
        build: null,
        changelog: null,
      },
      git: {
        pullStrategy: 'rebase',
        requireCleanWorkingDir: true,
      },
      github: {
        release: false,
        draft: true,
        generateNotes: true,
      },
      steps: {
        checkBranch: true,
        syncRemote: true,
        runTests: true,
        commitChanges: true,
        versionBump: true,
        push: true,
        githubRelease: false,
      },
    });
  });

  it('should load config from package.json releasePolice field', async () => {
    vi.mocked(fs.existsSync).mockImplementation((path) => {
      return String(path).endsWith('package.json');
    });
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({
        releasePolice: {
          releaseBranches: ['develop'],
          commands: {
            test: 'npm test',
          },
        },
      })
    );

    const config = await loadConfig();

    expect(config.releaseBranches).toEqual(['develop']);
    expect(config.commands.test).toBe('npm test');
    // Should still have defaults for unspecified values
    expect(config.commands.install).toBe('npm install');
  });
});

describe('defineConfig', () => {
  it('should return the same config object', () => {
    const input = {
      releaseBranches: ['main'],
    };
    expect(defineConfig(input)).toBe(input);
  });
});
