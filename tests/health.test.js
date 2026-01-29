import { describe, test, expect } from 'bun:test';

describe('health tools module', () => {
  test('exports HEALTH_TOOLS array with 1 tool', async () => {
    const module = await import('../src/tools/health.js');

    expect(Array.isArray(module.HEALTH_TOOLS)).toBe(true);
    expect(module.HEALTH_TOOLS.length).toBe(1);
  });

  test('exports HEALTH_HANDLERS object with 1 handler', async () => {
    const module = await import('../src/tools/health.js');

    expect(typeof module.HEALTH_HANDLERS).toBe('object');
    expect(Object.keys(module.HEALTH_HANDLERS).length).toBe(1);
  });

  test('check_system_health has required properties', async () => {
    const { HEALTH_TOOLS } = await import('../src/tools/health.js');
    const tool = HEALTH_TOOLS[0];

    expect(tool).toHaveProperty('name', 'check_system_health');
    expect(tool).toHaveProperty('description');
    expect(tool).toHaveProperty('inputSchema');
    expect(typeof tool.description).toBe('string');
    expect(tool.inputSchema).toHaveProperty('type', 'object');
    expect(tool.inputSchema.additionalProperties).toBe(false);
  });

  test('check_system_health description includes RELATED TOOLS', async () => {
    const { HEALTH_TOOLS } = await import('../src/tools/health.js');
    const tool = HEALTH_TOOLS[0];

    expect(tool.description).toContain('RELATED TOOLS');
  });

  test('handler is a function', async () => {
    const { HEALTH_HANDLERS } = await import('../src/tools/health.js');

    expect(typeof HEALTH_HANDLERS.check_system_health).toBe('function');
  });

  test('check_system_health is accessible via tool registry', async () => {
    const { getToolHandler } = await import('../src/lib/tool-registry.js');

    const handler = getToolHandler('check_system_health');
    expect(typeof handler).toBe('function');
  });
});
