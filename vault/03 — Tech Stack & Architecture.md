---
title: Tech Stack & Architecture
tags:
  - spec
  - architecture
---

# 03 — Tech Stack & Architecture

## Stack decisions #decision

| Concern         | Choice                              | Notes                                   |
| --------------- | ----------------------------------- | --------------------------------------- |
| Framework       | Next.js 14 (App Router)             | 14.2.33+ for security patch             |
| Language        | TypeScript (strict)                 | `tsc --noEmit` clean                    |
| Styling         | Tailwind CSS                        | Custom tokens, no stock shadcn look     |
| Component base  | Radix primitives + custom shadcn-style | Heavily customized — see `components/ui/` |
| i18n            | next-intl 3.x                       | locale prefix `always`                  |
| AI              | Anthropic SDK (`@anthropic-ai/sdk`) | Model: `claude-sonnet-4-5`              |
| DOCX            | `docx` library                      | Used for contract generation            |
| PDF (roadmap)   | `pdf-lib`                           | Not yet wired                           |
| Icons           | `lucide-react`                      | Stroke 1.5                              |
| Persistence     | LocalStorage (v1)                   | No backend DB                            |
| Deploy          | Vercel                              | Root Directory = `web/`                 |

## Folder layout

```
fixup-backend/                          ← repo root
├── CLAUDE.md                            ← Claude Code memory (auto-loaded)
├── server.js, package.json              ← UNRELATED Fix Up IV Therapy code (main branch)
├── vault/                               ← this Obsidian vault
└── web/                                 ← Next.js app
    ├── app/
    │   ├── layout.tsx                   ← Minimal root (passes children)
    │   ├── globals.css                  ← Design tokens + texture
    │   └── [locale]/
    │       ├── layout.tsx               ← Locale layout (fonts, NavShell)
    │       ├── page.tsx                 ← Home
    │       └── herramientas/
    │           ├── calculadoras/
    │           │   ├── page.tsx         ← Calculadoras index
    │           │   ├── mortgage/
    │           │   ├── arv/
    │           │   ├── fix-flip/
    │           │   ├── rehab/
    │           │   ├── section-8/       ← stub
    │           │   ├── seller-finance/  ← stub
    │           │   ├── subject-to/      ← stub
    │           │   └── sheets/          ← stub
    │           ├── recursos/
    │           │   ├── page.tsx
    │           │   ├── diccionario/
    │           │   ├── contratos/
    │           │   └── generador/       ← stub
    │           └── software/
    │               ├── page.tsx
    │               ├── pipeline/        ← stub
    │               ├── compradores/     ← stub
    │               ├── skip-trace/      ← stub
    │               ├── cartas/          ← stub
    │               └── scripts/         ← stub
    ├── app/api/
    │   └── rehab-estimate/route.ts      ← Claude vision endpoint
    ├── components/                      ← UI primitives + composed components
    │   ├── ui/                          ← Button, Card, Input, Label, Field
    │   ├── nav-shell.tsx
    │   ├── wordmark.tsx
    │   ├── language-toggle.tsx
    │   ├── section-divider.tsx
    │   ├── page-header.tsx
    │   ├── result-row.tsx
    │   └── coming-soon.tsx
    ├── data/
    │   ├── dictionary.ts                ← 60+ ES/EN terms
    │   └── contracts/
    │       ├── types.ts
    │       ├── cash-contract.ts         ← Promesa de Compraventa ES+EN
    │       ├── assignment.ts            ← Contrato de Asignación ES+EN
    │       └── index.ts
    ├── i18n/
    │   ├── routing.ts                   ← Locale config
    │   └── request.ts                   ← next-intl message loader
    ├── lib/
    │   ├── utils.ts                     ← cn(), formatters
    │   ├── fonts.ts                     ← Fraunces, Inter Tight, JetBrains Mono
    │   ├── calculators.ts               ← Pure-function math (mortgage, arv, fix-flip)
    │   ├── docx-generator.ts            ← DOCX export
    │   └── anthropic.ts                 ← Claude client + model id
    ├── messages/
    │   ├── es.json                      ← Spanish strings (default)
    │   └── en.json                      ← English strings
    ├── middleware.ts                    ← Locale routing
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── postcss.config.mjs
    ├── tsconfig.json
    ├── vercel.json
    ├── README.md                        ← User-facing setup doc (Spanish)
    └── package.json
```

## Routing model

- **Locale prefix:** always present, `/es/...` or `/en/...`
- **Middleware:** `web/middleware.ts` uses `createMiddleware` from
  next-intl with `localePrefix: 'always'`
- **Server components** use `setRequestLocale(locale)` then either
  `useTranslations('namespace')` (with provider) or `getTranslations()`
- **Client components** use `useTranslations()` directly via the
  `NextIntlClientProvider` set up in `[locale]/layout.tsx`
- **Language toggle:** preserves current pathname and swaps locale —
  see `components/language-toggle.tsx`

## API routes

Currently one: `POST /api/rehab-estimate`

- Accepts `{ images: [{base64, mediaType}], locale: 'es'|'en' }`
- Validates: 1–8 images
- Calls Claude with vision-mode `messages.create`, JSON-only response
- Returns `{ estimate: {items, totalLow, totalHigh, summary, conditionScore} }`

Add new API routes under `app/api/*/route.ts` following the same pattern.
`runtime = 'nodejs'` and `maxDuration = 60` when calling Anthropic.

## Persistence (v1)

LocalStorage for now. No backend database. Future modules requiring
persistence (Pipeline, Buyers List) will use localStorage with a
versioned shape, like:

```ts
const KEY = 'jdps.pipeline.v1';
```

If we outgrow localStorage, the path is to add a Supabase or Convex
layer — but **not until we have real users**. Avoid premature backend.

## Build & deploy

```bash
cd web
npm install
npm run build       # Validates types + builds 44+ static routes
npm run typecheck   # tsc --noEmit (CI-friendly)
```

Vercel auto-deploys on push if Root Directory = `web/`. Add
`ANTHROPIC_API_KEY` in the Vercel env settings.

## Common pitfalls (don't repeat them)

- **`next/font` `axes`** can only be passed when using variable weight.
  We use the default Fraunces export with `style: ['normal', 'italic']`.
- **next-intl** v3 needs the plugin wrapper in `next.config.mjs`:
  `createNextIntlPlugin('./i18n/request.ts')`.
- **Anthropic SDK** types: import `TextBlock` from
  `@anthropic-ai/sdk/resources/messages` for content narrowing — do NOT
  invent a namespace.
- **Vercel root** must be set to `web/` in the dashboard. The
  `vercel.json` only sets framework/build commands, not root directory.
