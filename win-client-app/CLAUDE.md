# win-client-app - Agent Guidelines

## Architecture Principle

The win-client-app is a **stateless visualization layer**. It does not own application state — only the minimum needed to connect to the extension (WebSocket port, window position/size). All data (layouts, roles, favorites, settings) comes from the chrome extension via the stream. When the client needs to change state (e.g., toggle a favorite), it sends a message back to the extension which persists the change and sends updated data.

## Version Management

When bumping the version, update **all three files** to keep them in sync:

| File | Field |
|------|-------|
| `package.json:3` | `"version"` |
| `neutralino.config.json:4` | `"version"` |
| `CHANGESLOG.md` | Add new version header or update `[Unreleased]` tag |

`package-lock.json` updates automatically on next `npm install`.

## Changelog

Update `CHANGESLOG.md` when making user-facing changes (fixes, features, breaking changes). Follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. Add entries under the current `[Unreleased]` version section using categories: `Added`, `Changed`, `Fixed`, `Removed`.
