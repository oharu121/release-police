import { describe, it, expect } from 'vitest';
import { exec, execSafe } from './exec.js';

describe('exec', () => {
  it('should execute a command and return output', () => {
    const result = exec('echo hello', true);
    expect(result.trim()).toBe('hello');
  });

  it('should throw on failed command', () => {
    expect(() => exec('exit 1', true)).toThrow('Command failed');
  });
});

describe('execSafe', () => {
  it('should return output on success', () => {
    const result = execSafe('echo hello');
    expect(result?.trim()).toBe('hello');
  });

  it('should return null on failure', () => {
    const result = execSafe('exit 1');
    expect(result).toBeNull();
  });
});
