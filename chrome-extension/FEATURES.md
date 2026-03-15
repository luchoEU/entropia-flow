# Entropia Flow — Features

Chrome extension for tracking inventory, crafting, trading, and streaming overlays in Entropia Universe.

---

## Pages

### 1. Monitor (`/monitor`)

Session tracking and inventory synchronization hub.

- **Last State** — Current inventory snapshot with color-coded deltas (added/removed/modified items), action inference tree, markup display, and item exclusion controls
- **Status** — EU account connection status, manual/auto refresh (3-minute interval), loading indicators, and error details
- **History** — Timeline of all past inventory snapshots with timestamps and item changes

### 2. Inventory (`/inventory`)

Items organized by storage location in a tree hierarchy.

- **Tree Display** — Items grouped by store/container with expand/collapse controls
- **Starred Items** — Favorite items section with separate sorting
- **Sorting & Filtering** — Sort by name/quantity/value, full-text search, tree-aware sorting that preserves parent-child hierarchy
- **Custom Names** — Rename items with inline editing

### 3. Trade (`/trade`)

Auction management and player-to-player trading.

- **Currently on Auction** — Active auction listings with status tracking
- **Favorites to Auction** — Favorite items available for auction (bold if not listed)
- **Inventory Owned** — All owned items available to trade
- **Trade Messages** — Real-time trade chat log with sortable/filterable table, notification filters with clickable chips (requires Client feature)

### 4. Refined (`/refined`)

Refined material processing and calculators.

- **Per-Material Sections** — Dedicated UI for each material (Mobius Metal, Brass, Silver, Gold, etc.)
- **Calculator** — Input/output conversion, auction cost calculation, buy/sell values
- **Buy Materials** — Material purchasing interface with cost calculations
- **Refine** — Refined material creation with input/output tracking
- **Orders** — Order placement and auction tracking
- **Use Refined** — Consumption recording and cost tracking
- **Google Sheets Integration** — All operations sync with Google Sheets

### 5. Craft (`/craft`)

Blueprint management and crafting sessions.

- **Blueprint List** — Searchable catalog with favorites
- **Blueprint Detail** (`/craft/:bpName`) — Material requirements, success/failure stats, cost calculations
- **Material Management** — Edit quantities, add/remove materials, reorder
- **Crafting Sessions** — Start/track/end sessions with automatic inventory updates (states: inactive → refresh → ready → refresh → done → saving)
- **Planet Info** — Planet-specific material adjustments
- **Item Markup** — Markup calculator and notes per item

### 6. Budget (`/budget`)

Budget tracking per item and material through Google Sheets.

- **Item Groups** — Create/rename/delete groups, drag items between groups
- **Item Tracking** — Enable/disable tracking, totals (MU, value, PEDs)
- **Pending Changes** — Uncommitted budget modifications with line-by-line editing (PED amount, material quantity)
- **Material Budget** — Per-material tracking with unit values and markup
- **Pending Badge** — Tab badge showing count of items with uncommitted changes
- **Sub-routes** — `/budget/:itemName` and `/budget/:itemName/:materialName` for drill-down

### 7. Activity (`/activity`)

Session management with inferred and user-defined actions.

- **Sessions** — Create, edit names/types (hunt/mine/craft/unknown), expand/collapse, delete with undo
- **Items View** — Timeline of inventory items per session with sortable table
- **User Actions** — Create custom actions with emoji icons, define inference rules matching items and quantities
- **Auto Actions** — System-inferred actions based on inventory patterns, editable types, copy to clipboard, navigate to budget

### 8. Stream (`/stream`)

Stream overlay editor and layout management.

- **Layout Chooser** — Browse, create, clone, delete, save/load layouts to file
- **Formula Editor** — JavaScript editor for custom variable calculations with access to inventory data
- **HTML/CSS Template Editor** — Mustache template syntax with variable interpolation
- **Layout Config** — Name, description, background (color/image), size, position, read-only toggle
- **Advanced** — User-defined images, parameters, and template partials
- **Stream Trash** — Recover or permanently delete layouts

### 9. Client (`/client`)

WebSocket game client connection and game log monitoring.

- **Connection Settings** — WebSocket URI configuration, status display, manual reconnect, auto-reconnect
- **Game Log Tables** (10 types, all sortable/filterable with virtual scrolling):
  - Loot, Tier, Skill, Enhancer Broken, Global Notifications, Statistics, Events, Missing, Raw Log, Trade Log

### 10. Settings (`/setting`)

Feature toggles and Google Sheets integration.

- **Feature Toggles** — Client, Refined, Budget, TT Service, Action Link, Unfreeze Tab, Comma Decimal Separator, Notification, Activity, Atom Debug
- **Google Sheets Config** — Budget Document ID, TT Service Document ID, service account email, private key
- **Items Persistence** — Choose browser or sheet storage, reload items from sheet

### 11. Raw Storage (`/raw-storage`)

Chrome storage browser and editor (development tool).

- **Storage Selector** — Toggle between Sync and Local storage
- **Storage Info** — Usage/quota display in KB with percentage
- **JSON Tree Viewer** — Hierarchical view with expand/collapse and search highlighting
- **Operations** — Edit values (with JSON validation), delete keys, clear all, export as JSON, refresh

### 12. Atom Debug (`/atom-debug`)

Jotai atom inspector for all 137+ atoms (development tool).

- **Search & Filter** — Full-text search by atom name, filter by module
- **Real-time Values** — Live atom values with loading/error states
- **Pin Feature** — Pin individual atoms for global monitoring across all pages, toggle on/off, persisted to localStorage

### 13. About (`/about`)

Version info, FAQ, and feedback links.

- **Info** — Version number, author, description
- **Feedback** — Discord server, Planet Calypso forum, in-game contact
- **Tutorials** — YouTube video links
- **Source Code** — GitHub repository link
- **FAQ** — Security concerns (no direct server communication, open source), page refresh rate limits (3-minute minimum)

---

## Navigation System

- **Tab Bar** — 13 tabs with emoji icons, current tab highlighting, action-required warnings, pending badge (Budget)
- **Drag-and-Drop Reordering** — Reorder tabs with visual feedback, persisted to storage
- **Tab Visibility** — Show/hide individual tabs with eye toggle buttons
- **Menu Pinning** — Pin/unpin navigation bar (persistent vs collapsible)
- **Last Visited** — Remembers last URL per tab for quick navigation
- **Stream View** — Optional embedded stream preview in nav bar

---

## Background Service Worker

- **Inventory Monitoring** — Periodic fetching from Entropia Universe website (3-minute interval)
- **Chrome Messaging** — Message routing between view, content script, and background contexts
- **Alarm Management** — AJAX scheduling, tab freeze detection/unfreezing, sleep/wake handling
- **Storage Sync** — Chrome sync/local storage bridging, atom state persistence
- **Notifications** — Chrome browser notifications for important events
- **WebSocket Client** — Connection to Entropia Flow Client for game log streaming with reconnection handling

## Content Script

Injected into Entropia Universe website pages.

- **Inventory Reader** — Parse "My Items" page HTML, extract item data (name, quantity, value, container)
- **Balance Reader** — Scrape account balance (PED currency)
- **Content Timer** — Schedule inventory reads respecting rate limits
- **Content UI** — Status indicators, loading/error states
- **Leaderboard Bridge** — Cross-iframe communication

## Stream Overlay System

Separate build target using Snabbdom (not React) for game overlay rendering.

- **Formula Engine** — Parse and compute custom variables from inventory data
- **Template Rendering** — Mustache templates for HTML and CSS with dynamic data
- **Custom Assets** — User-defined images, parameters, and template partials
- **Separate Builds** — Production (`npm run stream`) and dev (`npm run stream-dev`) webpack configs
