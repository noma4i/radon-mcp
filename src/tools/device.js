import { getRadonContext } from '../lib/radon-detector.js';
import { captureScreenshot, reloadApp } from '../lib/device-bridge.js';
import { reloadMetro } from '../lib/metro-client.js';

export const DEVICE_TOOLS = [
  {
    name: 'view_screenshot',
    description: `Capture current screen of iOS Simulator.

Returns compressed JPEG image (max 800px, ~50-100KB) of device screen.

WHEN TO USE:
- START HERE for debugging - see current UI state
- Verify UI changes after code modifications
- Debug layout issues (positions, sizes, alignment)
- Confirm navigation state (which screen is active)
- See error screens, alerts, modals

WORKFLOW:
1. view_screenshot → see current state
2. view_application_logs → check JS console for errors
3. Fix code → reload_application
4. Repeat

RELATED TOOLS:
- view_application_logs: Check JS console after seeing UI issue
- reload_application: Apply changes and verify

NOTE: Requires Radon IDE with active iOS Simulator.`,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
    },
  },
  {
    name: 'reload_application',
    description: `Reload the React Native application.

METHODS:
- reloadJs (default): Fast Refresh - keeps component state, updates code
- restartProcess: Full restart - clears all state
- rebuild: Full Metro rebuild

WHEN TO USE:
- After code changes: reloadJs
- State is corrupted: restartProcess
- Metro cache issues: rebuild

WORKFLOW:
1. Make code changes
2. reload_application
3. view_screenshot → verify UI
4. view_application_logs → check for new errors

RELATED TOOLS:
- view_screenshot: Verify changes visually
- view_application_logs: Check for errors after reload`,
    inputSchema: {
      type: 'object',
      properties: {
        reloadMethod: {
          type: 'string',
          enum: ['reloadJs', 'restartProcess', 'rebuild'],
          description: 'Reload method. Default: reloadJs (Fast Refresh)',
          default: 'reloadJs',
        },
      },
    },
  },
];

export async function viewScreenshot() {
  const context = getRadonContext();

  if (!context.device) {
    return {
      content: [{ type: 'text', text: 'Could not capture a screenshot!\nNo Radon IDE device detected. Make sure Radon IDE is running with a simulator.' }],
    };
  }

  const result = await captureScreenshot(context.device.deviceId, context.device.deviceSet);

  if (result.success) {
    return {
      content: [{ type: 'image', data: result.base64, mimeType: result.mimeType }],
    };
  }

  return {
    content: [{ type: 'text', text: `Error capturing screenshot: ${result.error}` }],
  };
}

export async function reloadApplication(args) {
  const { reloadMethod = 'reloadJs' } = args;
  const context = getRadonContext();

  let metroResult = null;
  let deviceResult = null;

  // Try Metro reload first
  if (context.metroPort) {
    metroResult = await reloadMetro(context.metroPort);
  }

  // Also try device-level reload if we have a device
  if (context.device) {
    deviceResult = reloadApp(
      context.device.deviceId,
      context.device.deviceSet,
      reloadMethod
    );
  }

  if (!context.metroPort && !context.device) {
    return {
      content: [{ type: 'text', text: 'No Radon IDE or Metro detected. Make sure your app is running.' }],
    };
  }

  const success = metroResult?.success || deviceResult?.success || false;
  const methodLabel = reloadMethod === 'reloadJs' ? 'Fast Refresh' : reloadMethod === 'restartProcess' ? 'Process Restart' : 'Full Rebuild';

  if (success) {
    return {
      content: [{ type: 'text', text: `App reloaded successfully using ${methodLabel}.\n\nNEXT: Use view_screenshot to verify UI changes.` }],
    };
  }

  return {
    content: [{ type: 'text', text: `Failed to reload app using ${methodLabel}.` }],
  };
}

export const DEVICE_HANDLERS = {
  view_screenshot: viewScreenshot,
  reload_application: reloadApplication,
};
