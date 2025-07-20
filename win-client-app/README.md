# Windows Client for Entropia Flow extension

This is a Windows client to enable more features for the extension. It is optional to have it installed.

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

1. `rsrc -ico app.ico`

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

1. `buildStream.bat`

### Build Client for testing

1. `neu run`

### Build Client For production

1. `neu build --release`

## Files to distribute

- `dist\EntropiaFlowClient\EntropiaFlowClient-win_x64.exe`
- `dist\EntropiaFlowClient\resources.neu`
- `go-websocket-relay\EntropiaFlowClient-relay.exe`
