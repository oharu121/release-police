import { describe, it, expect } from 'vitest';
import { defineConfig } from './index.js';

describe('defineConfig', () => {
  it('should return the config object as-is', () => {
    const config = {
      releaseBranches: ['main'],
      commands: {
        test: 'npm test',
      },
    };
    expect(defineConfig(config)).toEqual(config);
  });

  it('should accept partial config', () => {
    const config = {
      commands: {
        test: null,
      },
    };
    expect(defineConfig(config)).toEqual(config);
  });
});
