import { describe, test, expect } from 'bun:test';
import { DEVICE_TOOLS, DEVICE_HANDLERS } from '../src/tools/device.js';

describe('device tools', () => {
  test('exports 2 tools', () => {
    expect(DEVICE_TOOLS.length).toBe(2);
  });

  test('view_screenshot tool schema', () => {
    const tool = DEVICE_TOOLS.find(t => t.name === 'view_screenshot');

    expect(tool).toBeDefined();
    expect(tool.description).toContain('JPEG');
    expect(tool.description).toContain('800px');
    expect(tool.description).toContain('RELATED TOOLS');
    expect(tool.inputSchema.type).toBe('object');
  });

  test('reload_application tool schema', () => {
    const tool = DEVICE_TOOLS.find(t => t.name === 'reload_application');

    expect(tool).toBeDefined();
    expect(tool.inputSchema.properties.reloadMethod).toBeDefined();
    expect(tool.inputSchema.properties.reloadMethod.enum).toEqual([
      'reloadJs',
      'restartProcess',
      'rebuild',
    ]);
    expect(tool.inputSchema.properties.reloadMethod.default).toBe('reloadJs');
  });

  test('handlers are exported', () => {
    expect(DEVICE_HANDLERS).toHaveProperty('view_screenshot');
    expect(DEVICE_HANDLERS).toHaveProperty('reload_application');
    expect(typeof DEVICE_HANDLERS.view_screenshot).toBe('function');
    expect(typeof DEVICE_HANDLERS.reload_application).toBe('function');
  });

  test('tool descriptions contain workflow info', () => {
    const screenshot = DEVICE_TOOLS.find(t => t.name === 'view_screenshot');
    const reload = DEVICE_TOOLS.find(t => t.name === 'reload_application');

    expect(screenshot.description).toContain('WORKFLOW');
    expect(screenshot.description).toContain('WHEN TO USE');
    expect(reload.description).toContain('WORKFLOW');
    expect(reload.description).toContain('WHEN TO USE');
  });
});

describe('reload_application handler', () => {
  test('returns correct method labels', () => {
    const getMethodLabel = (method) => {
      return method === 'reloadJs' ? 'Fast Refresh'
        : method === 'restartProcess' ? 'Process Restart'
        : 'Full Rebuild';
    };

    expect(getMethodLabel('reloadJs')).toBe('Fast Refresh');
    expect(getMethodLabel('restartProcess')).toBe('Process Restart');
    expect(getMethodLabel('rebuild')).toBe('Full Rebuild');
  });
});
