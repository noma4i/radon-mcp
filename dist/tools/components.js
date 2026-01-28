import { getRadonContext } from '../lib/radon-detector.js';
import { getMetroStatus } from '../lib/metro-client.js';

export const COMPONENT_TOOLS = [
  {
    name: 'view_component_tree',
    description: 'View the React component tree structure of the running app',
    inputSchema: {
      type: 'object',
      properties: {
        depth: {
          type: 'number',
          description: 'Maximum depth to display (default: 5)',
          default: 5,
        },
      },
    },
  },
];

export async function viewComponentTree(args) {
  const { depth = 5 } = args;
  const context = getRadonContext();

  if (!context.metroPort) {
    return {
      content: [{ type: 'text', text: 'Metro bundler not detected. Make sure your React Native app is running.' }],
    };
  }

  const status = await getMetroStatus(context.metroPort);

  if (!status.running) {
    return {
      content: [{ type: 'text', text: 'Metro bundler is not responding.' }],
    };
  }

  // Note: Full component tree requires React DevTools WebSocket connection
  // For now, return Metro status and guidance
  let text = `=== Component Tree ===\n`;
  text += `Metro Port: ${context.metroPort}\n`;
  text += `Metro Status: ${status.status}\n`;

  if (context.device) {
    text += `Device: ${context.device.deviceId}\n`;
    text += `Platform: ${context.device.platform}\n`;
  }

  text += `\nRequested Depth: ${depth}\n`;
  text += `\nNote: Component tree inspection requires React DevTools connection.\n`;
  text += `Use view_screenshot for visual debugging or view_application_logs for console output.\n`;
  text += `For full component inspection, enable React DevTools in your app.`;

  return {
    content: [{ type: 'text', text }],
  };
}

export const COMPONENT_HANDLERS = {
  view_component_tree: viewComponentTree,
};
