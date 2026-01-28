import { describe, test, expect } from 'bun:test';
import { ALL_TOOLS, getToolHandler, getToolDefinitions } from '../src/lib/tool-registry.js';

describe('tool-registry', () => {
  test('exports 6 tools', () => {
    expect(ALL_TOOLS.length).toBe(6);
  });

  test('all tools have required fields', () => {
    for (const tool of ALL_TOOLS) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(tool.inputSchema).toHaveProperty('type', 'object');
    }
  });

  test('tool names are unique', () => {
    const names = ALL_TOOLS.map(t => t.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  test('getToolHandler returns handler for valid tool', () => {
    const handler = getToolHandler('view_application_logs');
    expect(typeof handler).toBe('function');
  });

  test('getToolHandler returns null for invalid tool', () => {
    const handler = getToolHandler('nonexistent_tool');
    expect(handler).toBeNull();
  });

  test('getToolDefinitions returns all tools', () => {
    const defs = getToolDefinitions();
    expect(defs).toBe(ALL_TOOLS);
  });

  test('expected tools are registered', () => {
    const toolNames = ALL_TOOLS.map(t => t.name);

    expect(toolNames).toContain('view_screenshot');
    expect(toolNames).toContain('view_application_logs');
    expect(toolNames).toContain('reload_application');
    expect(toolNames).toContain('get_library_description');
    expect(toolNames).toContain('query_documentation');
    expect(toolNames).toContain('check_system_health');
  });

  test('view_application_logs has filter and last params', () => {
    const tool = ALL_TOOLS.find(t => t.name === 'view_application_logs');
    const props = tool.inputSchema.properties;

    expect(props).toHaveProperty('filter');
    expect(props).toHaveProperty('last');
    expect(props.filter.type).toBe('string');
    expect(props.last.type).toBe('number');
  });

  test('reload_application has reloadMethod param', () => {
    const tool = ALL_TOOLS.find(t => t.name === 'reload_application');
    const props = tool.inputSchema.properties;

    expect(props).toHaveProperty('reloadMethod');
    expect(props.reloadMethod.enum).toContain('reloadJs');
    expect(props.reloadMethod.enum).toContain('restartProcess');
    expect(props.reloadMethod.enum).toContain('rebuild');
  });

  test('get_library_description requires library_npm_name', () => {
    const tool = ALL_TOOLS.find(t => t.name === 'get_library_description');

    expect(tool.inputSchema.required).toContain('library_npm_name');
  });

  test('tool descriptions include RELATED TOOLS section', () => {
    const toolsWithRelated = [
      'view_screenshot',
      'view_application_logs',
      'reload_application',
      'get_library_description',
      'query_documentation',
    ];

    for (const name of toolsWithRelated) {
      const tool = ALL_TOOLS.find(t => t.name === name);
      expect(tool.description).toContain('RELATED TOOLS');
    }
  });
});
