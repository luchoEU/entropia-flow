# Design System — Roles UI

Visual language for the **Hunter**, **Trader**, and **Storage** role dashboards. The legacy *Advanced* view is intentionally out of scope — it predates the new roles and uses its own navigation chrome.

Source of truth: [`src/view/components/dashboard/HunterDashboard.scss`](../src/view/components/dashboard/HunterDashboard.scss). This page is a read-only mirror; when SCSS changes, update the HTML references below.

## Design Rules

1. **Light, flat, minimalist.** White cards on a light background. No gradients, no dark mode, no glassmorphism.
2. **Material-influenced tints.** Positive / active = `#e8f5e9` / `#a5d6a7` / `#2e7d32`. Negative = `#ffebee` / `#ef9a9a` / `#c62828`. Neutral hover accent = `#e3f2fd` / `#90caf9`.
3. **Subtle elevation.** Cards use `0 1px 3px rgba(0,0,0,0.08)`. Status dots glow via `0 0 4px rgba(color, 0.5)`. Nothing else is elevated.
4. **Corner radii.** `10px` for cards and stat boxes, `12px` for role pills, `4–6px` for controls, `3px` for badges and inline inputs.
5. **Typography scale.** Labels are `11px` uppercase with `0.5px` letter-spacing. Values are `18px` bold. Body is `13px`. Minimum size is `10px`. System sans-serif only.
6. **Unicode icons only.** `▴ ▾ ▸ ▼ ▶ ✕ ✓ ✎ ★ ☆ ☰ ▤` — no SVG, no PNG, no icon font.
7. **Hover-reveal affordances.** Row-level actions (`✎`, `✕`, favorite star) default to `visibility: hidden` and appear on row hover. Keeps tables quiet until acted on.
8. **Logic lives in helpers, not components.** This document describes visuals only; calculations stay in `src/view/application/helpers/`.

## Reference

High-fidelity, self-contained HTML pages — open any file directly in a browser.

| Page | What it shows |
|------|---------------|
| [Colors](design-system/colors.html) | Full palette, grouped by purpose (status, surface, borders, text, highlights). |
| [Typography](design-system/typography.html) | Every type token with a live sample and specs. |
| [Spacing & Elevation](design-system/spacing.html) | Spacing scale, radii, card / glow shadows, layout metrics. |
| [Components](design-system/components.html) | Live gallery: pills, cards, stats, connection card, items table, MU editor, trader detail panel, storage tree, filters. |
| [Icons](design-system/icons.html) | All Unicode glyphs used in the UI and when each applies. |
