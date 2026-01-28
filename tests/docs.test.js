import { describe, test, expect } from 'bun:test';
import { DOCS_TOOLS, DOCS_HANDLERS } from '../src/tools/docs.js';

describe('docs tools', () => {
  test('exports 2 tools', () => {
    expect(DOCS_TOOLS.length).toBe(2);
  });

  test('get_library_description tool schema', () => {
    const tool = DOCS_TOOLS.find(t => t.name === 'get_library_description');

    expect(tool).toBeDefined();
    expect(tool.inputSchema.required).toContain('library_npm_name');
    expect(tool.inputSchema.properties.readmeLimit.default).toBe(5000);
  });

  test('query_documentation tool schema', () => {
    const tool = DOCS_TOOLS.find(t => t.name === 'query_documentation');

    expect(tool).toBeDefined();
    expect(tool.inputSchema.required).toContain('text');
    expect(tool.inputSchema.properties.source.enum).toEqual(['react-native', 'expo', 'both']);
  });

  test('handlers are exported', () => {
    expect(DOCS_HANDLERS).toHaveProperty('get_library_description');
    expect(DOCS_HANDLERS).toHaveProperty('query_documentation');
    expect(typeof DOCS_HANDLERS.get_library_description).toBe('function');
    expect(typeof DOCS_HANDLERS.query_documentation).toBe('function');
  });
});

describe('getLibraryDescription', () => {
  test('returns error when library_npm_name is missing', async () => {
    const result = await DOCS_HANDLERS.get_library_description({});

    expect(result.content[0].text).toContain('Package name required');
  });
});

describe('queryDocumentation', () => {
  test('returns error when text is missing', async () => {
    const result = await DOCS_HANDLERS.query_documentation({});

    expect(result.content[0].text).toContain('text is required');
  });

  test('returns react-native URL', async () => {
    const result = await DOCS_HANDLERS.query_documentation({
      text: 'view',
      source: 'react-native',
    });

    expect(result.content[0].text).toContain('reactnative.dev');
    expect(result.content[0].text).not.toContain('expo.dev');
  });

  test('returns expo URL', async () => {
    const result = await DOCS_HANDLERS.query_documentation({
      text: 'camera',
      source: 'expo',
    });

    expect(result.content[0].text).toContain('expo.dev');
    expect(result.content[0].text).not.toContain('reactnative.dev');
  });

  test('returns both URLs by default', async () => {
    const result = await DOCS_HANDLERS.query_documentation({
      text: 'navigation',
    });

    expect(result.content[0].text).toContain('reactnative.dev');
    expect(result.content[0].text).toContain('expo.dev');
  });
});
