# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# Version 0.2.0-dev.64 - [Unreleased]

### Fixed
- Manual About update checks now always run the update check instead of silently bailing when another window holds the shared auto-update lock

## Version 0.2.0-dev.63 - [Unreleased]

### Changed
- Bumped the Windows client dev version for the next auto-update build

## Version 0.2.0-dev.62 - [Unreleased]

### Fixed
- Update dialog lock now clears stale entries from previous app sessions and is released before starting install, so auto-update prompts and manual About updates work again

## Version 0.2.0-dev.61 - [Unreleased]

### Changed
- Bumped the Windows client dev version for the next auto-update build

## Version 0.2.0-dev.60 - [Unreleased]

### Changed
- Bumped the Windows client dev version for the next auto-update build

## Version 0.2.0-dev.59 - [Unreleased]

### Changed
- Bumped the Windows client dev version for the next auto-update build

## Version 0.2.0-dev.58 - [Unreleased]

### Added
- Stream windows now include a dedicated background button next to the layout button so the displayed background can be cycled directly from the Windows client

## Version 0.2.0-dev.57 - [Unreleased]

### Added
- Settings now includes a DevTools toggle that enables the inspector for newly opened client windows

### Fixed
- Overlay expanded state no longer collapses on each stream render — `render()` now uses `classList.toggle` instead of replacing `className`, preserving the expanded class
- Close button now appears on hover over the stream window itself instead of only when hovering the top-left minimize icon

## Version 0.2.0-dev.54 - [Unreleased]

### Changed
- Small minimize button now appears only on layout hover (hidden when not hovering), matching close button behavior

## Version 0.2.0-dev.53 - [Unreleased]

### Fixed
- Update dev server URL updated to current Mac IP (192.168.0.21)

## Version 0.2.0-dev.52 - [Unreleased]

### Changed
- Overlay buttons are now hidden by default; only a small minimize indicator (10×10px) is visible in the top-left corner. Hovering it expands all three buttons to full size. Buttons collapse back when the mouse leaves the layout area.

## Version 0.2.0-dev.51 - [Unreleased]

### Fixed
- OCR text no longer flashes — last recognized text is preserved across stream re-renders by storing it in `_lastOcrText` and re-injecting it into the DOM after each render

## Version 0.2.0-dev.50 - [Unreleased]

### Fixed
- OCR calibration only adjusts the capture offset (x, y), not the size — width and height stay fixed from the div bounds

## Version 0.2.0-dev.49 - [Unreleased]

### Fixed
- OCR calibration is now one-shot: applies the border correction once per layout activation and stops — previously multiple in-flight responses could stack adjustments and shrink the capture to a few pixels

## Version 0.2.0-dev.48 - [Unreleased]

### Fixed
- OCR red-border detection completely redesigned: instead of scanning from the image edge (which fails when the capture includes dark pixels before the border), now scans the entire image for the first row/column with ≥50% red pixels — correctly detects the border regardless of offset and returns the exact crop needed to reach the content area

## Version 0.2.0-dev.47 - [Unreleased]

### Fixed
- OCR red-border detection threshold changed from 100% to 80% — CSS borders are solid but corner pixels may not be perfectly red due to rendering; game content won't reach 80% of a full column
- OCR coordinate adjustment capped at 10px per side to prevent runaway shrinking if detection keeps firing

## Version 0.2.0-dev.46 - [Unreleased]

### Fixed
- Binary download now uses `Start-Process` inside PowerShell to truly detach the download subprocess — `cmd /c start /B` could silently fail with no console attached
- Download progress window now shows the actual error message if the download fails or doesn't start within 15 seconds (previously showed a frozen "0%" forever)

## Version 0.2.0-dev.45 - [Unreleased]

### Fixed
- Multiple update dialogs and multiple download windows opening simultaneously — once the user confirms an update, periodic checks are stopped immediately and no further dialogs or downloads can start

## Version 0.2.0-dev.44 - [Unreleased]

### Changed
- Default dev manifest URL changed from `localhost:9147` to `192.168.0.47:9147`

## Version 0.2.0-dev.43 - [Unreleased]

### Fixed
- OCR red-border detection now requires the entire pixel column/row to be red (not just one pixel) — prevents game content with scattered red pixels from triggering false border detections and shrinking the capture region to nothing
- OCR capture region has a safety floor: if accumulated adjustments would reduce the region below 20px in either dimension, calibration resets

## Version 0.2.0-dev.42 - [Unreleased]

### Fixed
- Binary update download was blocking the JS thread (progress bar frozen at 0%) because `{ background: true }` is not a real Neutralino API option; now uses `cmd /c start "" /B` to truly detach the PowerShell download process
- DevTools inspector disabled again

## Version 0.2.0-dev.41 - [Unreleased]

### Fixed
- OCR capture self-calibrates: relay detects red border pixels in the captured image, crops them before OCR, and returns the offsets so JS adjusts future capture coordinates — converges in 1-2 frames

## Version 0.2.0-dev.40 - [Unreleased]

### Changed
- DevTools (inspector) enabled for debugging

## Version 0.2.0-dev.39 - [Unreleased]

### Reverted
- OCR scanner layout grid rows back to `1fr 20px 20px`

## Version 0.2.0-dev.38 - [Unreleased]

### Fixed
- Dev manifest URL was lost after every update — `getManifestUrl()` now reads `devManifestUrl` directly from storage on each check instead of relying on a one-time init variable that could be set before Neutralino storage was ready

## Version 0.2.0-dev.37 - [Unreleased]

### Fixed
- OCR capture coordinates now account for Windows DPI scaling: CSS logical pixels from `getBoundingClientRect()` are multiplied by `devicePixelRatio` before being sent as physical screen coordinates to the relay

## Version 0.2.0-dev.36 - [Unreleased]

### Fixed
- Binary update from tray "Version" menu was still opening the browser download page instead of auto-downloading

### Changed
- Binary update now shows a small progress window with a download progress bar (streams the zip via .NET HttpWebRequest, reports % every 500 ms)

## Version 0.2.0-dev.35 - [Unreleased]

### Fixed
- Binary update was never triggered for relay changes since dev.29 — `binaryVersion` in update-manifest.json was not being synced from `clientBinaryVersion`; zip.js now syncs it automatically on every build

### Changed
- OCR relay now saves each captured image to `ocr_preview.png` next to the relay exe for debugging (overwritten each scan)
- Removed OCR test panel from Settings

## Version 0.2.0-dev.32 - [Unreleased]

### Added
- Continuous OCR scanning loop: the `entropiaflow.client.ocr` stream layout captures the `.area` region every second and sends recognized text back to the chrome extension via `ocr_result`

## Version 0.2.0-dev.31 - [Unreleased]

### Added
- OCR test panel in Settings: enter screen region coordinates (X/Y/W/H), click Run OCR, see the recognized text

## Version 0.2.0-dev.30 - [Unreleased]

### Changed
- Binary updates now download and install automatically instead of opening a browser download page

## Version 0.2.0-dev.29 - [Unreleased]

### Added
- OCR support via Tesseract sidecar: relay can now capture a screen region and return recognized text (`ocr_request` / `ocr_response` messages)

## Version 0.2.0-dev.28 - [Unreleased]

### Changed
- Settings window restyled to match the chrome extension design system: white cards on a light background, uppercase section titles, material-tinted Save button, and Unicode copy icons in place of the PNG glyph

## Version 0.2.0-dev.27 - [Unreleased]

### Changed
- Update check failure dialog now offers a Yes/No prompt to copy the full error message (including URL) to the clipboard
- Dev update manifest server address changed from `192.168.0.20` back to `localhost`

## Version 0.2.0-dev.26 - [Unreleased]

### Fixed
- Rolled back drag handle button; whole window is draggable again, with a 5px edge exclusion margin that cancels any ongoing drag when the cursor approaches the window border (prevents `pointerup` from being lost)

## Version 0.2.0-dev.25 - [Unreleased]

### Changed
- Update check failure dialog now includes the manifest URL that was attempted, to help diagnose misconfigured dev/prod manifest endpoints

## Version 0.2.0-dev.24 - [Unreleased]

### Fixed
- Sticky drag after releasing the mouse — replaced whole-window drag with an explicit drag-handle button that appears on hover alongside the other nav controls

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
