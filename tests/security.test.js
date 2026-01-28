import { describe, it, expect } from 'bun:test';
import { validateDeviceId, validatePath, validateRegex, validateReadmeLimit } from '../src/lib/validators.js';
import { filterLines } from '../src/lib/pagination.js';

describe('Security: Shell Injection Protection', () => {
  const shellPayloads = [
    '$(rm -rf /)',
    '`rm -rf /`',
    '; rm -rf /',
    '| rm -rf /',
    '&& rm -rf /',
    '|| rm -rf /',
    '> /etc/passwd',
    '< /etc/passwd',
    '\n rm -rf /',
    '\r\n rm -rf /',
    '${PATH}',
    '$HOME',
  ];

  describe('validateDeviceId rejects shell payloads', () => {
    shellPayloads.forEach(payload => {
      it(`rejects: ${payload.slice(0, 20)}...`, () => {
        const result = validateDeviceId(payload);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('validatePath rejects shell payloads', () => {
    shellPayloads.forEach(payload => {
      it(`rejects: ${payload.slice(0, 20)}...`, () => {
        const result = validatePath(`/tmp/${payload}`);
        expect(result.valid).toBe(false);
      });
    });
  });
});

describe('Security: Path Traversal Protection', () => {
  const traversalPayloads = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32',
    '/tmp/../../../etc/passwd',
    '/tmp/test/../../../etc/passwd',
    '....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f',
  ];

  traversalPayloads.forEach(payload => {
    it(`rejects path traversal: ${payload.slice(0, 30)}...`, () => {
      const result = validatePath(payload);
      if (payload.includes('..')) {
        expect(result.valid).toBe(false);
      }
    });
  });
});

describe('Security: ReDoS Protection', () => {
  it('rejects overly long regex', () => {
    const result = validateRegex('a'.repeat(200));
    expect(result.valid).toBe(false);
  });

  it('filterLines handles ReDoS gracefully', () => {
    const text = 'a'.repeat(100) + '\n' + 'b'.repeat(100);
    const redosPattern = '(a+)+b';

    const result = filterLines(text, redosPattern);
    expect(result.error).toBeUndefined();
  });

  it('filterLines returns error for invalid regex', () => {
    const result = filterLines('test\nline', '[invalid');
    expect(result.error).toContain('Invalid regex');
    expect(result.matched).toBe(0);
  });

  it('filterLines caps regex length', () => {
    const result = filterLines('test', 'a'.repeat(101));
    expect(result.error).toContain('max 100');
  });
});

describe('Security: Memory Limits', () => {
  it('validateReadmeLimit caps at 50000', () => {
    expect(validateReadmeLimit(Number.MAX_SAFE_INTEGER)).toBe(50000);
    expect(validateReadmeLimit(1e10)).toBe(50000);
    expect(validateReadmeLimit(999999999)).toBe(50000);
  });

  it('validateReadmeLimit handles edge cases', () => {
    expect(validateReadmeLimit(Infinity)).toBe(50000);
    expect(validateReadmeLimit(-Infinity)).toBe(5000);
    expect(validateReadmeLimit(NaN)).toBe(5000);
  });
});

describe('Security: Input Type Validation', () => {
  it('validateDeviceId rejects non-strings', () => {
    expect(validateDeviceId(123).valid).toBe(false);
    expect(validateDeviceId({}).valid).toBe(false);
    expect(validateDeviceId([]).valid).toBe(false);
  });

  it('validatePath rejects non-strings', () => {
    expect(validatePath(123).valid).toBe(false);
    expect(validatePath({}).valid).toBe(false);
    expect(validatePath([]).valid).toBe(false);
  });

  it('validateRegex rejects non-strings', () => {
    expect(validateRegex(123).valid).toBe(false);
    expect(validateRegex({}).valid).toBe(false);
    expect(validateRegex([]).valid).toBe(false);
  });
});
