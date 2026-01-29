import { DOCS_TOOLS, DOCS_HANDLERS } from '../tools/docs.js';
import { DEVICE_TOOLS, DEVICE_HANDLERS } from '../tools/device.js';
import { LOGS_TOOLS, LOGS_HANDLERS } from '../tools/logs.js';
import { HEALTH_TOOLS, HEALTH_HANDLERS } from '../tools/health.js';
import { SIMULATOR_TOOLS, SIMULATOR_HANDLERS } from '../tools/simulator.js';

export const ALL_TOOLS = [
  ...DOCS_TOOLS,
  ...DEVICE_TOOLS,
  ...LOGS_TOOLS,
  ...HEALTH_TOOLS,
  ...SIMULATOR_TOOLS,
];

const ALL_HANDLERS = {
  ...DOCS_HANDLERS,
  ...DEVICE_HANDLERS,
  ...LOGS_HANDLERS,
  ...HEALTH_HANDLERS,
  ...SIMULATOR_HANDLERS,
};

export function getToolHandler(name) {
  return ALL_HANDLERS[name] || null;
}

export function getToolDefinitions() {
  return ALL_TOOLS;
}
