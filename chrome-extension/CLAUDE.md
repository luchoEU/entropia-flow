# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Visual Testing

When making UI changes, use Puppeteer to verify the result visually. Save generated scripts and screenshots to `/tmp/` (never in the repo). Keep the screenshots around so you can show them to the user if asked.

- Launch Chrome with `--load-extension=dist` (requires `headless: false` since extensions need headed mode)
- The extension starts in Advanced mode — click `.role-label-advanced` to exit, then click the target role
- Since the extension has no inventory data by default, inject mock HTML outside React's control (append after `.dashboard-page`) to preview component layouts with realistic data
- Take full-page screenshots with `page.screenshot({ path: '/tmp/screenshot-name.png', fullPage: true })`

## Documentation

All project documentation is indexed in [DOCS.md](../DOCS.md). When adding new features or fixing bugs, create or update the related documentation files to keep them accurate. See [FEATURES.md](FEATURES.md) for a comprehensive list of all pages, navigation system, background services, content script, and stream overlay features.

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

### Role System & Dashboards

The UI has 4 roles defined in `src/view/application/state/role.ts`: **Hunter**, **Trader**, **Collector**, **Advanced**. Non-Advanced roles show a dashboard (`src/view/components/dashboard/`); Advanced shows the full tabbed interface.

- `Role` enum controls which tabs are visible via `ROLE_TAB_MAP`
- Role selector is in `Navigation.tsx` — non-Advanced roles show role pills; Advanced shows the tab bar
- Each role has a dashboard component: `HunterDashboard.tsx`, `TraderDashboard.tsx`, `CollectorDashboard.tsx`
- Dashboards use shared patterns: `DashboardSection` (collapsible), `dashboard-items-table`, stat boxes
- Dashboard routing is in `Content.tsx` → `DashboardRouter`

**Design principle**: All calculations and business logic must live in pure helper functions (`helpers/trader.ts`, etc.), never inline in React components. Components call helpers and render results. When adding or changing logic, design it as testable pure functions first, then write unit tests for them.

### Helpers & Testing

Business logic lives in `src/view/application/helpers/` as pure functions. Tests are **co-located** (e.g., `trader.ts` → `trader.test.ts`, `inventory.ts` → `inventory.test.ts`). When adding new helper functions, add tests in the same directory.

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

## Worktree Testing

When developing in a git worktree, Chrome won't load two extensions with the same manifest name side by side. Apply these three changes to the worktree copy so it can run in parallel with the main extension:

**`dist/manifest.json`** — rename the extension:
```diff
-    "name": "Entropia Flow",
-    "description": "This extension help you see your returns in Entropia Universe",
+    "name": "Entropia Flow (Dev)",
+    "description": "This extension help you see your returns in Entropia Universe (Dev)",
```

**`dist/view.html`** — update the page title so you can tell the tabs apart:
```diff
-    <title>Entropia Flow</title>
+    <title>Entropia Flow (Dev)</title>
```

**`src/content/content-entropia-flow.ts`** — disable leader election so the worktree instance doesn't compete with the main extension's content script:
```diff
-const bridge = new LeaderBridge(true)
+const bridge = new LeaderBridge(false)
```

These changes are local-only and must **not** be committed.
