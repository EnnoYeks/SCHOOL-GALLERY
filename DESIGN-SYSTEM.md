# HSHS World · Glass + 2026 Material

Implemented in `css/hshs-glass.css`; do not add another theme stylesheet. Core palette is navy `#071433` / `#0b1f4d`, gold `#eab308`, blue `#3b82f6` / `#1d4ed8`. Violet `#6d5bd0` is ambient-background-only. Nunito remains the typeface.

## Glass tiers
- Glass-1 `rgba(255,255,255,.06)`: list rows, feed cards and grids. No blur.
- Glass-2 `rgba(255,255,255,.10)`: panels, home stats and profile sections. No blur.
- Glass-3 `rgba(255,255,255,.14)`: navbar, bottom navigation, sheets, modals, dropdowns and toasts. Blur+saturate(160%) only in permitted chrome contexts.
- Shared border highlight, inset top highlight, dark shadow. Radii: 14px controls, 22px cards, 28px hero/sheets, 999px pills.

## Material whitelist
Only the crest/logo badge; primary Upload, Post, Send, Sign in, Create/Share and Go home actions; settings toggles and upload progress; the home hero; verified/notification badges; and active bottom navigation use material treatment. Use `--mat-chrome`, `--mat-gold`, `--mat-puffy-shadow`, `--mat-pressed-shadow`, and `--ease-spring`. Do not apply extrusion or gloss to ordinary buttons or cards.

## Blur and performance
Blur is permitted only on navbar, mobile bottom navigation, sheets/modals/dropdowns, and the home hero inner panel. Phones use 8–10px on navbar, tab bar and sheets. Never blur grids, scrolling lists, video, or Buzz. Ambient color is one fixed `body::before`; no decorative assets or DOM. Unsupported backdrop-filter, low-memory devices, reduced transparency and increased contrast use solid fills; reduced motion disables ambient drift.

## Add a card
Add a selector to the shared card group in `css/hshs-glass.css`. Choose glass-1 for list/grid content or glass-2 for a panel, retain 22px radius and existing layout, and do not blur it. No new stylesheet or card state class. Put exceptional layout-only details in the existing page stylesheet.
