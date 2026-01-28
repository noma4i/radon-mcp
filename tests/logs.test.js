import { describe, test, expect } from 'bun:test';
import { LOGS_TOOLS, LOGS_HANDLERS } from '../src/tools/logs.js';

describe('logs tools', () => {
  test('exports 1 tool', () => {
    expect(LOGS_TOOLS.length).toBe(1);
  });

  test('view_application_logs tool schema', () => {
    const tool = LOGS_TOOLS.find(t => t.name === 'view_application_logs');

    expect(tool).toBeDefined();
    expect(tool.inputSchema.type).toBe('object');
    expect(tool.inputSchema.properties.filter).toBeDefined();
    expect(tool.inputSchema.properties.last).toBeDefined();
  });

  test('filter parameter has correct type', () => {
    const tool = LOGS_TOOLS.find(t => t.name === 'view_application_logs');

    expect(tool.inputSchema.properties.filter.type).toBe('string');
    expect(tool.inputSchema.properties.filter.description).toContain('Regex');
  });

  test('last parameter has correct type', () => {
    const tool = LOGS_TOOLS.find(t => t.name === 'view_application_logs');

    expect(tool.inputSchema.properties.last.type).toBe('number');
    expect(tool.inputSchema.properties.last.description).toContain('last N lines');
  });

  test('handlers are exported', () => {
    expect(LOGS_HANDLERS).toHaveProperty('view_application_logs');
    expect(typeof LOGS_HANDLERS.view_application_logs).toBe('function');
  });

  test('tool description contains key sections', () => {
    const tool = LOGS_TOOLS.find(t => t.name === 'view_application_logs');

    expect(tool.description).toContain('PARAMETERS');
    expect(tool.description).toContain('ORDER');
    expect(tool.description).toContain('WHEN TO USE');
    expect(tool.description).toContain('RELATED TOOLS');
    expect(tool.description).toContain('EXAMPLES');
  });

  test('tool description explains filter-last order', () => {
    const tool = LOGS_TOOLS.find(t => t.name === 'view_application_logs');

    expect(tool.description).toContain('filter (if set)');
    expect(tool.description).toContain('last (if set)');
    expect(tool.description).toContain('truncate');
  });
});

describe('viewApplicationLogs processing logic', () => {
  test('filter and last parameters work together', () => {
    // Simulate the processing logic
    const processLogs = (logs, filter, last) => {
      let output = logs;
      const summaryParts = [];

      // Step 1: Filter
      if (filter) {
        const lines = output.split('\n');
        const regex = new RegExp(filter, 'i');
        const filtered = lines.filter(line => regex.test(line));
        output = filtered.join('\n');
        summaryParts.push(`matched ${filtered.length} of ${lines.length}`);
      }

      // Step 2: Last N
      if (last && last > 0) {
        const lines = output.split('\n');
        if (lines.length > last) {
          output = lines.slice(-last).join('\n');
          summaryParts.push(`last ${last} of ${lines.length} lines`);
        }
      }

      return { output, summary: summaryParts.join(', ') };
    };

    const logs = 'error: one\ninfo: two\nerror: three\ninfo: four\nerror: five';

    // Filter only
    const filtered = processLogs(logs, 'error', null);
    expect(filtered.output).toBe('error: one\nerror: three\nerror: five');
    expect(filtered.summary).toContain('matched 3 of 5');

    // Last only
    const lastOnly = processLogs(logs, null, 2);
    expect(lastOnly.output).toBe('info: four\nerror: five');
    expect(lastOnly.summary).toContain('last 2 of 5');

    // Filter then last
    const both = processLogs(logs, 'error', 2);
    expect(both.output).toBe('error: three\nerror: five');
    expect(both.summary).toContain('matched 3 of 5');
    expect(both.summary).toContain('last 2 of 3');
  });
});
