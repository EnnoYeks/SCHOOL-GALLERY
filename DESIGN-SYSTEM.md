/* HSHS World · Glass + 2026 Material system

## Tokens
Navy #071433 / #0b1f4d; gold #eab308; blue #3b82f6 / #1d4ed8. Violet #6d5bd0 is ambient background only. Typeface remains Nunito. Glass and material variables are defined once in `css/hshs-glass.css`.

## Glass tiers
- glass-1 rgba(255,255,255,.06): rows, feed cards, grids. Fill only; never blur.
- glass-2 rgba(255,255,255,.10): panels, stats, profile, sections. Fill only; never blur.
- glass-3 rgba(255,255,255,.14): navbar, bottom navigation, sheets, modals, dropdowns, toasts. Blur+saturate(160%) only where allowed below.
- Shared border highlight, inset top highlight, dark shadow. Radii: 14px inputs/chips, 22px cards, 28px hero/sheets, 999px pills.

## Hero material whitelist
Crest/logo badge; primary Upload/Post/Send/Sign in/Create or Share/Go home actions; settings toggles and upload progress; the home hero; verified and notification badges; active bottom-nav item. Use --mat-chrome, --mat-gold, --mat-puffy-shadow, --mat-pressed-shadow and --ease-spring. Do not apply extrusion, gloss, or chrome to ordinary buttons/cards.

## Performance and blur allowance
Blur is permitted only on navbar, mobile bottom navigation, sheets/modals/dropdowns, and the home hero's inner panel. Phones use 8–10px on navbar, tab bar and sheets. No blur on grids, scrolling lists, videos or Buzz. Shared ambient color is one fixed body::before layer (no decorative DOM/images). Unsupported backdrop-filter, low-memory devices, reduced transparency and increased contrast use solid fills; reduced motion disables ambient drift.

## Add a card
Add a selector to the shared card group in `css/hshs-glass.css`, choose glass-1 for a row/feed/grid or glass-2 for a panel, preserve its existing layout and use the 22px radius. Never create a CSS file or blur the card. Only exceptional layout-specific details belong in the page's existing stylesheet.
