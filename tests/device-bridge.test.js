import { describe, test, expect } from 'bun:test';

describe('device-bridge module', () => {
  test('exports required functions', async () => {
    const module = await import('../src/lib/device-bridge.js');

    expect(typeof module.captureScreenshot).toBe('function');
    expect(typeof module.reloadApp).toBe('function');
    expect(typeof module.listBootedDevices).toBe('function');
  });
});

describe('reloadApp', () => {
  test('returns success object structure for non-reloadJs methods with valid inputs', async () => {
    const { reloadApp } = await import('../src/lib/device-bridge.js');

    // Valid UUID and path
    const result = reloadApp(
      'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
      '/Users/test/Library/Caches',
      'restartProcess'
    );

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('method');
    expect(result.success).toBe(true);
    expect(result.method).toBe('fullRestart');
  });

  test('rejects invalid device ID', async () => {
    const { reloadApp } = await import('../src/lib/device-bridge.js');

    const result = reloadApp('invalid-device', '/valid/path', 'restartProcess');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid device ID');
  });

  test('rejects invalid path', async () => {
    const { reloadApp } = await import('../src/lib/device-bridge.js');

    const result = reloadApp(
      'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
      '/path/with/../traversal',
      'restartProcess'
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Path traversal');
  });
});

describe('listBootedDevices', () => {
  test('returns error for invalid path', async () => {
    const { listBootedDevices } = await import('../src/lib/device-bridge.js');

    const result = listBootedDevices('/path/../traversal');

    expect(result).toHaveProperty('devices');
    expect(result.devices).toEqual({});
    expect(result.error).toContain('Path traversal');
  });

  test('returns empty devices for non-existent valid path', async () => {
    const { listBootedDevices } = await import('../src/lib/device-bridge.js');

    const result = listBootedDevices('/nonexistent/valid/path');

    expect(result).toHaveProperty('devices');
    expect(result.devices).toEqual({});
  });
});

describe('captureScreenshot', () => {
  test('rejects invalid device ID', async () => {
    const { captureScreenshot } = await import('../src/lib/device-bridge.js');

    const result = await captureScreenshot('fake-device', '/valid/path');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid device ID');
  });

  test('rejects invalid path', async () => {
    const { captureScreenshot } = await import('../src/lib/device-bridge.js');

    const result = await captureScreenshot(
      'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
      '/path/../traversal'
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Path traversal');
  });
});
