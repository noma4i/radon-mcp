import { getRadonContext } from '../lib/radon-detector.js';
import {
  openUrl,
  setAppearance,
  setStatusBar,
  clearStatusBar,
  setPrivacy,
  getDeviceInfo,
} from '../lib/device-bridge.js';

export const SIMULATOR_TOOLS = [
  {
    name: 'open_url',
    description: `Open a URL or deeplink in the iOS Simulator.

WHEN TO USE:
- Navigate to specific screen via deeplink
- Test URL handling in app
- Open external URLs

EXAMPLES:
- Deeplink: myapp://profile/123
- Web URL: https://example.com
- Settings: app-settings:

WORKFLOW:
1. open_url with deeplink
2. view_screenshot → verify navigation
3. view_application_logs → check for errors`,
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL or deeplink to open (e.g., myapp://screen, https://example.com)',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'set_appearance',
    description: `Switch iOS Simulator between dark and light mode.

WHEN TO USE:
- Test dark mode styling after UI changes
- Verify colors, contrast, icons in both themes
- Debug theme-specific issues

WORKFLOW:
1. set_appearance → dark
2. view_screenshot → verify dark mode UI
3. set_appearance → light
4. view_screenshot → compare`,
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['dark', 'light'],
          description: 'Appearance mode: dark or light',
        },
      },
      required: ['mode'],
    },
  },
  {
    name: 'set_status_bar',
    description: `Override iOS Simulator status bar for consistent screenshots.

WHEN TO USE:
- Standardize screenshots (time, battery, signal)
- App Store screenshots preparation
- Consistent visual testing

OPTIONS:
- time: Status bar time (e.g., "9:41")
- batteryLevel: 0-100
- cellularBars: 0-4
- wifiBars: 0-3

Use clear_status_bar to reset to default.`,
    inputSchema: {
      type: 'object',
      properties: {
        time: {
          type: 'string',
          description: 'Time to display (e.g., "9:41")',
        },
        batteryLevel: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Battery percentage (0-100)',
        },
        cellularBars: {
          type: 'number',
          minimum: 0,
          maximum: 4,
          description: 'Cellular signal bars (0-4)',
        },
        wifiBars: {
          type: 'number',
          minimum: 0,
          maximum: 3,
          description: 'WiFi signal bars (0-3)',
        },
      },
    },
  },
  {
    name: 'clear_status_bar',
    description: `Reset iOS Simulator status bar to default values.

Use after set_status_bar to restore normal status bar.`,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
    },
  },
  {
    name: 'set_privacy',
    description: `Grant or revoke app permissions in iOS Simulator.

WHEN TO USE:
- Test permission flows (camera, location, photos)
- Debug permission-denied scenarios
- Automate permission setup for testing

ACTIONS:
- grant: Give permission
- revoke: Remove permission
- reset: Reset to default

SERVICES:
camera, photos, location, microphone, contacts, calendar, reminders, etc.

EXAMPLE:
Grant camera access to com.myapp.bundle`,
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['grant', 'revoke', 'reset'],
          description: 'Permission action',
        },
        service: {
          type: 'string',
          enum: [
            'all', 'calendar', 'contacts-limited', 'contacts', 'location',
            'location-always', 'photos-add', 'photos', 'media-library',
            'microphone', 'motion', 'reminders', 'siri', 'camera'
          ],
          description: 'Permission service',
        },
        bundleId: {
          type: 'string',
          description: 'App bundle identifier (e.g., com.mycompany.myapp)',
        },
      },
      required: ['action', 'service', 'bundleId'],
    },
  },
  {
    name: 'get_device_info',
    description: `Get information about the current iOS Simulator device.

Returns:
- Device name and model
- iOS version (runtime)
- Device UDID
- Current state

WHEN TO USE:
- Understand testing context
- Debug device-specific issues
- Verify simulator configuration`,
    inputSchema: {
      type: 'object',
      additionalProperties: false,
    },
  },
];

export async function handleOpenUrl(args) {
  const context = getRadonContext();

  if (!context.device) {
    return {
      content: [{ type: 'text', text: 'No Radon IDE device detected. Make sure Radon IDE is running with a simulator.' }],
    };
  }

  const result = openUrl(context.device.deviceId, context.device.deviceSet, args.url);

  if (result.success) {
    return {
      content: [{ type: 'text', text: `Opened URL: ${args.url}\n\nNEXT: Use view_screenshot to verify navigation.` }],
    };
  }

  return {
    content: [{ type: 'text', text: `Failed to open URL: ${result.error}` }],
  };
}

export async function handleSetAppearance(args) {
  const context = getRadonContext();

  if (!context.device) {
    return {
      content: [{ type: 'text', text: 'No Radon IDE device detected. Make sure Radon IDE is running with a simulator.' }],
    };
  }

  const result = setAppearance(context.device.deviceId, context.device.deviceSet, args.mode);

  if (result.success) {
    return {
      content: [{ type: 'text', text: `Appearance set to ${args.mode} mode.\n\nNEXT: Use view_screenshot to verify theme changes.` }],
    };
  }

  return {
    content: [{ type: 'text', text: `Failed to set appearance: ${result.error}` }],
  };
}

export async function handleSetStatusBar(args) {
  const context = getRadonContext();

  if (!context.device) {
    return {
      content: [{ type: 'text', text: 'No Radon IDE device detected. Make sure Radon IDE is running with a simulator.' }],
    };
  }

  const result = setStatusBar(context.device.deviceId, context.device.deviceSet, args);

  if (result.success) {
    const changes = Object.entries(args)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return {
      content: [{ type: 'text', text: `Status bar updated: ${changes}\n\nNEXT: Use view_screenshot to see changes.` }],
    };
  }

  return {
    content: [{ type: 'text', text: `Failed to set status bar: ${result.error}` }],
  };
}

export async function handleClearStatusBar() {
  const context = getRadonContext();

  if (!context.device) {
    return {
      content: [{ type: 'text', text: 'No Radon IDE device detected. Make sure Radon IDE is running with a simulator.' }],
    };
  }

  const result = clearStatusBar(context.device.deviceId, context.device.deviceSet);

  if (result.success) {
    return {
      content: [{ type: 'text', text: 'Status bar reset to default values.' }],
    };
  }

  return {
    content: [{ type: 'text', text: `Failed to clear status bar: ${result.error}` }],
  };
}

export async function handleSetPrivacy(args) {
  const context = getRadonContext();

  if (!context.device) {
    return {
      content: [{ type: 'text', text: 'No Radon IDE device detected. Make sure Radon IDE is running with a simulator.' }],
    };
  }

  const result = setPrivacy(
    context.device.deviceId,
    context.device.deviceSet,
    args.action,
    args.service,
    args.bundleId
  );

  if (result.success) {
    return {
      content: [{ type: 'text', text: `Permission ${args.action}: ${args.service} for ${args.bundleId}\n\nNEXT: Reload app and test the permission flow.` }],
    };
  }

  return {
    content: [{ type: 'text', text: `Failed to set privacy: ${result.error}` }],
  };
}

export async function handleGetDeviceInfo() {
  const context = getRadonContext();

  if (!context.device) {
    return {
      content: [{ type: 'text', text: 'No Radon IDE device detected. Make sure Radon IDE is running with a simulator.' }],
    };
  }

  const result = getDeviceInfo(context.device.deviceId, context.device.deviceSet);

  if (result.success) {
    const { device } = result;
    const info = [
      `Name: ${device.name}`,
      `UDID: ${device.udid}`,
      `State: ${device.state}`,
      `Runtime: ${device.runtime}`,
      device.deviceTypeIdentifier ? `Type: ${device.deviceTypeIdentifier.split('.').pop()}` : null,
    ].filter(Boolean).join('\n');

    return {
      content: [{ type: 'text', text: `Device Information:\n\n${info}` }],
    };
  }

  return {
    content: [{ type: 'text', text: `Failed to get device info: ${result.error}` }],
  };
}

export const SIMULATOR_HANDLERS = {
  open_url: handleOpenUrl,
  set_appearance: handleSetAppearance,
  set_status_bar: handleSetStatusBar,
  clear_status_bar: handleClearStatusBar,
  set_privacy: handleSetPrivacy,
  get_device_info: handleGetDeviceInfo,
};
