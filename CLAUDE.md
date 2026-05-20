# Claude — Project Memory

> Auto-loaded by Claude Code at session start. Keep this **short and pointed**.
> Deep context lives in [`vault/`](./vault/) — read on-demand.

---

## Project

**JD's Property Solutions** — bilingual (ES default / EN toggle) wholesale
real estate platform for investors and wholesalers. Calculators,
bilingual contracts, and operating software. Mobile-first web app.

## Where things live

| Path                     | What                                              |
| ------------------------ | ------------------------------------------------- |
| `web/`                   | Next.js 14 app (the product)                      |
| `vault/`                 | Obsidian vault — full project knowledge base      |
| `server.js`, `package.json` (root) | **Unrelated** Fix Up IV Therapy backend — leave alone |

## Branch convention

Develop on `claude/jds-property-solutions-*`. Never push to `main` without
explicit ask.

## Locked-in decisions (don't re-litigate without user confirmation)

- **Accent color:** muted terracotta `#A8553D` (NOT navy, NOT olive)
- **Default language:** Spanish (`es`), English (`en`) via top-right toggle
- **Contract jurisdiction:** Puerto Rico (arbitration clause)
- **Contract source of truth:** user's working templates, preserved verbatim
  in `vault/05 — Contratos.md` and `web/data/contracts/*.ts`
- **Typography:** Fraunces (display) + Inter Tight (sans) + JetBrains Mono (mono)
- **Visual rules:** 4px corners (not pill-rounded), hairline 1px borders
  (not heavy shadows), paper-grain texture overlay, small-caps section
  dividers, list-style nav (not 3-card grids), asymmetric hero layout

## Token-efficient session protocol

When the user opens a session and asks for an update:

1. **Don't re-read the full spec.** It is in `vault/01 — Project Overview.md`
   and the per-feature notes. Read only what the task touches.
2. **Read `vault/10 — Roadmap & Status.md` first** to know what's done.
3. **Read `vault/11 — Working Protocol.md`** for conventions.
4. **For a specific feature** (e.g. "add the Section 8 calculator"),
   read only that feature's vault note + the corresponding code.
5. **After making meaningful changes**, append to `vault/09 — Decisions Log.md`
   and update `vault/10 — Roadmap & Status.md`.

## Build & run

```bash
cd web
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000 (redirects to /es)
npm run build                # production build
npm run typecheck            # tsc --noEmit
```

## Stack quick-ref

Next.js 14 (App Router) · TypeScript · Tailwind (custom tokens) ·
next-intl 3.x · Anthropic SDK (`claude-sonnet-4-5`) · `docx` library ·
`pdf-lib` (roadmap) · Lucide icons · Radix primitives.

## Deploy

Vercel. Set **Root Directory = `web`** in the Vercel project UI. No other
config changes.
