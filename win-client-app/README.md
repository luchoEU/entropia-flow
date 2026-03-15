# Windows Client for Entropia Flow extension

This is a Windows client to enable more features for the extension. It is optional to have it installed.

## Quick Setup (Windows VM)

Run the setup script to check and install all build prerequisites:

```
dev-setup
```

Or directly: `powershell -ExecutionPolicy Bypass -File dev-setup.ps1`

This will check for Git, Node.js, Go, Neutralino CLI, and rsrc — and offer to install any that are missing via `winget`. After setup, run `npm run pack` to build everything.

### Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| Git | Source control | `winget install Git.Git` |
| Node.js LTS | TypeScript/Webpack build | `winget install OpenJS.NodeJS.LTS` |
| Go 1.24.5+ | Build relay (Windows API) | `winget install GoLang.Go` |
| Neutralino CLI | Build desktop app | `npm install -g @neutralinojs/neu` |
| rsrc | Embed icon in relay exe | `go install github.com/akavel/rsrc@latest` |

## Features

- Reads game log in real time and sends it to the extension
- Shows 1 or more Stream View as overlay
- It has a tray icon

## Go: client backend

- Relays messages from Client to Extension and back
- Reads the game log
- Get the screen sizes on the system

### Relay Setup

1. [https://go.dev/dl/]

1. `cd go-websocket-relay`

1. `go install github.com/akavel/rsrc@latest`

### Relay for testing

1. `go run .`

### Relay for production

1. `go build -ldflags="-s -w" .`

## Neutralino: client frontend

- Provides the UI for stream view and settings
- Adds a tray icon.

### Client Setup

1. `npm install -g @neutralinojs/neu`

1. `neu update`

1. `npm run build-stream`

### Build Client for testing

1. `neu run`

### Build Client For production

1. `neu build --release`

## Files to distribute

- `dist\EntropiaFlowClient\EntropiaFlowClient-win_x64.exe`
- `dist\EntropiaFlowClient\resources.neu`
- `go-websocket-relay\EntropiaFlowClient-relay.exe`

## Build for Distribution

1. `npm run pack`

1. This will create `dist\EntropiaFlowClient.zip`
