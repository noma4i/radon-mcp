# Radon MCP Server

MCP (Model Context Protocol) server for React Native debugging with Radon IDE integration.

## Overview

This server provides tools for debugging React Native applications through Claude Code and other MCP-compatible clients. It auto-detects Radon IDE instances and provides direct access to Metro bundler logs, simulator screenshots, and app reload functionality.

## Features

- **Metro Logs**: Access JavaScript console output with filtering and pagination
- **Screenshots**: Capture compressed JPEG screenshots from iOS Simulator
- **App Reload**: Fast Refresh, process restart, or full rebuild
- **npm Package Info**: Fetch package metadata and README from npm registry
- **Documentation Links**: Generate links to React Native and Expo documentation

## Requirements

- macOS (uses `xcrun simctl` and `sips` for screenshots)
- Bun 1.0+
- Radon IDE with running iOS Simulator
- React Native application with Metro bundler

## Installation

```bash
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
      "command": "bun",
      "args": ["/path/to/radon-mcp/dist/index.js"]
    }
  }
}
```

## Tools

### view_screenshot

Captures the current screen of iOS Simulator as a compressed JPEG (max 800px, ~50-100KB).

```
{}
```

### view_application_logs

Gets Metro bundler logs with filtering and pagination.

| Parameter | Type | Description |
|-----------|------|-------------|
| filter | string | Regex pattern to grep log lines (case-insensitive) |
| last | number | Return last N lines after filtering |

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

### reload_application

Reloads the React Native application.

| Parameter | Type | Description |
|-----------|------|-------------|
| reloadMethod | string | `reloadJs` (default), `restartProcess`, or `rebuild` |

```
// Fast Refresh (keeps state)
{}

// Full restart (clears state)
{reloadMethod: "restartProcess"}
```

### get_library_description

Fetches npm package information including metadata, dependencies, and README.

| Parameter | Type | Description |
|-----------|------|-------------|
| library_npm_name | string | npm package name (required) |
| readmeLimit | number | Max README characters (default: 5000) |

```
{library_npm_name: "react-native-reanimated"}
{library_npm_name: "expo-camera", readmeLimit: 1000}
```

### query_documentation

Generates links to React Native or Expo documentation.

| Parameter | Type | Description |
|-----------|------|-------------|
| text | string | Search query (required) |
| source | string | `react-native`, `expo`, or `both` (default) |

```
{text: "flatlist"}
{text: "camera", source: "expo"}
```

## Debugging Workflow

1. `view_screenshot` - See current UI state
2. `view_application_logs` - Check JS console for errors
3. Fix code
4. `reload_application` - Apply changes
5. Repeat

## Development

```bash
# Build
bun run build

# Watch mode
bun run build:watch

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
{content: [{type: 'text', text: '...'}]}

// Image response (screenshots)
{content: [{type: 'image', data: 'base64...', mimeType: 'image/jpeg'}]}
```

Log responses include a summary header:

```
[matched 42 of 1000, last 100 of 42 lines]

<log content>
```

## License

MIT
