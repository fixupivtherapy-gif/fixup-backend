---
title: Diccionario
tags:
  - spec
  - feature
  - content
---

# 06 — Diccionario

## Goal

A bilingual real estate / wholesaling dictionary, **350+ terms** at full
scale. Currently **60 terms shipped** as a seed.

## Data shape

`web/data/dictionary.ts` exports `DICTIONARY: DictionaryTerm[]` where each
term is:

```ts
{
  id: 'wholesaling',                  // url-safe slug, stable
  category: 'wholesaling',            // one of 6 categories
  es: {
    term: 'Wholesaling (mayoreo)',
    definition: '...',
    example: '...'                    // optional but encouraged
  },
  en: {
    term: 'Wholesaling',
    definition: '...',
    example: '...'
  }
}
```

## Categories #decision

| Slug             | ES label                    | EN label              |
| ---------------- | --------------------------- | --------------------- |
| `wholesaling`    | Wholesaling                 | Wholesaling           |
| `creativo`       | Financiamiento creativo     | Creative finance      |
| `financiamiento` | Financiamiento              | Financing             |
| `legal`          | Legal                       | Legal                 |
| `marketing`      | Marketing                   | Marketing             |
| `analisis`       | Análisis de negocios        | Deal analysis         |

Defined in `CATEGORY_LABELS` in `data/dictionary.ts`.

## UI

- Search bar (matches across ES + EN term, definition, example)
- Category chip filters (incl. "Todas")
- Each result card shows the primary-language entry (term + definition +
  example) plus a smaller "Equivalente en inglés / Spanish equivalent"
  block at the bottom

`web/app/[locale]/herramientas/recursos/diccionario/`
- `page.tsx` (server, sets locale, renders header)
- `dictionary-client.tsx` (client, search/filter)

## Expanding to 350+

To add new terms:

1. Append to the `DICTIONARY` array in `data/dictionary.ts`
2. Pick an `id` slug (no duplicates — check existing)
3. Choose a category from the 6 above (or propose a new one + add to
   `CATEGORY_LABELS`)
4. Always provide both `es` and `en` blocks with full definitions
5. Examples are encouraged — they make terms tangible

### Bulk add via Claude (recommended for scaling)

Use a prompt like:

> Given this format `{id, category, es:{term, definition, example},
> en:{term, definition, example}}`, generate 50 more terms covering
> [topic]. Topics still under-represented: [list from gap analysis].
> Return as a TypeScript array.

Review for accuracy before committing — Claude will occasionally
invent plausible-sounding terms.

## Current seed (60 terms)

Wholesaling: 7 · Creative finance: 8 · Analysis: 11 · Financing: 8 ·
Legal: 7 · Marketing: 11. (Some terms cross-categorize but each picks one.)

## Gap targets to reach 350+

- More legal terms (title insurance flavors, deed types, lien terminology)
- Tax-strategy terms (1031 exchanges, depreciation, cost segregation)
- Commercial RE specifics (NNN, GLA, T-12, T-3)
- Property management (eviction, security deposit law, fair housing)
- Lending detail (DTI, FICO, LTV variants, ARM types)
- Construction (rough-in, drywall stages, permitting)
- Marketing channel detail (PPC, SEO, Facebook lead form, KVcore)
- Spanish-market regional dialect notes (PR, MX, Caribbean)
