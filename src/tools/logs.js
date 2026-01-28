import { getRadonContext } from '../lib/radon-detector.js';
import { getDeviceLogs } from '../lib/device-bridge.js';
import { getMetroLogs, getMetroStatus } from '../lib/metro-client.js';
import { truncateLines, paginateLines, filterLines } from '../lib/pagination.js';

export const LOGS_TOOLS = [
  {
    name: 'view_application_logs',
    description: `View React Native application logs from Metro bundler and device simulator.

MODES:
- "auto" (default): Returns first 50 + last 150 lines with [SKIPPED N LINES] marker. Best for quick debugging.
- "paginate": Returns specific line range. Use offset/limit to navigate. Check hasMore in response for pagination.
- "search": Filters logs containing pattern (regex). Returns only matching lines.

WHEN TO USE EACH MODE:
- Start with auto mode to get overview
- Use search mode with filter:"error|warn|Error" to find issues
- Use paginate mode when you need to read specific log sections

EXAMPLES:
- Quick overview: {}
- Find errors: {mode: "search", filter: "error"}
- Read lines 100-200: {mode: "paginate", offset: 100, limit: 100}`,
    inputSchema: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          enum: ['metro', 'device', 'both'],
          description: 'Log source. "metro" = JS bundler logs, "device" = native simulator logs, "both" = all logs combined',
          default: 'both',
        },
        mode: {
          type: 'string',
          enum: ['auto', 'paginate', 'search'],
          description: 'Output mode. "auto" = first 50 + last 150 lines (default), "paginate" = use offset/limit, "search" = filter by pattern',
          default: 'auto',
        },
        filter: {
          type: 'string',
          description: 'Regex pattern to filter logs. In search mode returns only matching lines. In auto mode applied before truncation. Examples: "error", "warn|Error", "\\[Native\\]"',
        },
        offset: {
          type: 'number',
          description: 'Line offset for paginate mode. Start from this line number (0-based). Ignored in auto/search modes.',
          default: 0,
        },
        limit: {
          type: 'number',
          description: 'Max lines to return in paginate mode. Response includes hasMore:true if more lines available.',
          default: 200,
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds for log collection from device',
          default: 5000,
        },
      },
    },
  },
];

export async function viewApplicationLogs(args) {
  const { source = 'both', mode = 'auto', filter = '', offset = 0, limit = 200, timeout = 5000 } = args;
  const context = getRadonContext();

  if (!context.metroPort && !context.device) {
    return {
      content: [{ type: 'text', text: 'No Radon IDE or Metro detected. Make sure your app is running.' }],
    };
  }

  const parts = [];
  let rawLogs = '';

  // Get Metro status and logs
  if ((source === 'metro' || source === 'both') && context.metroPort) {
    const status = await getMetroStatus(context.metroPort);
    const logs = await getMetroLogs(context.metroPort, { timeout });

    let metroText = `=== METRO LOGS ===\nStatus: ${status.status}\nRunning: ${status.running}\n\n`;
    if (logs.success && logs.logs) {
      metroText += logs.logs;
    } else if (logs.error) {
      metroText += `Error: ${logs.error}`;
    } else {
      metroText += 'No logs available.';
    }
    rawLogs += metroText + '\n';
  }

  // Get device logs
  if ((source === 'device' || source === 'both') && context.device) {
    const logs = await getDeviceLogs(
      context.device.deviceId,
      context.device.deviceSet,
      { timeout, filter: '' } // Don't filter at collection level, we'll filter after
    );

    let deviceText = `=== DEVICE LOGS ===\nDevice: ${context.device.deviceId}\nPlatform: ${context.device.platform}\n\n`;

    if (logs && typeof logs === 'string') {
      deviceText += logs;
    } else if (logs?.logs) {
      deviceText += logs.logs;
    } else if (logs?.error) {
      deviceText += `Error: ${logs.error}`;
    } else {
      deviceText += 'No logs available.';
    }
    rawLogs += deviceText;
  }

  if (!rawLogs.trim()) {
    return {
      content: [{ type: 'text', text: 'No logs collected.' }],
    };
  }

  // Process logs based on mode
  let processedLogs;
  let metadata = {};

  if (mode === 'search' && filter) {
    const result = filterLines(rawLogs, filter);
    processedLogs = truncateLines(result.text);
    metadata = { mode: 'search', matched: result.matched, total: result.total };
  } else if (mode === 'paginate') {
    const result = paginateLines(rawLogs, offset, limit);
    processedLogs = result.text;
    metadata = { mode: 'paginate', offset: result.offset, limit: result.limit, total: result.total, hasMore: result.hasMore };
  } else {
    // auto mode
    if (filter) {
      const filtered = filterLines(rawLogs, filter);
      processedLogs = truncateLines(filtered.text);
      metadata = { mode: 'auto', truncated: filtered.text.split('\n').length > 200, filtered: true, matched: filtered.matched };
    } else {
      processedLogs = truncateLines(rawLogs);
      metadata = { mode: 'auto', truncated: rawLogs.split('\n').length > 200 };
    }
  }

  // Metadata in response for AI
  const responseText = `[${JSON.stringify(metadata)}]\n\n${processedLogs}`;

  parts.push({ type: 'text', text: responseText });

  return { content: parts };
}

export const LOGS_HANDLERS = {
  view_application_logs: viewApplicationLogs,
};
