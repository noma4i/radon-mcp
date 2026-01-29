import { describe, test, expect } from 'bun:test';

describe('metro-client module', () => {
  test('exports getMetroStatus and getMetroLogs', async () => {
    const module = await import('../src/lib/metro-client.js');

    expect(typeof module.getMetroStatus).toBe('function');
    expect(typeof module.getMetroLogs).toBe('function');
  });

  test('does not export removed functions', async () => {
    const module = await import('../src/lib/metro-client.js');

    expect(module.reloadMetro).toBeUndefined();
    expect(module.getMetroPages).toBeUndefined();
    expect(module.formatConsoleArgs).toBeUndefined();
  });

  test('getMetroStatus handles connection failure', async () => {
    const { getMetroStatus } = await import('../src/lib/metro-client.js');

    const status = await getMetroStatus(1);

    expect(status.running).toBe(false);
    expect(status).toHaveProperty('port');
  });

  test('getMetroLogs handles connection failure', async () => {
    const { getMetroLogs } = await import('../src/lib/metro-client.js');

    const result = await getMetroLogs(1, { collectTimeout: 500 });

    expect(result.success).toBe(false);
    expect(result).toHaveProperty('error');
  });
});
