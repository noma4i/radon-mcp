import { getRadonContext } from '../lib/radon-detector.js';
import { getMetroStatus } from '../lib/metro-client.js';

export const HEALTH_TOOLS = [
  {
    name: 'check_system_health',
    description: `Check Radon IDE and Metro bundler status.

Returns diagnostic information:
- Radon device: connected/disconnected/error
- Metro bundler: running/unreachable/error
- System: healthy/degraded/unavailable

WHEN TO USE:
- Before starting debug session
- When tools return errors
- To verify environment setup

RELATED TOOLS:
- view_screenshot: Requires Radon device
- view_application_logs: Requires Metro bundler`,
    inputSchema: {
      type: 'object',
      additionalProperties: false
    }
  }
];

export async function checkSystemHealth() {
  const context = getRadonContext();
  const diagnostics = {
    timestamp: new Date().toISOString(),
    radon: {
      status: 'unknown',
      deviceId: null,
      platform: null,
      error: null
    },
    metro: {
      status: 'unknown',
      port: null,
      error: null
    },
    system: 'unknown'
  };

  if (context.device) {
    diagnostics.radon.status = 'connected';
    diagnostics.radon.deviceId = context.device.deviceId;
    diagnostics.radon.platform = context.device.platform;
  } else if (context.errors?.device) {
    diagnostics.radon.status = 'error';
    diagnostics.radon.error = context.errors.device;
  } else {
    diagnostics.radon.status = 'disconnected';
  }

  if (context.metroPort) {
    const metroStatus = await getMetroStatus(context.metroPort);
    if (metroStatus.running) {
      diagnostics.metro.status = 'running';
      diagnostics.metro.port = context.metroPort;
    } else {
      diagnostics.metro.status = 'unreachable';
      diagnostics.metro.port = context.metroPort;
    }
  } else if (context.errors?.metro) {
    diagnostics.metro.status = 'error';
    diagnostics.metro.error = context.errors.metro;
  } else {
    diagnostics.metro.status = 'not_detected';
  }

  if (diagnostics.radon.status === 'connected' && diagnostics.metro.status === 'running') {
    diagnostics.system = 'healthy';
  } else if (diagnostics.radon.status === 'connected' || diagnostics.metro.status === 'running') {
    diagnostics.system = 'degraded';
  } else {
    diagnostics.system = 'unavailable';
  }

  let text = `=== System Health ===\n`;
  text += `Status: ${diagnostics.system.toUpperCase()}\n\n`;
  text += `Radon Device: ${diagnostics.radon.status}`;
  if (diagnostics.radon.deviceId) text += ` (${diagnostics.radon.deviceId})`;
  if (diagnostics.radon.error) text += ` - ${diagnostics.radon.error}`;
  text += `\n`;
  text += `Metro Bundler: ${diagnostics.metro.status}`;
  if (diagnostics.metro.port) text += ` (port ${diagnostics.metro.port})`;
  if (diagnostics.metro.error) text += ` - ${diagnostics.metro.error}`;
  text += `\n\n`;

  if (diagnostics.system === 'unavailable') {
    text += `TROUBLESHOOTING:\n`;
    text += `1. Open Radon IDE\n`;
    text += `2. Start iOS Simulator\n`;
    text += `3. Run your React Native app\n`;
    text += `4. Try check_system_health again\n`;
  }

  return { content: [{ type: 'text', text }] };
}

export const HEALTH_HANDLERS = {
  check_system_health: checkSystemHealth
};
