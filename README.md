# OmniCalc — The Universal Calculator & Converter

A single-page, installable web app in **pure HTML5 + CSS3 + vanilla JavaScript** — no frameworks, no backend, no build tools. Open `index.html` and everything works; serve it over http(s) and it becomes a full offline PWA.

## Highlights

- **Calculators** — Standard, Scientific (shunting-yard parser, no `eval()`), Programmer (BIN/OCT/DEC/HEX, bitwise, 8/16/32/64-bit two's complement via BigInt), Graphing (canvas pan/zoom/table), Matrix (det, inverse, `Ax = b`), Financial (EMI + amortization + CSV, compound + chart, simple, tip, tax/VAT, discount/markup, ROI, break-even), Date & Time (diff, age, add/subtract, live countdown, work days, world clock).
- **Converters** — 30+ categories and 300+ units: length, mass, volume, area, temperature (7 scales incl. Réaumur/Delisle/Newton), speed, time, angle, pressure, energy, power, force, torque, flow, viscosity (dynamic + kinematic), fuel economy, digital storage (1000 vs 1024), transfer rates, screen/typography, radiation, historic & obscure units (cubit, smoot, shaku, li, verst…), cooking (ingredient densities, oven marks, recipe scaler), apparel sizing, number systems & encodings (base-N, Roman, Unicode, Base64, Morse), custom formula builder.
- **Live data** — fiat currency (exchangerate-api, 120+ codes), crypto (CoinGecko, ~50 coins), precious metals (editable reference prices), pre-Euro currencies at exact legal rates. All cached to localStorage; offline fallback with clear "cached/offline" banners.
- **Everything local** — favorites, calculator history, custom converters, world-clock zones and settings live in `localStorage`. Export/import JSON in Settings; "Clear all data" wipes it.
- **Style** — cold "Monet" palette: indigo night surfaces, light-blue accents, violet secondary highlights. Paper-style editorial system (Playfair Display / Google Sans / Fira Code), hard offset shadows, dark sidebar with a collapsible desktop sidebar and off-canvas drawer on mobile. Dark-only by design — no theme switching. Material Symbols icons (locally subsetted, 88 KB, works offline).

## Run it

Double-click `index.html` — everything except the service worker works from `file://`.

For the full PWA (offline cache + install prompt), serve the folder over http(s):

```bash
# any static server, e.g.
npx serve .
# or Python
python -m http.server 8080
# or VS Code "Live Server" extension
```

Then open the printed URL. In Chrome/Edge use the install icon in the address bar to add OmniCalc to your desktop or home screen.

## Tests

Open `tests.html` in a browser. ~50 assertions cover the expression parser, every conversion family (sample reference values), number systems, live-data payload parsers, search parsing and data integrity. No test framework needed.

Command-line alternatives (no dependencies): `node tools/run-tests.js` runs the same suite in Node, and `tools/debug-layout.html` opened in a browser audits every page for horizontal overflow at phone widths inside 390px iframes.

## Project structure

```
index.html            app shell (header, ticker, sidebar, footer)
manifest.json         PWA manifest
sw.js                 service worker (precache + stale-while-revalidate)
css/                  reset, variables/tokens, layout, components, responsive, fonts
js/
  icons.js            generated Material Symbols codepoint map
  utils.js  store.js  expression engine (expr.js)  search.js  router.js  app.js
  data/               static unit tables, currency/crypto seeds, culinary, apparel
  converters/         generic engine, live (currency/crypto/metals/legacy), custom
  tools/              numbers & encoding, health, culinary, apparel
  calculators/        basic, scientific, programmer, financial, datetime, graphing, matrix
  pages/              home, settings
tools/refresh-icons.ps1   regenerates the subsetted icon font + js/icons.js
tests.html + js/tests.js  zero-dependency test runner
```

## Notes & known limits

- License-key unlock is an honor-system stub (client-side format check only) — see Settings → Pro.
- Public rate APIs are rate-limited; the app caches for 1 hour, falls back across three fiat providers (exchangerate-api → jsDelivr currency-api → frankfurter.app) and finally to bundled reference values, always labelled in the UI.
- Historical units and sizing charts are common-reference approximations (documented inline).
- Inflation calculator was intentionally left to a future release (needs a bundled CPI dataset).

Data sources: NIST/ISO conversion factors, exchangerate-api.com (open endpoint) with jsDelivr currency-api and frankfurter.app as fallbacks, CoinGecko public API for crypto, USDA-style ingredient densities, official Euro fixed conversion rates.
