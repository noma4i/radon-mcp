import { getMetroLogs } from '../lib/metro-client.js';
import { getRadonContext } from '../lib/radon-detector.js';
import { truncateLinesWithSummary, filterLines, lastNLines } from '../lib/pagination.js';

export const LOGS_TOOLS = [
  {
    name: 'view_application_logs',
    description: `Get application logs from React Native app.

Reads Metro JS console logs via CDP WebSocket.

PARAMETERS:
- filter: Regex to grep specific lines FIRST (errors, warnings, component names)
- last: Then take last N lines from filtered result

ORDER: Raw logs → filter (if set) → last (if set) → truncate to 200 lines

OUTPUT INCLUDES:
- Summary header: [Showing X of Y lines, matched Z]
- Log content with [SKIPPED N LINES] marker if truncated

WHEN TO USE:
- After view_screenshot to debug visible issues
- Find JS errors: filter:"error|Error|exception"
- Recent activity: last:50
- Specific component: filter:"MyComponent"

RELATED TOOLS:
- view_screenshot: See current UI state first, then check logs

EXAMPLES:
- All logs: {} → first 50 + last 150 lines
- Last 50: {last: 50}
- Errors: {filter: "error|Error"}
- Recent errors: {filter: "error", last: 100}`,
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Regex pattern to grep log lines. Applied FIRST. Case-insensitive.'
        },
        last: {
          type: 'number',
          description: 'Take last N lines AFTER filtering. If not set, truncates to 200.'
        }
      }
    }
  }
];

export async function viewApplicationLogs(args) {
  const { filter, last } = args;

  const context = getRadonContext();

  if (!context.metroPort) {
    return {
      content: [{ type: 'text', text: 'Metro bundler not detected.\n\nTIP: Use check_system_health to diagnose.' }]
    };
  }

  const logs = await getMetroLogs(context.metroPort);

  if (!logs.success || !logs.logs) {
    return {
      content: [{ type: 'text', text: `Failed to get logs: ${logs.error || 'unknown error'}\n\nTIP: Use check_system_health to diagnose.` }]
    };
  }

  let output = logs.logs;
  let summaryParts = [];

  if (filter) {
    const result = filterLines(output, filter);
    output = result.text;
    summaryParts.push(`matched ${result.matched} of ${result.total}`);
  }

  if (last && last > 0) {
    const linesBefore = output.split('\n').length;
    output = lastNLines(output, last);
    if (linesBefore > last) {
      summaryParts.push(`last ${last} of ${linesBefore} lines`);
    }
  }

  if (!last) {
    const result = truncateLinesWithSummary(output);
    output = result.text;
    summaryParts.push(result.summary);
  }

  const summary = summaryParts.length > 0 ? `[${summaryParts.join(', ')}]\n\n` : '';

  return {
    content: [{ type: 'text', text: summary + output }]
  };
}

export const LOGS_HANDLERS = {
  view_application_logs: viewApplicationLogs
};
