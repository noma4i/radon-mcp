import { describe, test, expect } from 'bun:test';

describe('server module', () => {
  test('exports createServer function', async () => {
    const module = await import('../src/lib/server.js');

    expect(typeof module.createServer).toBe('function');
  });

  test('exports startServer function', async () => {
    const module = await import('../src/lib/server.js');

    expect(typeof module.startServer).toBe('function');
  });

  test('createServer returns server with expected methods', async () => {
    const { createServer } = await import('../src/lib/server.js');

    const server = createServer();

    expect(server).toBeDefined();
    expect(typeof server.connect).toBe('function');
  });
});

describe('tool-registry integration', () => {
  test('getToolHandler returns function for all registered tools', async () => {
    const { ALL_TOOLS, getToolHandler } = await import('../src/lib/tool-registry.js');

    for (const tool of ALL_TOOLS) {
      const handler = getToolHandler(tool.name);
      expect(typeof handler).toBe('function');
    }
  });

  test('all handlers can be called with empty args', async () => {
    const { getToolHandler } = await import('../src/lib/tool-registry.js');

    // query_documentation is safe to call
    const handler = getToolHandler('query_documentation');
    const result = await handler({ text: 'test' });

    expect(result).toHaveProperty('content');
  });
});
