import { DOCS_TOOLS, DOCS_HANDLERS } from '../tools/docs.js';
import { DEVICE_TOOLS, DEVICE_HANDLERS } from '../tools/device.js';
import { LOGS_TOOLS, LOGS_HANDLERS } from '../tools/logs.js';
import { COMPONENT_TOOLS, COMPONENT_HANDLERS } from '../tools/components.js';

export const ALL_TOOLS = [
  ...DOCS_TOOLS,
  ...DEVICE_TOOLS,
  ...LOGS_TOOLS,
  ...COMPONENT_TOOLS,
];

const ALL_HANDLERS = {
  ...DOCS_HANDLERS,
  ...DEVICE_HANDLERS,
  ...LOGS_HANDLERS,
  ...COMPONENT_HANDLERS,
};

export function getToolHandler(name) {
  return ALL_HANDLERS[name] || null;
}

export function getToolDefinitions() {
  return ALL_TOOLS;
}
