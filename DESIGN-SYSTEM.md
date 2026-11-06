# HSHS World · Glass + 2026 Material

This design system is implemented in `css/hshs-glass.css`; add no parallel theme stylesheet. It keeps the existing navy foundation (`#071433` / `#0b1f4d`), gold (`#eab308`) and blue (`#3b82f6` / `#1d4ed8`). Violet (`#6d5bd0`) is reserved for ambient background light, never UI chrome. Nunito remains the typeface.

## Glass tiers

- **Glass-1** `rgba(255,255,255,.06)`: rows, list cards and feed surfaces. No backdrop blur.
- **Glass-2** `rgba(255,255,255,.10)`: panels, home stats, profile and section cards. No backdrop blur.
- **Glass-3** `rgba(255,255,255,.14)`: navbar, bottom navigation, sheets, modals, dropdowns and toasts. Blur + `saturate(160%)` is allowed only on these chrome surfaces.
- All tiers use a restrained highlight border, inset top highlight and dark shadow; use card radius 22px, hero/sheet radius 28px, control radius 14px, and pill radius 999px.

## Material (approved hero list only)

Material treatment is limited to the crest/logo badge; primary actions (Upload, Post, Send, Sign in, Create/Share a moment and Go home); settings toggles and upload progress; the home hero, verified/notification badges, and the active bottom-nav item. The supplied `--mat-chrome`, `--mat-gold`, `--mat-puffy-shadow`, `--mat-pressed-shadow` and `--ease-spring` tokens are the shared material primitives. Other cards, controls and actions stay flat glass.

## Blur and performance

Backdrop blur is allowed on the navbar, bottom navigation, sheets/modals/dropdowns, and the home hero's inner panel only. On phones, use 8–10px blur on navbar, tab bar and sheets. Do not blur scrolling lists, grids, videos, or any Buzz feed surface. The shared ambient layer is one fixed `body::before` pseudo-element (no decorative DOM or asset additions). Unsupported blur, low-memory devices, and reduced-transparency/contrast preferences receive solid fills; reduced motion disables ambient drift.

## Adding a card

Use an existing shared card selector in `css/hshs-glass.css` and choose glass-1 for list/grid content or glass-2 for a panel. Do not add a stylesheet, blur the card, add material chrome, or create a new state class. For an exceptional layout-specific detail (such as a video scrubber), add a narrowly scoped rule to the existing page stylesheet and preserve its behavior and touch target.
