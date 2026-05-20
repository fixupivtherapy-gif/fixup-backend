---
title: Calculadoras
tags:
  - spec
  - feature
---

# 04 — Calculadoras

Eight calculator tools split into two groups.

## Group A — Calculadoras Rápidas

### 01 — Estimador de Rehabilitación ✅ shipped

- **Route:** `/{locale}/herramientas/calculadoras/rehab`
- **Inputs:** 1–8 property photos (JPG, PNG, WEBP)
- **API:** `POST /api/rehab-estimate`
- **Model:** `claude-sonnet-4-5` with vision
- **Response shape:**
  ```ts
  {
    items: { area, description, costLow, costHigh }[],
    totalLow, totalHigh,
    summary: string,
    conditionScore: 1–10
  }
  ```
- **System prompt:** asks for itemized USD ranges. Categories include
  Cocina, Baños, Pisos, Pintura interior/exterior, Techo, HVAC,
  Plomería, Electricidad, Ventanas, Puertas, Gabinetes, Encimeras,
  Aparatos, Exterior/Curb appeal, Estructural, Demo/Limpieza.
- **UX:** uploader on left, results on right (table by area + summary
  block + condition score + midpoint).
- **Future:** PDF export of the estimate (bilingual).

### 02 — Calculadora de ARV ✅ shipped

- **Route:** `/{locale}/herramientas/calculadoras/arv`
- **Inputs:** subject sqft + N comparables (address, sold price, sqft)
- **Math:** in `lib/calculators.ts → calcArv()`
  - `avgPricePerSqft` = mean of per-comp PPSF
  - `weightedAvgPricePerSqft` = Σ price / Σ sqft
  - `arv` = subjectSqft × weightedAvgPPSF
  - `arvLow` / `arvHigh` = subjectSqft × (min/max comp PPSF)
- **UX:** dynamic add/remove comp rows, breakdown table per comp.

### 03 — Calculadora de Hipoteca ✅ shipped

- **Route:** `/{locale}/herramientas/calculadoras/mortgage`
- **Inputs:** loan amount, annual rate (%), term (years)
- **Math:** `calcMortgage()` — standard P&I formula
  - `P × (r(1+r)^n) / ((1+r)^n − 1)` where r = monthly rate
- **Output:** monthly payment, total interest, total paid, 12-month
  amortization preview.

## Group B — Analizadores de Negocios

### 04 — Calculadora Fix & Flip ✅ shipped

- **Route:** `/{locale}/herramientas/calculadoras/fix-flip`
- **Inputs:** ARV, rehab cost, purchase price, holding cost, selling
  cost % (default 8%), rule % (default 70%)
- **Math:** `calcFixFlip()`
  - `mao = ARV × rule% − rehab`
  - `sellingCost = ARV × sellingCost%`
  - `totalInvested = purchase + rehab + holding + sellingCost`
  - `profit = ARV − totalInvested`
  - `roi = profit / totalInvested × 100`
  - `marginVsMao = mao − purchasePrice`
- **Output:** MAO emphasized, margin, profit, ROI, sanity block (clay
  border-left when profit positive, muted when negative).

### 05 — Calculadora Sección 8 🚧 stub

- **Route:** `/{locale}/herramientas/calculadoras/section-8`
- **Planned inputs:** HUD FMR for area, number of units, expenses
  (taxes, insurance, vacancy, repairs, mgmt fee)
- **Planned outputs:** monthly cash flow, NOI, cap rate, cash-on-cash
- **Note:** FMR is user-entered (we do NOT hardcode by state since we're
  multi-state). Link out to HUD FMR lookup.

### 06 — Calculadora de Financiamiento del Vendedor (Seller Finance) 🚧 stub

- **Route:** `/{locale}/herramientas/calculadoras/seller-finance`
- **Planned inputs:** down payment, interest rate, term, balloon period
- **Planned outputs:** monthly payment, seller's net, buyer's total
  interest paid, side-by-side comparison of 2-3 scenarios.

### 07 — Calculadora Subject-To 🚧 stub

- **Route:** `/{locale}/herramientas/calculadoras/subject-to`
- **Planned inputs:** existing loan balance, current rate, remaining
  term, expected rent, expenses
- **Planned outputs:** equity captured, monthly obligation, rental cash
  flow.

### 08 — Hojas de Cálculo Clásicas 🚧 stub

- **Route:** `/{locale}/herramientas/calculadoras/sheets`
- **Planned:** embedded sheet view with pre-built ES templates for
  BRRRR, wholesaler assignment, novación.

## Math library

All math is pure in `web/lib/calculators.ts`. UI components import and
display results. Keep math here for easy testing and reuse.

## Adding a new calculator (recipe)

1. Add types + function to `web/lib/calculators.ts`
2. Create `app/[locale]/herramientas/calculadoras/{name}/page.tsx`
   (server component, sets locale, renders `<PageHeader>` and the
   client component)
3. Create `app/[locale]/herramientas/calculadoras/{name}/calculator.tsx`
   (client component with `useState` inputs + `useMemo` result +
   `<Field>` / `<ResultRow>` / `<SectionDivider>`)
4. Add tool entry to `web/messages/es.json` and `en.json` under
   `calculadoras.tools.{key}`
5. Link from the calculadoras index page
6. Replace the existing stub `page.tsx` if there is one
