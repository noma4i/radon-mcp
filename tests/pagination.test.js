import { describe, test, expect } from 'bun:test';
import {
  truncateLines,
  lastNLines,
  truncateLinesWithSummary,
  filterLines,
  truncateChars,
  KEEP_FIRST_N,
  KEEP_LAST_N,
} from '../src/lib/pagination.js';

describe('truncateLines', () => {
  test('returns text unchanged if within limits', () => {
    const text = 'line1\nline2\nline3';
    expect(truncateLines(text)).toBe(text);
  });

  test('truncates long text with marker', () => {
    const lines = Array.from({ length: 300 }, (_, i) => `line${i + 1}`);
    const text = lines.join('\n');
    const result = truncateLines(text);

    expect(result).toContain('line1');
    expect(result).toContain('line50');
    expect(result).toContain('[SKIPPED');
    expect(result).toContain('line300');
    expect(result).not.toContain('line100');
  });

  test('uses custom first/last values', () => {
    const lines = Array.from({ length: 100 }, (_, i) => `line${i + 1}`);
    const text = lines.join('\n');
    const result = truncateLines(text, 10, 10);

    expect(result).toContain('line1');
    expect(result).toContain('line10');
    expect(result).toContain('[SKIPPED 80 LINES]');
    expect(result).toContain('line100');
  });
});

describe('lastNLines', () => {
  test('returns all lines if count is less than n', () => {
    const text = 'line1\nline2\nline3';
    expect(lastNLines(text, 10)).toBe(text);
  });

  test('returns last n lines', () => {
    const lines = Array.from({ length: 100 }, (_, i) => `line${i + 1}`);
    const text = lines.join('\n');
    const result = lastNLines(text, 10);

    expect(result).not.toContain('line90');
    expect(result).toContain('line91');
    expect(result).toContain('line100');
  });

  test('handles empty text', () => {
    expect(lastNLines('', 10)).toBe('');
  });
});

describe('truncateLinesWithSummary', () => {
  test('returns text with simple summary if within limits', () => {
    const text = 'line1\nline2\nline3';
    const result = truncateLinesWithSummary(text);

    expect(result.text).toBe(text);
    expect(result.summary).toBe('3 lines');
  });

  test('truncates and provides detailed summary', () => {
    const lines = Array.from({ length: 300 }, (_, i) => `line${i + 1}`);
    const text = lines.join('\n');
    const result = truncateLinesWithSummary(text);

    expect(result.text).toContain('--- SKIPPED 100 LINES ---');
    expect(result.summary).toContain('showing 50 first + 150 last');
    expect(result.summary).toContain('skipped 100');
  });
});

describe('filterLines', () => {
  test('returns all lines when no pattern', () => {
    const text = 'line1\nline2\nline3';
    const result = filterLines(text, '');

    expect(result.text).toBe(text);
    expect(result.matched).toBe(3);
    expect(result.total).toBe(3);
  });

  test('filters lines by pattern', () => {
    const text = 'error: something\ninfo: ok\nError: another\nwarning: test';
    const result = filterLines(text, 'error');

    expect(result.text).toBe('error: something\nError: another');
    expect(result.matched).toBe(2);
    expect(result.total).toBe(4);
  });

  test('is case insensitive by default', () => {
    const text = 'ERROR\nerror\nError';
    const result = filterLines(text, 'error');

    expect(result.matched).toBe(3);
  });

  test('respects case sensitivity flag', () => {
    const text = 'ERROR\nerror\nError';
    const result = filterLines(text, 'error', true);

    expect(result.matched).toBe(1);
  });

  test('supports regex patterns', () => {
    const text = 'error: test\nwarn: test\ninfo: test';
    const result = filterLines(text, 'error|warn');

    expect(result.matched).toBe(2);
  });
});

describe('truncateChars', () => {
  test('returns text unchanged if within limit', () => {
    const text = 'short text';
    expect(truncateChars(text, 100)).toBe(text);
  });

  test('truncates long text with marker', () => {
    const text = 'a'.repeat(1000);
    const result = truncateChars(text, 100);

    expect(result.length).toBeLessThan(1000);
    expect(result).toContain('[SKIPPED');
    expect(result).toContain('CHARS]');
  });
});

describe('constants', () => {
  test('KEEP_FIRST_N is 50', () => {
    expect(KEEP_FIRST_N).toBe(50);
  });

  test('KEEP_LAST_N is 150', () => {
    expect(KEEP_LAST_N).toBe(150);
  });
});
