# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Read AGENTS.md First

**ALWAYS** read `/Users/cristian/Documents/ME/dev/entropia-flow/AGENTS.md` before starting any work. Key rules:
- **Never use `git add` or `git commit`** — provide the commit message to the user and let them commit manually
- Explain errors with chain of reasoning + source links (file:line)
- Do not commit until user explicitly confirms changes work
- Follow the AAA (Arrange-Act-Assert) pattern for tests with clear section delimiters

## Build & Development Commands

All commands run from `chrome-extension/` directory:

```bash
npm run build          # Dev build (webpack.dev.js)
npm run build:prod     # Production build (minified, creates dist.zip)
npm run watch          # Dev build in watch mode
npm test               # Run all tests (Jest)
npm test -- --watch    # Watch mode for tests
npm test -- path/to/file.test.ts  # Run a single test file
```

### Stream (Windows Client) builds
```bash
npm run stream         # Production stream build
npm run stream-dev     # Dev stream build
```

Schema generation (`build:schema`) runs automatically as a prebuild step.

## Features

See [FEATURES.md](FEATURES.md) for a comprehensive list of all 13 pages, navigation system, background services, content script, and stream overlay features.

## Architecture

### Chrome Extension Structure (3 entry points)

Defined in `webpack.common.js`:

1. **`src/view/index.tsx`** → `dist/view.js` — The popup UI (React app)
2. **`src/background/background.ts`** → `dist/background.js` — Service worker handling Chrome messaging, inventory processing, and state management
3. **`src/content/content-entropia-flow.ts`** → `dist/content-entropia-flow.js` — Content script injected into Entropia Universe web pages to read inventory/balance data

### View Layer (React + Jotai)

- **State management**: Jotai atoms in `src/view/application/atoms/` (137+ atoms, fully migrated from Redux)
- **State definitions**: `src/view/application/state/` — TypeScript interfaces for domain state
- **Business logic**: `src/view/application/helpers/` — Pure functions for calculations, sorting, diffing
- **Components**: `src/view/components/` — React components organized by page/feature
- **Routing**: React Router (HashRouter) with tabs defined in `Content.tsx`
- **Bridges**: `src/view/components/bridges/` — Components that sync background state into Jotai atoms via Chrome messaging

### Communication Flow

Background ↔ View communication uses Chrome extension messaging (`chrome.runtime`). The `src/view/services/api/messages.ts` service handles the message client. Bridge components (`ActivityBridge`, `HistoryBridge`) receive state updates from the background and dispatch them into Jotai atoms.

### Stream System

Separate build target for an overlay/widget system (used with Windows game client). Has its own webpack configs (`webpack.stream.*.js`) and TypeScript config (`tsconfig.stream.json`). Entry point: `src/stream/clientEntry.ts`. Uses Snabbdom (not React) for rendering.

### Shared Code

`src/common/` — Types and utilities shared between view, background, and content script contexts. Key file: `src/common/state.ts` defines `ViewState`, `ViewDispatch`, and other cross-context interfaces.

### Atom Persistence

Some atoms persist to Chrome sync storage or localStorage. See `src/view/application/atoms/chromeStoragePersistence.ts` for the persistence utility.

## Tech Stack

- TypeScript, React 19, Jotai (state), React Router 7, SCSS
- Webpack 5, ts-loader, Jest + ts-jest + jsdom
- Stream overlay uses Snabbdom instead of React
- CSS/SCSS modules mocked with `identity-obj-proxy` in tests

## Publication

Version must be updated in three places: `package.json`, `dist/manifest.json`, and `src/view/components/about/AboutPage.tsx`.
