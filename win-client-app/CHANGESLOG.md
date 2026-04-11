# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version 0.2.0-dev.19 - [Unreleased]

### Added
- Dev Manifest URL setting in Settings page to configure auto-update server address

### Fixed
- Cancel sticky drag on double-click or right-click

## Version 0.2.0-dev.17

### Fixed
- Cancel drag when cursor is within 10px of the window border to prevent sticky drag (reverted — caused drag to stick at center)

## Version 0.2.0-dev.16

### Fixed
- Sticky drag root cause fixed: Neutralino's `setDraggableRegion` silently rejected re-registration (WeakMap guard); now correctly unsets before re-setting
- Menu no longer triggers window drag — `pointerdown` is stopped from bubbling to the drag region (CSS `--neu-non-draggable-region` is not implemented in this Neutralino version)

## Version 0.2.0-dev.15 - [Unreleased]

### Fixed
- "Advanced" tab no longer appears in the layout menu (not a real game role)
- Sticky drag fix attempt: draggable region re-evaluated after every render and on pointer release

## Version 0.2.0-dev.14 - [Unreleased]

### Added
- Layout menu items now filtered by role (layouts can belong to one, multiple, or all roles)
- Description bar at the bottom of the menu shows layout description on hover
- Favorites supported in "All" tab (independent from per-role favorites)
- Menu items use flexible sizing — no truncation, wrap to fit available width
- Menu test page (`test/menu.html`) for iterating on menu UI without running the full app
- Builtin layouts now include descriptions and role assignments

### Fixed
- Descriptions from builtin layouts now flow through the extension stream to the client menu

## Version 0.2.0-dev.13 - [Unreleased]

### Fixed
- Windows no longer close immediately after auto-update restart (kill signal is now cleared before process restarts)

## Version 0.2.0-dev.12 - [Unreleased]

### Fixed
- Menu font size increased from 11px to 13px for role tabs and layout names (more readable)
- Update dialog no longer appears twice in the same session (periodic checks now start after startup check completes)
- Window drag no longer sticks when mouse is released outside the window

## Version 0.2.0-dev.11 - [Unreleased]

### Changed
- Layout menu rendered via Mustache htmlTemplate instead of DOM-builder functions; re-renders cleanly on data updates

## Version 0.2.0-dev.1 - [Unreleased]

### Added
- Improved layout selector menu with search filter, role-based tabs, layout thumbnails, and favorites
- Role tabs populated dynamically from extension stream data
- Favorite layouts per role with star toggle (persisted in extension)
- ~~Live layout thumbnails rendered via Mustache in the menu grid~~

### Removed
- Mustache dependency — layout menu now shows layout names instead of rendered thumbnails

### Changed
- Layout menu now uses dark theme with card grid instead of simple text list

### Added
- Auto-update: checks for updates on startup and periodically, with manual check from tray menu

### Fixed
- Fix resource leaks: clear intervals and reconnect timers on window unload
- Fix WebSocket reconnect accumulation by tracking and clearing pending timeouts
- Fix overlapping poll executions with guard flags in message polling and receiveUpdates
- Fix duplicate layout action execution on re-render
- Replace forEach-async with sequential for-loop in window garbage collection

### Changed
- Reduce verbose console logging, add DEBUG flag for development
- Increase message poll interval from 100ms to 200ms

## Version 0.1.0 - 2025-07-29

### Added
- Lightweight Windows client app using Neutralino.js
- WebSocket connection to relay server for communication with chrome extension
- Multi-window support with game log reading
- Stream view rendering with layout system
- Settings window with log path configuration
- Minimize, menu, next, close button controls
- Automatic relay process launching
- Window position/size persistence and restore on relaunch
- Distribution as a zip with desktop shortcut creation
- Always-on-top window positioning within screen bounds
