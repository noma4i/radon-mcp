import { describe, test, expect } from 'bun:test';

describe('metro-client module', () => {
  test('exports required functions', async () => {
    const module = await import('../src/lib/metro-client.js');

    expect(typeof module.getMetroStatus).toBe('function');
    expect(typeof module.reloadMetro).toBe('function');
    expect(typeof module.getMetroLogs).toBe('function');
    expect(typeof module.getMetroPages).toBe('function');
  });

  test('getMetroStatus handles connection failure', async () => {
    const { getMetroStatus } = await import('../src/lib/metro-client.js');

    const status = await getMetroStatus(1);

    expect(status.running).toBe(false);
    expect(status).toHaveProperty('port');
  });

  test('reloadMetro returns result object on failure', async () => {
    const { reloadMetro } = await import('../src/lib/metro-client.js');

    const result = await reloadMetro(1);

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(false);
  });

  test('getMetroPages returns error on connection failure', async () => {
    const { getMetroPages } = await import('../src/lib/metro-client.js');

    const result = await getMetroPages(1);

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(false);
  });

  test('getMetroLogs returns error on connection failure', async () => {
    const { getMetroLogs } = await import('../src/lib/metro-client.js');

    const result = await getMetroLogs(1, {});

    expect(result).toHaveProperty('success');
    expect(result.success).toBe(false);
  });
});
