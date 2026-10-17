# Changelog

All notable changes to OmniCalc are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-10-17

### Fixed
- Tab chips (`Base converter`, `Roman numerals`, `Text & encoding`, `Morse code` and
  their equivalents on Health, Culinary, Apparel, Financial and Date & Time) now turn
  blue when selected — the active highlight previously stayed stuck on the first tab
  even though the content below switched correctly. `aria-selected` is kept in sync too.

## [1.1.0] - 2026-10-17

### Added
- Sidebar toggle now works on desktop: collapses/expands the sidebar with a smooth
  animation, shows a menu icon, and remembers the collapsed state between visits.
  On tablet/mobile it still opens the off-canvas drawer.
- `Clear` button on the calculator history tape to delete all past calculations.

### Changed
- Dark-only cold "Monet" palette applied everywhere: deep indigo surfaces, light-blue
  accents, violet secondary highlights; lime/olive removed from the UI, charts, canvas
  plots, app icons and the PWA manifest.
- Accent-filled elements (buttons, operator keys, marks) use violet hard-shadows for
  visibility; paper elements keep light-blue shadows.

### Removed
- Light/dark theme toggle from the header and Settings, the `?theme=` URL parameter,
  and all theme plumbing (`OC.applyTheme`, `theme` setting).

### Fixed
- Standard & Scientific calculators: the display lagged one key behind the input
  (pressing `7` still showed `0`, etc.) — the keypad now re-renders after each key.
- Scientific calculator: pressing `%` on a physical keyboard inserted the literal
  word "percent" into the expression instead of `/100`.
- Ticker marquee and site footer now appear on the home page only, not on
  calculator/converter pages.

## [1.0.0] - 2026-10-17

### Added
- Initial release in pure HTML5 + CSS3 + vanilla JavaScript — no frameworks,
  no backend, no build tools.
- 7 calculators: Standard, Scientific (shunting-yard parser, no `eval()`),
  Programmer (BIN/OCT/DEC/HEX, bitwise, 8/16/32/64-bit two's complement via BigInt),
  Graphing (canvas pan/zoom/table), Matrix (det, inverse, `Ax = b`),
  Financial (EMI + amortization + CSV, compound + chart, simple interest, tip,
  tax/VAT, discount/markup, ROI, break-even), Date & Time (diff, age, add/subtract,
  live countdown, work days, world clock).
- 32 converter categories / 300+ units: length, mass, volume, area, temperature,
  speed, time, fuel economy, pressure, energy, power, force, torque, flow,
  viscosity (dynamic + kinematic), digital storage (1000 vs 1024), transfer rates,
  screen/typography, angle, radiation, health, culinary (ingredient densities,
  oven marks, recipe scaler), apparel sizing, historic & obscure units
  (cubit, smoot, shaku, li, verst…), number systems & encoding (base-N, Roman,
  Unicode, Base64, Morse) and a custom formula builder.
- Live data with offline caches: fiat currency (120+ codes) with a three-provider
  fallback chain, crypto (~50 coins), editable precious-metal references and
  pre-Euro currencies at exact legal rates.
- Universal search ("10 km to miles", "100 usd to eur", unit and tool lookup),
  favorites, calculator history tape, memory keys and full keyboard support.
- Installable PWA: service worker with precache + stale-while-revalidate,
  manifest and icons; works fully offline.
- Zero-dependency test suite (43 assertions) runnable in Node and in the browser.
- Editorial "paper" design system: locally subsetted Material Symbols icon font
  (88 KB, offline), hard offset shadows, serif headings, dark sidebar.

[1.1.1]: https://github.com/neon-glitch-ESC/omnicalc/compare/cd45927...50029cd
[1.1.0]: https://github.com/neon-glitch-ESC/omnicalc/compare/dfde880...cd45927
[1.0.0]: https://github.com/neon-glitch-ESC/omnicalc/commit/dfde880
