import { describe, it, expect } from 'bun:test';
import {
  validateDeviceId,
  validatePath,
  validateRegex,
  validateReadmeLimit,
  validateNpmPackageName,
} from '../src/lib/validators.js';

describe('validateDeviceId', () => {
  it('accepts valid UUID', () => {
    const result = validateDeviceId('A1B2C3D4-E5F6-7890-ABCD-EF1234567890');
    expect(result.valid).toBe(true);
  });

  it('accepts lowercase UUID', () => {
    const result = validateDeviceId('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(result.valid).toBe(true);
  });

  it('rejects invalid format', () => {
    const result = validateDeviceId('not-a-uuid');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid device ID format');
  });

  it('rejects empty string', () => {
    const result = validateDeviceId('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Device ID required');
  });

  it('rejects null/undefined', () => {
    expect(validateDeviceId(null).valid).toBe(false);
    expect(validateDeviceId(undefined).valid).toBe(false);
  });

  it('rejects shell injection attempts', () => {
    const result = validateDeviceId('$(rm -rf /)');
    expect(result.valid).toBe(false);
  });
});

describe('validatePath', () => {
  it('accepts valid path', () => {
    const result = validatePath('/Users/test/Library/Caches/com.example/Devices');
    expect(result.valid).toBe(true);
  });

  it('accepts path with tilde and dash', () => {
    const result = validatePath('~/work/my-project_v2');
    expect(result.valid).toBe(true);
  });

  it('rejects path traversal', () => {
    const result = validatePath('/Users/../../../etc/passwd');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Path traversal not allowed');
  });

  it('rejects shell special chars', () => {
    const result = validatePath('/Users/$(whoami)/test');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid path characters');
  });

  it('rejects backticks', () => {
    const result = validatePath('/Users/`id`/test');
    expect(result.valid).toBe(false);
  });

  it('rejects semicolons', () => {
    const result = validatePath('/tmp; rm -rf /');
    expect(result.valid).toBe(false);
  });

  it('rejects empty path', () => {
    expect(validatePath('').valid).toBe(false);
    expect(validatePath(null).valid).toBe(false);
  });
});

describe('validateRegex', () => {
  it('accepts valid pattern', () => {
    const result = validateRegex('error|warn');
    expect(result.valid).toBe(true);
    expect(result.regex).toBeInstanceOf(RegExp);
  });

  it('accepts empty pattern', () => {
    const result = validateRegex('');
    expect(result.valid).toBe(true);
    expect(result.regex).toBe(null);
  });

  it('accepts null/undefined', () => {
    expect(validateRegex(null).valid).toBe(true);
    expect(validateRegex(undefined).valid).toBe(true);
  });

  it('rejects invalid regex', () => {
    const result = validateRegex('[invalid');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid regex');
  });

  it('rejects too long pattern', () => {
    const result = validateRegex('a'.repeat(101));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('max 100');
  });

  it('accepts pattern at max length', () => {
    const result = validateRegex('a'.repeat(100));
    expect(result.valid).toBe(true);
  });

  it('rejects non-string pattern', () => {
    const result = validateRegex(123);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Pattern must be a string');
  });
});

describe('validateReadmeLimit', () => {
  it('returns default for undefined', () => {
    expect(validateReadmeLimit(undefined)).toBe(5000);
  });

  it('returns valid number', () => {
    expect(validateReadmeLimit(1000)).toBe(1000);
  });

  it('caps at max', () => {
    expect(validateReadmeLimit(999999999)).toBe(50000);
  });

  it('returns default for negative', () => {
    expect(validateReadmeLimit(-100)).toBe(5000);
  });

  it('returns default for NaN', () => {
    expect(validateReadmeLimit('not-a-number')).toBe(5000);
  });

  it('converts string numbers', () => {
    expect(validateReadmeLimit('2000')).toBe(2000);
  });
});

describe('validateNpmPackageName', () => {
  it('accepts valid package name', () => {
    expect(validateNpmPackageName('react-native').valid).toBe(true);
  });

  it('accepts scoped package', () => {
    expect(validateNpmPackageName('@react-navigation/native').valid).toBe(true);
  });

  it('accepts package with numbers', () => {
    expect(validateNpmPackageName('lodash4').valid).toBe(true);
  });

  it('rejects empty name', () => {
    const result = validateNpmPackageName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Package name required');
  });

  it('rejects too long name', () => {
    const result = validateNpmPackageName('a'.repeat(215));
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Package name too long');
  });

  it('rejects uppercase letters', () => {
    const result = validateNpmPackageName('React');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid npm package name');
  });

  it('rejects special characters', () => {
    expect(validateNpmPackageName('package!@#').valid).toBe(false);
    expect(validateNpmPackageName('package name').valid).toBe(false);
  });
});
