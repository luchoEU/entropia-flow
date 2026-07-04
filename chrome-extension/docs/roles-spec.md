# Roles Feature Specification

## Overview

The Role system provides simplified, activity-focused views of the extension. Each role filters the UI to show only relevant dashboards, reducing cognitive load for users focused on a single activity.

The code still uses the `ADVANCED` enum name for backward compatibility, but the intended meaning is the legacy full-access mode shown in the UI as `Legacy`.

## Data Model

### Role Enum

Defined in `src/view/application/state/role.ts`:

```typescript
enum Role {
    HUNTER = 'hunter',
    FISHING = 'fishing',
    TRADER = 'trader',
    COLLECTOR = 'collector',
    ADVANCED = 'advanced'
}
```

### Tab Visibility Map

```typescript
const ROLE_TAB_MAP: Record<Role, TabId[]> = {
    [Role.HUNTER]: [],      // No tabs — dashboard only
    [Role.FISHING]: [],     // No tabs — dashboard only
    [Role.TRADER]: [],      // No tabs — dashboard only
    [Role.COLLECTOR]: [],   // No tabs — dashboard only
    [Role.ADVANCED]: []     // Empty = show all (no filtering)
}
```

- **HUNTER / FISHING / TRADER / COLLECTOR**: Empty array means no tabs are visible; the user sees only the dashboard.
- **ADVANCED / Legacy**: Treated as a special case in `tabShowForRole()` and `Content.tsx` — all tabs are shown and the dashboard route is redirected back to the Monitor page.

### Display Labels

```typescript
const ROLE_LABELS: Record<Role, string> = {
    [Role.HUNTER]: 'Hunter',
    [Role.FISHING]: 'Angler',
    [Role.TRADER]: 'Trader',
    [Role.COLLECTOR]: 'Collector',
    [Role.ADVANCED]: 'Legacy'
}
```

### Role Emblems

Defined in `src/view/application/state/role.ts`:

| Role | Emoji |
|------|-------|
| Hunter | `🎯` |
| Angler | `🎣` |
| Trader | `💰` |
| Collector | `📦` |
| Legacy | `⚙️` |

## State Management

Defined in `src/view/application/atoms/role.ts`:

| Atom | Type | Description |
|------|------|-------------|
| `roleAtom` | `atomWithStorage<Role>` | Persisted role selection. Storage key: `jotai-v1-role`. Defaults to `Role.ADVANCED` so existing users see no change. |
| `setRoleAtom` | write-only atom | Setter for updating the role. |

## Access Control

### Tab Filtering

`tabShowForRole()` in `src/view/application/helpers/navigation.ts` controls tab visibility:

```
tabShowForRole(id, role, anyInventory, settings)
  1. Apply feature-gate checks via tabShow() — some tabs require
     inventory data or feature flags to be visible
  2. If role === ADVANCED → return true (all tabs shown)
  3. Otherwise → return ROLE_TAB_MAP[role].includes(id)
```

### Route Gating

In `Content.tsx`, routes are conditionally rendered based on the active role:

- **Non-Legacy roles**: `"/"` redirects to `"/dashboard"`, which renders a role-specific dashboard via `DashboardRouter`.
- **Legacy role**: `"/dashboard"` redirects to `"/"` (Monitor page). All tab routes are rendered, filtered by `tabShowForRole()`.

`DashboardRouter` currently maps:

| Role | Dashboard |
|------|-----------|
| Hunter | `HunterDashboard` |
| Angler | `FishingDashboard` |
| Trader | `TraderDashboard` |
| Collector | `CollectorDashboard` |
| Legacy | `HunterDashboard` fallback today, while the route stays on the legacy full-access UI |

## Current Roles

### Hunter

A dashboard-only view for hunting sessions. No tab bar is shown.

**HunterDashboard** (`src/view/components/dashboard/HunterDashboard.tsx`) displays:

- **Connection Status Card** — Items page and client connection indicators (green/red). Client URL is editable when offline. The card is collapsible to a title bar via `dashboardStatusCollapsedAtom`.
- **Hunt Statistics** — Delta (color-coded positive/negative), return %, DPS, DPP, kill count, current/last kill info, last return %.
- **Items Diff Table** — Sortable by name, quantity, or value. Supports markup column toggle, inline MU editing, and per-item exclude/include actions on hover.

#### Hunter calculations

The Hunter dashboard uses the current inventory comparison plus the hunt stream state:

- `lastComputedAtom` from `src/view/application/atoms/last.ts` provides the current inventory delta, current diff rows, and `itemsTotalPed`.
- `streamRenderDataAtom.layoutData['entropiaflow.hunt']` provides hunt metrics such as return, DPP, DPS, kill state, and last kill decay/loot values.
- `currentGameLogDataAtom` provides kill counts from the game log.
- `inventoryListAtom` provides the current avatar name used to filter global events for the same player.

The top statistics are derived as follows:

- **Delta** = `lastComputedAtom.delta`
- **Return** = `huntData.return_`
- **DPP** = `huntData.dpp`
- **DPS** = `huntData.dps`
- **Kills** = `gameLog.stats?.killsStats?.count ?? 0`
- **Current Kill** = current hunt decay value while `huntData.isKilling` is true, otherwise `--`
- **Last Kill** = last cached kill decay value after the hunt state leaves the active-kill phase
- **Last Return** = `(lastKillLoot / lastKillDecay) * 100` when both cached values are present and decay is greater than zero, otherwise `--`

The items section is derived from `lastComputedAtom.diff`:

- `Qty` is the row quantity
- `Value` is the current PED value
- `Total` in markup mode is the markup-adjusted PED total
- Rows are grouped into `Looted`, `Decayed`, and `Excluded` using the same positive/negative/excluded classification as Angler

Session reset uses `resetHunterSessionAtom` and `undoResetHunterSessionAtom`:

- Reset sets the current inventory as the new baseline, preserves the blacklist state, clears transient UI lists, and stores a snapshot for undo.
- Undo restores the saved persisted state, last timestamp, and game log snapshot.

### Angler

A dashboard-only view for fishing sessions. No tab bar is shown.

**FishingDashboard** (`src/view/components/dashboard/FishingDashboard.tsx`) displays:

- **Connection Status Card** — Same connection state as Hunter.
- **Angler Statistics** — Positive inventory diffs are treated as fish loots, negative diffs as decay. The dashboard shows top-line totals for PED, looted count, average time between loots, last time between the last two loots, and time since last loot.
- **Looted / Decayed / Excluded Sections** — Table-driven sections with sortable columns on the looted rows, matching the Hunter dashboard style. First and last loot timestamps are shown as time-only values with a day offset suffix when the event is not on day 0.
- **Reset Session** — Same reset/undo flow as Hunter, using the current inventory as the new baseline and restoring the previous session state on undo.

#### Angler calculations

The Angler dashboard uses the same session boundary as Hunter: `lastTimestampAtom` marks the current session start, and only history entries strictly newer than that timestamp are included.

The math is implemented in `src/view/application/helpers/fishing.ts`.

##### Input rules

- History rows come from `history.list`.
- Rows at or before `lastTimestampAtom` are ignored for session statistics.
- Positive `item.q` values are treated as looted fish.
- Non-positive `item.q` values are treated as decay.
- Excluded item names come from `lastPersistedAtom.blacklist` and `lastPersistedAtom.permanentBlacklist`.

##### Top statistics

`FishingSummary` is derived from the filtered session history:

- **Total PED** = sum of `item.v` across all included positive loot rows.
- **Looted** = sum of positive `item.q` across all included loot rows.
- **Average time** = arithmetic mean of the intervals between consecutive included loot events.
- **Last time** = interval between the last two included loot events.
- **Since last** = `now - lastLootTime`, updated live on a 100 ms tick in the dashboard.

##### Per-fish row statistics

`buildFishingStats()` groups session history by fish name and computes:

- `count` = sum of positive `item.q` values for that name.
- `totalValue` = sum of `item.v` values for that name.
- `firstLootTime` = earliest included event time for that fish.
- `lastLootTime` = latest included event time for that fish.
- `lastIntervalMs` = interval between the last two included loot events for that fish.
- `averageIntervalMs` = average interval between included loot events for that fish.

The row table shows:

- `Name`
- `Qty`
- `Value`
- `First`
- `Last`

`First` and `Last` are rendered as time-only values. If the event is not on the first session day, the UI appends a `+Nd` superscript day offset.

##### Section grouping

The looted table is grouped inside the grid into:

- `Looted`
- `Decayed`
- `Excluded`

These sections are sortable at the row level using the same table header interaction as the Hunter dashboard.

### Legacy

Legacy full-access mode. This is the default role, preserving the original extension experience and showing the full tab set.

- Tab bar with all 13 tabs (filtered only by feature flags, not by role).
- Drag-and-drop tab reordering.
- Role selector dropdown in the navigation bar.
- Pinned atoms panel (debug tooling) visible only in this mode.

## UI Integration

### Navigation (`src/view/components/Navigation.tsx`)

The role selector renders differently per role:

| Role | UI |
|------|-----|
| **Hunter / Angler / Trader / Collector** | Role badges for the non-legacy modes plus a `Legacy` button to switch back |
| **Legacy** | A single `Legacy` badge with a hover-revealed `Roles` action to return to the previous role |

Role changes update `roleAtom` via `setRoleAtom`, which persists the selection to localStorage.

### Content Routing (`src/view/components/Content.tsx`)

`DashboardRouter` maps roles to dashboard components:

```typescript
function DashboardRouter({ role }: { role: Role }) {
    switch (role) {
        case Role.FISHING:
            return <FishingDashboard />
        case Role.TRADER:
            return <TraderDashboard />
        case Role.COLLECTOR:
            return <CollectorDashboard />
        case Role.HUNTER:
        default:
            return <HunterDashboard />
    }
}
```

## Adding a New Role

To add a new role:

1. **`state/role.ts`** — Add the enum entry, label, emoji, and tab-map entry.
2. **Dashboard component** — Create the role-specific dashboard in `components/dashboard/`.
3. **`DashboardRouter.tsx`** — Add a `case` for the new role.
4. **`Content.tsx`** — Confirm the route gating still matches the desired dashboard-only or full-access behavior.
5. **Navigation** — The role selector auto-populates from `Role` and `ROLE_LABELS`.

## Files Reference

| File | Purpose |
|------|---------|
| `src/view/application/state/role.ts` | Role enum, ROLE_TAB_MAP, ROLE_LABELS |
| `src/view/application/atoms/role.ts` | roleAtom, setRoleAtom |
| `src/view/application/helpers/navigation.ts` | tabShowForRole() access control |
| `src/view/components/DashboardRouter.tsx` | Role-to-dashboard routing |
| `src/view/components/dashboard/HunterDashboard.tsx` | Hunter dashboard component |
| `src/view/components/dashboard/FishingDashboard.tsx` | Angler dashboard component |
| `src/view/components/dashboard/TraderDashboard.tsx` | Trader dashboard component |
| `src/view/components/dashboard/CollectorDashboard.tsx` | Collector dashboard component |
| `src/view/components/dashboard/HunterDashboard.scss` | Hunter dashboard and role selector styles |
| `src/view/components/Navigation.tsx` | Role selector UI |
| `src/view/components/Content.tsx` | DashboardRouter, role-based routing |
