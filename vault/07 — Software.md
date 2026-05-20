---
title: Software
tags:
  - spec
  - feature
---

# 07 — Software

The Software tab houses operational tools. All five are currently
**stubbed** (page renders with a "En desarrollo" notice, link works,
copy is in place).

## 01 — Pipeline de Negocios 🚧

- **Route:** `/{locale}/herramientas/software/pipeline`
- **Pattern:** kanban with 4 columns: Prospecto → Bajo Contrato →
  Asignado → Cerrado
- **Persistence:** `localStorage['jdps.pipeline.v1']`
- **Per-deal shape (proposed):**
  ```ts
  {
    id, createdAt, updatedAt,
    address, city, state,
    sellerName, sellerPhone,
    purchasePrice, arv, rehab,
    stage: 'prospecto' | 'bajo_contrato' | 'asignado' | 'cerrado',
    notes: string,
    contractDate?, closingDate?
  }
  ```
- **UX:** drag-and-drop between columns (use `@dnd-kit` or simple
  click-to-move dropdowns first; ship the dropdown version, defer DnD).

## 02 — Lista de Compradores 🚧

- **Route:** `/{locale}/herramientas/software/compradores`
- **Pattern:** CRM-lite table
- **Per-buyer shape:**
  ```ts
  {
    id, name, phone, email,
    criteria: { minBeds, minBaths, maxPrice, minPrice },
    areas: string[],          // zip codes or neighborhoods
    notes: string,
    tags: string[],           // 'cash', 'finance', 'sub-to', etc.
    lastContact?, dealsCount
  }
  ```
- **Persistence:** `localStorage['jdps.buyers.v1']`
- **UX:** searchable table, click-row to expand details, "Match this
  deal" button that filters buyers by criteria/area/price.

## 03 — Skip Trace Helper 🚧

- **Route:** `/{locale}/herramientas/software/skip-trace`
- **Purpose:** NOT a paid skip trace service. Provides a formatted
  template the user fills out manually after researching via their
  preferred paid tool.
- **Output:** clean formatted text/copy block of owner research with
  fields: owner name, mailing address vs property address mismatch,
  phones (and source), emails, related people, vesting (LLC etc.).
- **No external API integration** in v1 — purely a structured form.

## 04 — Generador de Cartas Directas (Direct Mail) 🚧

- **Route:** `/{locale}/herramientas/software/cartas`
- **Pattern:** Claude-generated seller letter
- **Inputs:** language (ES/EN), motivation type, owner name (optional),
  property address, market hook (optional)
- **Motivation types:** Sucesión (probate), Pre-ejecución hipotecaria,
  Propietario cansado (tired landlord), Propiedad vacante, Mudanza
  fuera del área, Divorcio, Atraso de impuestos
- **API:** new route `POST /api/letter-generate`
- **Model:** `claude-sonnet-4-5`, system prompt anchored to wholesale-buy
  letter style (warm, brief, single-CTA "Call/text [number]")
- **Output:** copy-pasteable letter + "Save to PDF" option later

## 05 — Constructor de Scripts de Llamadas en Frío 🚧

- **Route:** `/{locale}/herramientas/software/scripts`
- **Pattern:** Claude-generated cold-call script
- **Inputs:** language, lead type (probate, absentee, pre-foreclosure,
  tired landlord, FSBO, expired listing), tone (consultative /
  direct), call goal (set appointment / qualify / make offer)
- **API:** new route `POST /api/script-generate`
- **Output:** script with branching ("if they say X → say Y"), objection
  rebuttals, closing question.

## Shared patterns for AI-generation tools

When building the Direct Mail and Scripts generators:

1. **Server-side only** for the API key — never expose it client-side
2. **System prompt** lives in the route file
3. **Constrain output format** in the system prompt for parseability
4. **Show a streaming response** if possible (use Anthropic streaming) —
   feels more responsive than waiting for the full message
5. **Default model** `process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5'`
6. **Set `maxDuration = 60`** on the route
7. **Add user-friendly error UI** — translate SDK errors before showing

## State management

For v1 keep it simple:

- `useState` + `useMemo` inside each page's client component
- Persistent state → `localStorage` with versioned keys (`v1`, `v2`)
- No Zustand / Redux / Jotai until we have multi-page shared state
- Forms can use plain controlled inputs; reach for `react-hook-form`
  only if validation gets complex
