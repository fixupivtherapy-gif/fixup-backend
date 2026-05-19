# ARV Terminal

A desktop ARV (After Repair Value) calculator for real estate investors.
Built with Electron + vanilla JS. Editorial/terminal aesthetic — designed to
feel like a working tool, not a marketing page.

## Features

- **Subject property input** with live validation
- **Unlimited comparable sales** with per-comp include/exclude toggle
- **Three valuation methods** computed side by side:
  - M1 — Simple average $/sqft
  - M2 — Weighted by recency (≤3mo = 1.0, ≤6mo = 0.75, ≤12mo = 0.5, older = 0.25)
    and size similarity
  - M3 — Adjusted comps (user-entered $ adjustments for extra bath, garage,
    pool, kitchen, lot, condition, other)
- **Low / Mid / High** ARV range
- **Investor math** — 70% & 75% rule max offer, profit, ROI, total investment
- **Deal quality** indicator: green / yellow / red
- **Visual analysis** — $/sqft scatter plot (subject highlighted) and comp
  sale-price bar chart, with **outlier detection** (>1.5σ from mean)
- **Deal persistence** in localStorage with sidebar, duplicate, delete
- **Export** to printable HTML report (browser → Print → Save as PDF)
- **Keyboard shortcuts** — `⌘N` new, `⌘S` save, `⌘E` export
- **Responsive** down to 1024px

## Run

```bash
cd arv-calculator
npm install
npm start
```

Requires Node.js ≥18. First run downloads Electron (~100MB).

## Demo Data

Two example deals are pre-loaded on first launch:

- **4421 Maplewood Drive** (Austin, TX) — 5 comps, includes excluded outlier
- **7812 Linden Court** (Charlotte, NC) — 4 comps with applied adjustments

## File Layout

```
arv-calculator/
├── package.json
├── main.js               # Electron main process + menu
├── preload.js            # contextBridge for renderer ⇄ main IPC
└── renderer/
    ├── index.html        # UI shell
    ├── styles.css        # design system + layout
    ├── app.js            # state, wiring, lifecycle
    ├── calculations.js   # pure ARV math (testable in isolation)
    ├── storage.js        # localStorage wrapper
    └── charts.js         # Chart.js scatter + bar
```

`calculations.js` is dependency-free and exports its API on both `window.Calc`
and `module.exports`, so it can be required from a Node test runner without
modification.

## Design Notes

- Palette: deep charcoal `#16161a`, cream `#f3eedf`, single accent burnt
  orange `#c2683a`
- Type: Fraunces (display serif) + Inter (sans) + JetBrains Mono (numerics)
- Tabular figures via `font-feature-settings: 'tnum'` so columns of currency
  line up
- Corner radius capped at 3px throughout
- All currency formatted via `Intl.NumberFormat`; numeric inputs accept
  `"125,000"` and parse correctly on blur

## Caveats

- Geocoding/distance from subject is not implemented (would require an API
  key and network access — left out to keep the app offline).
- Export produces a styled HTML report; use the browser's Print → Save as PDF
  for a true PDF. A native PDF export would add a `puppeteer` dependency.
