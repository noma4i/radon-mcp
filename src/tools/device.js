import { getRadonContext } from '../lib/radon-detector.js';
import { captureScreenshot } from '../lib/device-bridge.js';

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
3. Fix code
4. Repeat

RELATED TOOLS:
- view_application_logs: Check JS console after seeing UI issue

NOTE: Requires Radon IDE with active iOS Simulator.`,
    inputSchema: {
      type: 'object',
      additionalProperties: false
    }
  }
];

export async function viewScreenshot() {
  const context = getRadonContext();

  if (!context.device) {
    return {
      content: [{ type: 'text', text: 'Could not capture a screenshot!\nNo Radon IDE device detected. Make sure Radon IDE is running with a simulator.' }]
    };
  }

  const result = await captureScreenshot(context.device.deviceId, context.device.deviceSet);

  if (result.success) {
    return {
      content: [{ type: 'image', data: result.base64, mimeType: result.mimeType }]
    };
  }

  return {
    content: [{ type: 'text', text: `Error capturing screenshot: ${result.error}` }]
  };
}

export const DEVICE_HANDLERS = {
  view_screenshot: viewScreenshot
};
