# Radon MCP Server

MCP (Model Context Protocol) server for React Native debugging with Radon IDE integration.

## Overview

This server provides tools for debugging React Native applications through Claude Code and other MCP-compatible clients. It auto-detects Radon IDE instances and provides direct access to Metro bundler logs, simulator screenshots, and app reload functionality.

## Features

- **Metro Logs**: Access JavaScript console output with filtering and pagination
- **Screenshots**: Capture compressed JPEG screenshots from iOS Simulator
- **App Reload**: Fast Refresh, process restart, or full rebuild
- **System Health**: Diagnose Radon IDE and Metro bundler connectivity
- **Simulator Control**: Dark/light mode, status bar, URL/deeplinks, permissions, device info
- **npm Package Info**: Fetch package metadata and README from npm registry
- **Documentation Links**: Generate links to React Native and Expo documentation

## Requirements

- macOS (uses `xcrun simctl` and `sips` for screenshots)
- Bun 1.0+
- Radon IDE with running iOS Simulator
- React Native application with Metro bundler

## Installation

```bash
# Via npm (recommended)
npm install -g @noma4i/radon-mcp

# Or run directly with npx/bunx
npx @noma4i/radon-mcp
bunx @noma4i/radon-mcp

# From source
git clone https://github.com/noma4i/radon-mcp
cd radon-mcp
bun install
bun run build
```

## Configuration

Add to your Claude Code MCP configuration (`~/.claude.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "radon": {
      "command": "bunx",
      "args": ["@noma4i/radon-mcp@latest"]
    }
  }
}
```

Or with npx:

```json
{
  "mcpServers": {
    "radon": {
      "command": "npx",
      "args": ["@noma4i/radon-mcp@latest"]
    }
  }
}
```

## Tools

### Debugging

#### view_screenshot

Captures the current screen of iOS Simulator as a compressed JPEG (max 800px, ~50-100KB).

```
{}
```

#### view_application_logs

Gets Metro bundler logs with filtering and pagination.

| Parameter | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| filter    | string | Regex pattern to grep log lines (case-insensitive) |
| last      | number | Return last N lines after filtering                |

```
// All logs (first 50 + last 150 lines)
{}

// Last 50 lines
{last: 50}

// Filter errors
{filter: "error|Error"}

// Last 100 error lines
{filter: "error", last: 100}
```

#### reload_application

Reloads the React Native application.

| Parameter    | Type   | Description                                          |
| ------------ | ------ | ---------------------------------------------------- |
| reloadMethod | string | `reloadJs` (default), `restartProcess`, or `rebuild` |

```
// Fast Refresh (keeps state)
{}

// Full restart (clears state)
{reloadMethod: "restartProcess"}
```

#### check_system_health

Diagnoses Radon IDE and Metro bundler status. Returns system health as `healthy`, `degraded`, or `unavailable`.

```
{}
```

### Simulator Control

#### open_url

Opens a URL or deeplink in the iOS Simulator.

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| url       | string | URL or deeplink to open (required) |

```
{url: "myapp://profile/123"}
{url: "https://example.com"}
```

#### set_appearance

Switches iOS Simulator between dark and light mode.

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| mode      | string | `dark` or `light` (required) |

```
{mode: "dark"}
```

#### set_status_bar

Overrides iOS Simulator status bar for consistent screenshots.

| Parameter    | Type   | Description                    |
| ------------ | ------ | ------------------------------ |
| time         | string | Time to display (e.g., "9:41") |
| batteryLevel | number | Battery percentage (0-100)     |
| cellularBars | number | Cellular signal bars (0-4)     |
| wifiBars     | number | WiFi signal bars (0-3)         |

```
{time: "9:41", batteryLevel: 100, wifiBars: 3}
```

#### clear_status_bar

Resets iOS Simulator status bar to default values.

```
{}
```

#### set_privacy

Grants or revokes app permissions in iOS Simulator.

| Parameter | Type   | Description                                                               |
| --------- | ------ | ------------------------------------------------------------------------- |
| action    | string | `grant`, `revoke`, or `reset` (required)                                  |
| service   | string | Permission service: camera, photos, location, microphone, etc. (required) |
| bundleId  | string | App bundle identifier (required)                                          |

```
{action: "grant", service: "camera", bundleId: "com.mycompany.myapp"}
```

#### get_device_info

Returns information about the current iOS Simulator device (name, UDID, runtime, state).

```
{}
```

### Documentation

#### get_library_description

Fetches npm package information including metadata, dependencies, and README.

| Parameter        | Type   | Description                           |
| ---------------- | ------ | ------------------------------------- |
| library_npm_name | string | npm package name (required)           |
| readmeLimit      | number | Max README characters (default: 5000) |

```
{library_npm_name: "react-native-reanimated"}
{library_npm_name: "expo-camera", readmeLimit: 1000}
```

#### query_documentation

Generates links to React Native or Expo documentation.

| Parameter | Type   | Description                                 |
| --------- | ------ | ------------------------------------------- |
| text      | string | Search query (required)                     |
| source    | string | `react-native`, `expo`, or `both` (default) |

```
{text: "flatlist"}
{text: "camera", source: "expo"}
```

## Debugging Workflow

0. `check_system_health` - Verify Radon IDE and Metro connectivity
1. `view_screenshot` - See current UI state
2. `view_application_logs` - Check JS console for errors
3. Fix code
4. `reload_application` - Apply changes
5. Repeat from step 1

## Development

```bash
# Build
bun run build

# Run tests
bun test

# Start server
bun run start
```

## Testing

```bash
bun test
```

CI runs on GitHub Actions (macos-latest with Bun).

## Architecture

```
Claude Code <--MCP/stdio--> radon-mcp
                              |
         +--------------------+--------------------+
         |                    |                    |
         v                    v                    v
    npm registry        xcrun simctl         Metro HTTP API
```

The server auto-detects:

- **Device ID**: from `simulator-server-macos` process
- **Device Set**: Radon IDE Devices directory
- **Metro Port**: from process or port scan (8081, 50377)

## Output Format

All tools return MCP-compatible content:

```javascript
// Text response
{
  content: [{ type: 'text', text: '...' }];
}

// Image response (screenshots)
{
  content: [{ type: 'image', data: 'base64...', mimeType: 'image/jpeg' }];
}
```

Log responses include a summary header:

```
[matched 42 of 1000, last 100 of 42 lines]

<log content>
```

## License

MIT
