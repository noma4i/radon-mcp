import { getRadonContext } from '../lib/radon-detector.js';
import { captureScreenshot, reloadApp } from '../lib/device-bridge.js';
import { reloadMetro } from '../lib/metro-client.js';

export const DEVICE_TOOLS = [
  {
    name: 'view_screenshot',
    description: 'Capture a screenshot of the current app state on the simulator',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'reload_application',
    description: 'Reload the React Native application',
    inputSchema: {
      type: 'object',
      properties: {
        reloadMethod: {
          type: 'string',
          enum: ['reloadJs', 'restartProcess', 'rebuild'],
          description: 'Reload method: reloadJs (fast refresh), restartProcess (restart app), or rebuild (full rebuild)',
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
      content: [{ type: 'image', data: result.base64, mimeType: 'image/png' }],
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
      content: [{ type: 'text', text: `App reloaded successfully using ${methodLabel}.` }],
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
