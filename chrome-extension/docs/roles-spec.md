# Roles Feature Specification

## Overview

The Role system provides simplified, activity-focused views of the extension. Each role filters the UI to show only relevant tabs and dashboards, reducing cognitive load for users engaged in a specific activity (e.g., hunting). The default role is **Advanced**, which preserves the full-featured experience.

## Data Model

### Role Enum

Defined in `src/view/application/state/role.ts`:

```typescript
enum Role {
    HUNTER = 'hunter',
    ADVANCED = 'advanced'
    // Future: MINER, CRAFTER, TRADER
}
```

### Tab Visibility Map

```typescript
const ROLE_TAB_MAP: Record<Role, TabId[]> = {
    [Role.HUNTER]: [],      // No tabs — dashboard only
    [Role.ADVANCED]: []     // Empty = show all (no filtering)
}
```

- **HUNTER**: Empty array means no tabs are visible; the user sees only the dashboard.
- **ADVANCED**: Treated as a special case in `tabShowForRole()` — all tabs are shown regardless of the map.

### Display Labels

```typescript
const ROLE_LABELS: Record<Role, string> = {
    [Role.HUNTER]: 'Hunter',
    [Role.ADVANCED]: 'Advanced'
}
```

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

- **Non-Advanced roles**: `"/"` redirects to `"/dashboard"`, which renders a role-specific dashboard via `DashboardRouter`.
- **Advanced role**: `"/dashboard"` redirects to `"/"` (Monitor page). All tab routes are rendered, filtered by `tabShowForRole()`.

## Current Roles

### Hunter

A dashboard-only view for hunting sessions. No tab bar is shown.

**HunterDashboard** (`src/view/components/dashboard/HunterDashboard.tsx`) displays:

- **Connection Status Card** — Items page and client connection indicators (green/red). Client URL is editable when offline. The card is collapsible to a title bar via `dashboardStatusCollapsedAtom`.
- **Hunt Statistics** — Delta (color-coded positive/negative), return %, DPS, DPP, kill count, current/last kill info, last return %.
- **Items Diff Table** — Sortable by name, quantity, or value. Supports markup column toggle, inline MU editing, and per-item exclude/include actions on hover.

### Advanced

Full access to all tabs and features. This is the default role, preserving the original extension experience.

- Tab bar with all 13 tabs (filtered only by feature flags, not by role).
- Drag-and-drop tab reordering.
- Role selector dropdown in the navigation bar.
- Pinned atoms panel (debug tooling) visible only in this mode.

## UI Integration

### Navigation (`src/view/components/Navigation.tsx`)

The role selector renders differently per role:

| Role | UI |
|------|-----|
| **Hunter** | "Hunter" label badge + a hover-revealed "Advanced" button |
| **Advanced** | Dropdown `<select>` listing all roles from `ROLE_LABELS` |

Role changes update `roleAtom` via `setRoleAtom`, which persists the selection to localStorage.

### Content Routing (`src/view/components/Content.tsx`)

`DashboardRouter` maps roles to dashboard components:

```typescript
function DashboardRouter({ role }: { role: Role }) {
    switch (role) {
        case Role.HUNTER:
            return <HunterDashboard />
        default:
            return <HunterDashboard />
    }
}
```

The default case currently falls through to `HunterDashboard`, ready to be extended when new roles are added.

## Adding a New Role

To add a new role (e.g., MINER):

1. **`state/role.ts`** — Add `MINER = 'miner'` to `Role` enum. Add entry to `ROLE_TAB_MAP` with the tab IDs the role should see (or empty for dashboard-only). Add label to `ROLE_LABELS`.
2. **Dashboard component** — Create `MinerDashboard.tsx` in `components/dashboard/` with the role-specific UI.
3. **`Content.tsx`** — Add `case Role.MINER: return <MinerDashboard />` to `DashboardRouter`.
4. **Navigation** — No changes needed; the dropdown and role selector auto-populate from `Role` enum and `ROLE_LABELS`.

## Files Reference

| File | Purpose |
|------|---------|
| `src/view/application/state/role.ts` | Role enum, ROLE_TAB_MAP, ROLE_LABELS |
| `src/view/application/atoms/role.ts` | roleAtom, setRoleAtom |
| `src/view/application/helpers/navigation.ts` | tabShowForRole() access control |
| `src/view/components/dashboard/HunterDashboard.tsx` | Hunter dashboard component |
| `src/view/components/dashboard/HunterDashboard.scss` | Hunter dashboard and role selector styles |
| `src/view/components/Navigation.tsx` | Role selector UI |
| `src/view/components/Content.tsx` | DashboardRouter, role-based routing |
