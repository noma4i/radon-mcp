import { describe, test, expect } from 'bun:test';

describe('radon-detector module', () => {
  test('exports required functions', async () => {
    const module = await import('../src/lib/radon-detector.js');

    expect(typeof module.detectRadonDevice).toBe('function');
    expect(typeof module.detectMetroPort).toBe('function');
    expect(typeof module.getRadonContext).toBe('function');
  });

  test('getRadonContext returns expected structure', async () => {
    const { getRadonContext } = await import('../src/lib/radon-detector.js');

    const context = getRadonContext();

    expect(context).toHaveProperty('device');
    expect(context).toHaveProperty('metroPort');
    expect(context).toHaveProperty('isRunning');
    expect(context).toHaveProperty('errors');
    expect(context.errors).toHaveProperty('device');
    expect(context.errors).toHaveProperty('metro');
  });

  test('detectRadonDevice returns result object', async () => {
    const { detectRadonDevice } = await import('../src/lib/radon-detector.js');

    const result = detectRadonDevice();

    expect(result).toHaveProperty('device');
    expect(result).toHaveProperty('error');

    if (result.device !== null) {
      expect(result.device).toHaveProperty('deviceId');
      expect(result.device).toHaveProperty('deviceSet');
    }
  });

  test('detectMetroPort returns result object', async () => {
    const { detectMetroPort } = await import('../src/lib/radon-detector.js');

    const result = detectMetroPort();

    expect(result).toHaveProperty('port');
    expect(result).toHaveProperty('error');

    if (result.port !== null) {
      expect(typeof result.port).toBe('number');
      expect(result.port).toBeGreaterThan(0);
    }
  });
});
