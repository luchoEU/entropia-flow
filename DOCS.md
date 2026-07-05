# Documentation Catalog

Quick-reference index of all documentation files in the project.

---

## Project Root

| File | Description |
|------|-------------|
| [README.md](README.md) | Project overview, description, and getting started |
| [CLAUDE.md](CLAUDE.md) | Agent guidelines: testing workflow, commit rules, planning mode |
| [AGENTS.md](AGENTS.md) | Agent guidelines and operational constraints |
| [NOTES.md](NOTES.md) | Project notes and references to agent memory |

## Chrome Extension

| File | Description |
|------|-------------|
| [chrome-extension/README.md](chrome-extension/README.md) | Build instructions, setup, and development workflow |
| [chrome-extension/CLAUDE.md](chrome-extension/CLAUDE.md) | Agent guidelines specific to the chrome-extension codebase |
| [chrome-extension/FEATURES.md](chrome-extension/FEATURES.md) | Feature catalog: inventory, crafting, trading, streaming overlays |
| [chrome-extension/CHANGESLOG.md](chrome-extension/CHANGESLOG.md) | Changelog following Keep a Changelog format |
| [chrome-extension/TODO.md](chrome-extension/TODO.md) | Known bugs and pending tasks |
| [chrome-extension/docs/budget-spec.md](chrome-extension/docs/budget-spec.md) | Budget feature spec: materials tracking and Google Sheets integration |
| [chrome-extension/docs/actions-spec.md](chrome-extension/docs/actions-spec.md) | Actions system spec: activity tracking and timeline display |
| [chrome-extension/docs/roles-spec.md](chrome-extension/docs/roles-spec.md) | Roles system spec: role-based views, access control, and extensibility |
| [chrome-extension/docs/design-system.md](chrome-extension/docs/design-system.md) | Design system index for the roles UI: rules + links to the HTML reference pages |
| [chrome-extension/docs/design-system/colors.html](chrome-extension/docs/design-system/colors.html) | Color palette swatches grouped by purpose (status, surface, borders, text) |
| [chrome-extension/docs/design-system/typography.html](chrome-extension/docs/design-system/typography.html) | Type scale with live samples and specs |
| [chrome-extension/docs/design-system/spacing.html](chrome-extension/docs/design-system/spacing.html) | Spacing scale, border radii, shadows, and layout metrics |
| [chrome-extension/docs/design-system/components.html](chrome-extension/docs/design-system/components.html) | Live component gallery: pills, cards, stats, tables, MU editor, trader panel, storage tree |
| [chrome-extension/docs/design-system/icons.html](chrome-extension/docs/design-system/icons.html) | Unicode glyph set used across the roles UI |

## Chrome Extension Source References

| File | Description |
|------|-------------|
| [chrome-extension/src/view/components/DashboardRouter.tsx](chrome-extension/src/view/components/DashboardRouter.tsx) | Role-to-dashboard routing for simplified modes |
| [chrome-extension/src/view/components/dashboard/FishingDashboard.tsx](chrome-extension/src/view/components/dashboard/FishingDashboard.tsx) | Fishing role dashboard with loot/decay/excluded sections |
| [chrome-extension/src/view/application/helpers/fishing.ts](chrome-extension/src/view/application/helpers/fishing.ts) | Fishing stats aggregation and formatting helpers |
| [chrome-extension/src/view/application/helpers/fishing.test.ts](chrome-extension/src/view/application/helpers/fishing.test.ts) | Fishing helper coverage for stats and formatting |
| [chrome-extension/src/view/application/atoms/activity.virtualSessions.test.ts](chrome-extension/src/view/application/atoms/activity.virtualSessions.test.ts) | Activity session grouping coverage for pre-session/session boundaries |
| [chrome-extension/src/view/components/activity/activityUtils.test.ts](chrome-extension/src/view/components/activity/activityUtils.test.ts) | Activity helper coverage for session bucketing and item/action ranges |
| [chrome-extension/src/view/components/activity/activityPerf.test.tsx](chrome-extension/src/view/components/activity/activityPerf.test.tsx) | Activity render profiling harness for large synthetic datasets |
| [chrome-extension/src/view/components/activity/activityPerf.noTable.test.tsx](chrome-extension/src/view/components/activity/activityPerf.noTable.test.tsx) | Activity profiling harness isolating preprocessing without table rendering |
| [chrome-extension/src/view/components/activity/activityVirtualization.test.tsx](chrome-extension/src/view/components/activity/activityVirtualization.test.tsx) | Activity table virtualization coverage for collapsed and expanded states |
| [chrome-extension/src/view/application/state/role.test.ts](chrome-extension/src/view/application/state/role.test.ts) | Role model coverage including Fishing |
| [chrome-extension/src/view/components/Content.test.tsx](chrome-extension/src/view/components/Content.test.tsx) | Dashboard routing coverage for simplified roles |

## Windows Client

| File | Description |
|------|-------------|
| [win-client-app/README.md](win-client-app/README.md) | Windows client setup, VM configuration, and usage |
| [win-client-app/CLAUDE.md](win-client-app/CLAUDE.md) | Agent guidelines: version management for the Windows client |
| [win-client-app/CHANGESLOG.md](win-client-app/CHANGESLOG.md) | Changelog following Keep a Changelog format |
