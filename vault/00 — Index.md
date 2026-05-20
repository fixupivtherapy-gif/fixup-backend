---
title: Index
type: MOC
tags:
  - moc
---

# 00 — Index

> Map of Content. Start here.

## Project at a glance

**JD's Property Solutions** is a bilingual (Spanish primary, English
toggle) mobile-first web platform for real estate wholesalers and
investors. Calculators for deal analysis, downloadable bilingual
contracts, and operating software.

- **Stack:** Next.js 14 · TypeScript · Tailwind · next-intl · Anthropic Claude
- **Repo location:** `web/` (Next.js app) · `vault/` (this knowledge base)
- **Branch:** `claude/jds-property-solutions-*`

## Core notes

### Foundation
- [[01 — Project Overview]] — pitch, audience, scope
- [[02 — Brand & Design System]] — colors, type, visual language
- [[03 — Tech Stack & Architecture]] — stack and folder layout

### Features
- [[04 — Calculadoras]] — all 8 calculators
- [[05 — Contratos]] — Cash + Assignment templates (verbatim ES + EN)
- [[06 — Diccionario]] — 60+ bilingual terms, expansion plan
- [[07 — Software]] — pipeline, buyers, skip trace, mail, scripts

### Operations
- [[08 — i18n]] — bilingual strategy
- [[09 — Decisions Log]] — dated decisions with rationale
- [[10 — Roadmap & Status]] — what's done, what's pending
- [[11 — Working Protocol]] — how to update with low token cost

## Locked decisions (#decision)

| Decision               | Value                                         |
| ---------------------- | --------------------------------------------- |
| Accent color           | Muted terracotta `#A8553D`                    |
| Primary language       | Spanish (es-US) — English via toggle          |
| Contract jurisdiction  | Puerto Rico (arbitration in PR)               |
| Logo                   | Typographic wordmark only (v1)                |
| Display font           | Fraunces                                       |
| UI font                | Inter Tight                                    |
| Mono font (numerics)   | JetBrains Mono                                 |
| Vercel root directory  | `web/`                                         |

See [[09 — Decisions Log]] for full history with dates and rationale.

## Quick links to source

- App entry: `web/app/[locale]/page.tsx`
- Design tokens: `web/app/globals.css` and `web/tailwind.config.ts`
- Translations: `web/messages/es.json` and `web/messages/en.json`
- Calculator math: `web/lib/calculators.ts`
- Contract data: `web/data/contracts/`
- Dictionary data: `web/data/dictionary.ts`
- DOCX generator: `web/lib/docx-generator.ts`
- Claude API client: `web/lib/anthropic.ts`
- Rehab Estimator API: `web/app/api/rehab-estimate/route.ts`
