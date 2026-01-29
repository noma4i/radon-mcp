import { describe, test, expect } from 'bun:test';

describe('simulator tools module', () => {
  test('exports SIMULATOR_TOOLS array', async () => {
    const module = await import('../src/tools/simulator.js');

    expect(Array.isArray(module.SIMULATOR_TOOLS)).toBe(true);
    expect(module.SIMULATOR_TOOLS.length).toBe(6);
  });

  test('exports SIMULATOR_HANDLERS object', async () => {
    const module = await import('../src/tools/simulator.js');

    expect(typeof module.SIMULATOR_HANDLERS).toBe('object');
    expect(Object.keys(module.SIMULATOR_HANDLERS).length).toBe(6);
  });

  test('all tools have required properties', async () => {
    const { SIMULATOR_TOOLS } = await import('../src/tools/simulator.js');

    for (const tool of SIMULATOR_TOOLS) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(typeof tool.inputSchema).toBe('object');
    }
  });

  test('all handlers are functions', async () => {
    const { SIMULATOR_HANDLERS } = await import('../src/tools/simulator.js');

    for (const [name, handler] of Object.entries(SIMULATOR_HANDLERS)) {
      expect(typeof handler).toBe('function');
    }
  });
});

describe('open_url tool', () => {
  test('has correct schema', async () => {
    const { SIMULATOR_TOOLS } = await import('../src/tools/simulator.js');
    const tool = SIMULATOR_TOOLS.find(t => t.name === 'open_url');

    expect(tool).toBeDefined();
    expect(tool.inputSchema.properties).toHaveProperty('url');
    expect(tool.inputSchema.required).toContain('url');
  });
});

describe('set_appearance tool', () => {
  test('has correct schema', async () => {
    const { SIMULATOR_TOOLS } = await import('../src/tools/simulator.js');
    const tool = SIMULATOR_TOOLS.find(t => t.name === 'set_appearance');

    expect(tool).toBeDefined();
    expect(tool.inputSchema.properties).toHaveProperty('mode');
    expect(tool.inputSchema.properties.mode.enum).toEqual(['dark', 'light']);
    expect(tool.inputSchema.required).toContain('mode');
  });
});

describe('set_status_bar tool', () => {
  test('has correct schema', async () => {
    const { SIMULATOR_TOOLS } = await import('../src/tools/simulator.js');
    const tool = SIMULATOR_TOOLS.find(t => t.name === 'set_status_bar');

    expect(tool).toBeDefined();
    expect(tool.inputSchema.properties).toHaveProperty('time');
    expect(tool.inputSchema.properties).toHaveProperty('batteryLevel');
    expect(tool.inputSchema.properties).toHaveProperty('cellularBars');
    expect(tool.inputSchema.properties).toHaveProperty('wifiBars');
  });
});

describe('clear_status_bar tool', () => {
  test('has correct schema', async () => {
    const { SIMULATOR_TOOLS } = await import('../src/tools/simulator.js');
    const tool = SIMULATOR_TOOLS.find(t => t.name === 'clear_status_bar');

    expect(tool).toBeDefined();
    expect(tool.inputSchema.additionalProperties).toBe(false);
  });
});

describe('set_privacy tool', () => {
  test('has correct schema', async () => {
    const { SIMULATOR_TOOLS } = await import('../src/tools/simulator.js');
    const tool = SIMULATOR_TOOLS.find(t => t.name === 'set_privacy');

    expect(tool).toBeDefined();
    expect(tool.inputSchema.properties).toHaveProperty('action');
    expect(tool.inputSchema.properties).toHaveProperty('service');
    expect(tool.inputSchema.properties).toHaveProperty('bundleId');
    expect(tool.inputSchema.properties.action.enum).toEqual(['grant', 'revoke', 'reset']);
    expect(tool.inputSchema.required).toContain('action');
    expect(tool.inputSchema.required).toContain('service');
    expect(tool.inputSchema.required).toContain('bundleId');
  });
});

describe('get_device_info tool', () => {
  test('has correct schema', async () => {
    const { SIMULATOR_TOOLS } = await import('../src/tools/simulator.js');
    const tool = SIMULATOR_TOOLS.find(t => t.name === 'get_device_info');

    expect(tool).toBeDefined();
    expect(tool.inputSchema.additionalProperties).toBe(false);
  });
});

describe('tool registry integration', () => {
  test('simulator tools are registered in ALL_TOOLS', async () => {
    const { ALL_TOOLS } = await import('../src/lib/tool-registry.js');

    const simulatorToolNames = [
      'open_url',
      'set_appearance',
      'set_status_bar',
      'clear_status_bar',
      'set_privacy',
      'get_device_info',
    ];

    for (const name of simulatorToolNames) {
      const tool = ALL_TOOLS.find(t => t.name === name);
      expect(tool).toBeDefined();
    }
  });

  test('simulator handlers are accessible via getToolHandler', async () => {
    const { getToolHandler } = await import('../src/lib/tool-registry.js');

    const simulatorToolNames = [
      'open_url',
      'set_appearance',
      'set_status_bar',
      'clear_status_bar',
      'set_privacy',
      'get_device_info',
    ];

    for (const name of simulatorToolNames) {
      const handler = getToolHandler(name);
      expect(typeof handler).toBe('function');
    }
  });
});
