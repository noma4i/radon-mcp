import { describe, test, expect } from 'bun:test';
import { DEVICE_TOOLS, DEVICE_HANDLERS } from '../src/tools/device.js';

describe('device tools', () => {
  test('exports 1 tool', () => {
    expect(DEVICE_TOOLS.length).toBe(1);
  });

  test('view_screenshot tool schema', () => {
    const tool = DEVICE_TOOLS.find(t => t.name === 'view_screenshot');

    expect(tool).toBeDefined();
    expect(tool.description).toContain('JPEG');
    expect(tool.description).toContain('800px');
    expect(tool.description).toContain('RELATED TOOLS');
    expect(tool.inputSchema.type).toBe('object');
  });

  test('reload_application is removed', () => {
    const tool = DEVICE_TOOLS.find(t => t.name === 'reload_application');
    expect(tool).toBeUndefined();
  });

  test('handlers are exported', () => {
    expect(DEVICE_HANDLERS).toHaveProperty('view_screenshot');
    expect(DEVICE_HANDLERS).not.toHaveProperty('reload_application');
    expect(typeof DEVICE_HANDLERS.view_screenshot).toBe('function');
  });

  test('tool descriptions contain workflow info', () => {
    const screenshot = DEVICE_TOOLS.find(t => t.name === 'view_screenshot');

    expect(screenshot.description).toContain('WORKFLOW');
    expect(screenshot.description).toContain('WHEN TO USE');
  });
});
