import { describe, test, expect } from 'bun:test';

describe('device-bridge module', () => {
  test('exports required functions', async () => {
    const module = await import('../src/lib/device-bridge.js');

    expect(typeof module.captureScreenshot).toBe('function');
    expect(typeof module.listBootedDevices).toBe('function');
  });

  test('does not export removed functions', async () => {
    const module = await import('../src/lib/device-bridge.js');

    expect(module.reloadApp).toBeUndefined();
    expect(module.getDeviceLogs).toBeUndefined();
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

    const result = await captureScreenshot('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', '/path/../traversal');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Path traversal');
  });
});

describe('openUrl', () => {
  test('exports openUrl function', async () => {
    const module = await import('../src/lib/device-bridge.js');
    expect(typeof module.openUrl).toBe('function');
  });

  test('rejects invalid device ID', async () => {
    const { openUrl } = await import('../src/lib/device-bridge.js');

    const result = openUrl('invalid', '/valid/path', 'https://example.com');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid device ID');
  });

  test('rejects invalid path', async () => {
    const { openUrl } = await import('../src/lib/device-bridge.js');

    const result = openUrl('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', '/path/../traversal', 'https://example.com');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Path traversal');
  });

  test('rejects missing URL', async () => {
    const { openUrl } = await import('../src/lib/device-bridge.js');

    const result = openUrl('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', '/valid/path', null);

    expect(result.success).toBe(false);
    expect(result.error).toContain('URL is required');
  });
});

describe('setAppearance', () => {
  test('exports setAppearance function', async () => {
    const module = await import('../src/lib/device-bridge.js');
    expect(typeof module.setAppearance).toBe('function');
  });

  test('rejects invalid device ID', async () => {
    const { setAppearance } = await import('../src/lib/device-bridge.js');

    const result = setAppearance('invalid', '/valid/path', 'dark');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid device ID');
  });

  test('rejects invalid mode', async () => {
    const { setAppearance } = await import('../src/lib/device-bridge.js');

    const result = setAppearance('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', '/valid/path', 'invalid');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Mode must be');
  });
});

describe('setStatusBar', () => {
  test('exports setStatusBar function', async () => {
    const module = await import('../src/lib/device-bridge.js');
    expect(typeof module.setStatusBar).toBe('function');
  });

  test('rejects invalid device ID', async () => {
    const { setStatusBar } = await import('../src/lib/device-bridge.js');

    const result = setStatusBar('invalid', '/valid/path', { time: '9:41' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid device ID');
  });

  test('rejects empty options', async () => {
    const { setStatusBar } = await import('../src/lib/device-bridge.js');

    const result = setStatusBar('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', '/valid/path', {});

    expect(result.success).toBe(false);
    expect(result.error).toContain('At least one status bar option');
  });
});

describe('clearStatusBar', () => {
  test('exports clearStatusBar function', async () => {
    const module = await import('../src/lib/device-bridge.js');
    expect(typeof module.clearStatusBar).toBe('function');
  });

  test('rejects invalid device ID', async () => {
    const { clearStatusBar } = await import('../src/lib/device-bridge.js');

    const result = clearStatusBar('invalid', '/valid/path');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid device ID');
  });
});

describe('setPrivacy', () => {
  test('exports setPrivacy function', async () => {
    const module = await import('../src/lib/device-bridge.js');
    expect(typeof module.setPrivacy).toBe('function');
  });

  test('rejects invalid device ID', async () => {
    const { setPrivacy } = await import('../src/lib/device-bridge.js');

    const result = setPrivacy('invalid', '/valid/path', 'grant', 'camera', 'com.app');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid device ID');
  });

  test('rejects invalid action', async () => {
    const { setPrivacy } = await import('../src/lib/device-bridge.js');

    const result = setPrivacy('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', '/valid/path', 'invalid', 'camera', 'com.app');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Action must be');
  });

  test('rejects invalid service', async () => {
    const { setPrivacy } = await import('../src/lib/device-bridge.js');

    const result = setPrivacy('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', '/valid/path', 'grant', 'invalid-service', 'com.app');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid service');
  });

  test('rejects missing bundle ID', async () => {
    const { setPrivacy } = await import('../src/lib/device-bridge.js');

    const result = setPrivacy('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', '/valid/path', 'grant', 'camera', null);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Bundle ID is required');
  });
});

describe('getDeviceInfo', () => {
  test('exports getDeviceInfo function', async () => {
    const module = await import('../src/lib/device-bridge.js');
    expect(typeof module.getDeviceInfo).toBe('function');
  });

  test('rejects invalid device ID', async () => {
    const { getDeviceInfo } = await import('../src/lib/device-bridge.js');

    const result = getDeviceInfo('invalid', '/valid/path');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid device ID');
  });
});
