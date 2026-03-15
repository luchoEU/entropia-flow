# win-client-app - Agent Guidelines

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
