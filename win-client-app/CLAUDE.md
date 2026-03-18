# win-client-app - Agent Guidelines

## Architecture Principle

The win-client-app is a **stateless visualization layer**. It does not own application state — only the minimum needed to connect to the extension (WebSocket port, window position/size). All data (layouts, roles, favorites, settings) comes from the chrome extension via the stream. When the client needs to change state (e.g., toggle a favorite), it sends a message back to the extension which persists the change and sends updated data.

## Version Management

When bumping the version, update **all three files** to keep them in sync:

| File | Field |
|------|-------|
| `package.json:3` | `"version"` |
| `neutralino.config.json:4` | `"version"` |
| `src/const.ts:2` | `clientVersion` |
| `src/tray.ts:54` | Copyright year in About dialog |
| `CHANGESLOG.md` | Add new version header or update `[Unreleased]` tag |

`package-lock.json` updates automatically on next `npm install`.

## Building

This project must be built on Windows. To trigger a build from macOS, run:

```bash
bash win-client-app/script/build-trigger.sh
```

This requires `script/build-server.bat` (or `build-server.ps1`) to be running on the Windows VM. The build server watches for a `.build-trigger` file via the Parallels shared folder (`Y:` drive), runs `npm run pack`, and writes the result back to `.build-result` and `.build-log`. The built zip appears at `dist/EntropiaFlowClient.zip`.

## Auto-Update

The `update-manifest.json` file controls what version clients see as available. **Only update the manifest after the corresponding binary/resources are uploaded and accessible** at the URLs specified in `resourcesURL` and `binaryURL`. If the manifest is updated before the files are available, clients will detect an update but fail to download it.

### Testing auto-update with dev builds

To test auto-update locally, use a two-step workflow:

1. **Install the "old" build** — deploy the current zip to the Windows VM and run it
2. **Bump version + rebuild + update manifest** — bump the version in `package.json`, `neutralino.config.json`, `src/const.ts` (and changelog), rebuild via `build-trigger.sh`, then update `update-manifest.json` to the new version. The `resources.neu` in `dist/` is already served by the dev server at `resourcesURL`, so the running "old" client will detect and auto-update to the new version within the dev check interval (30s).

## "auto" Command

When the user says **"auto"**, it means: bump the dev version, rebuild via `build-trigger.sh`, and update `update-manifest.json` so the running client auto-updates. Specifically:

1. Bump the dev version (e.g., `0.2.0-dev.9` → `0.2.0-dev.10`) in `package.json`, `neutralino.config.json`, and `src/const.ts`
2. Update `CHANGESLOG.md` with any new entries
3. Trigger the build: `bash win-client-app/script/build-trigger.sh`
4. After build succeeds, update `update-manifest.json` to the new version

## Changelog

Update `CHANGESLOG.md` when making user-facing changes (fixes, features, breaking changes). Follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. Add entries under the current `[Unreleased]` version section using categories: `Added`, `Changed`, `Fixed`, `Removed`.
