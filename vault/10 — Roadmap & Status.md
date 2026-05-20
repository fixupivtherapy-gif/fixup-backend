---
title: Roadmap & Status
tags:
  - status
---

# 10 — Roadmap & Status

Live status of every module. **Update this file whenever a module changes status.**

## ✅ Shipped (v1)

| Module                          | Notes                                      |
| ------------------------------- | ------------------------------------------ |
| Design system                   | Tokens, fonts, primitives, paper texture   |
| Locale shell                    | ES default, EN toggle, route prefix always |
| Home screen                     | Asymmetric hero, list-style tiles          |
| Nav shell                       | Sticky header, tab nav, footer             |
| Calculadora Mortgage            | Real P&I math + 12-mo amortization         |
| Calculadora ARV                 | Add/remove comps, weighted + range         |
| Calculadora Fix & Flip          | MAO, 70% rule, profit, ROI, sanity block   |
| Estimador de Rehabilitación     | Claude vision (claude-sonnet-4-5), JSON-only |
| Diccionario                     | 60 terms, 6 categories, search + filter    |
| Contrato Cash (Promesa)         | .docx ES + EN, 16 sections                 |
| Contrato Assignment             | .docx ES + EN, 10 sections                 |
| README (Spanish)                | Setup + deploy instructions                |
| `vault/` + `CLAUDE.md`          | Project knowledge base                     |

## 🚧 Stubbed (renders, links work, in-progress notice shown)

### Calculators
- [ ] Calculadora Sección 8
- [ ] Calculadora Financiamiento del Vendedor (Seller Finance)
- [ ] Calculadora Subject-To
- [ ] Hojas de Cálculo Clásicas

### Resources
- [ ] Generador de Contratos (AI-powered form)

### Software (entire tab)
- [ ] Pipeline de Negocios (kanban)
- [ ] Lista de Compradores (CRM-lite)
- [ ] Skip Trace Helper
- [ ] Generador de Cartas Directas (Claude)
- [ ] Constructor de Scripts de Llamadas (Claude)

## 📋 Backlog (not yet started)

### Contract templates beyond Cash + Assignment
- [ ] Addendum
- [ ] Acuerdo de Terminación
- [ ] Joint Venture Agreement
- [ ] Acuerdo de Novación
- [ ] Contrato de Opción
- [ ] Contrato de Financiamiento Creativo

### Polish & quality
- [ ] Per-deal jurisdiction editor for contracts
- [ ] PDF export option for contracts (in addition to .docx)
- [ ] Dictionary expansion 60 → 350+
- [ ] Mobile QA pass (it's mobile-first but needs a device sweep)
- [ ] Dark mode validation pass

### Infrastructure
- [ ] Analytics (Plausible or Vercel)
- [ ] Error boundary + Sentry
- [ ] Real backend (Supabase or Convex) when pipeline/buyers need sync

## 🎯 Suggested next slice

**Goal:** Operational tooling without adding API costs.

1. **Pipeline de Negocios** — pure localStorage kanban. High user value,
   zero ongoing cost. See [[07 — Software]] for shape.
2. **Lista de Compradores** — paired with Pipeline. Shares storage
   pattern.
3. **Generador de Cartas Directas** — first Claude-powered text generator.
   Establishes the pattern for Scripts later.
4. **Constructor de Scripts** — second Claude generator, reuses route
   pattern from Cartas.
5. **Calculadora Sección 8** — small math, big user value for rental
   investors.
6. **Calculadora Seller Finance + Subject-To** — paired creative finance
   tools.
7. **Generador de Contratos (AI form)** — combine the form pattern with
   Claude clause-customization.
8. **Dictionary expansion** — bulk-add 50 terms at a time via Claude
   following the recipe in [[06 — Diccionario]].
