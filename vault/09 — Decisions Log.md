---
title: Decisions Log
tags:
  - decision
---

# 09 — Decisions Log

Append-only log of explicit project decisions. Newest at top.

---

## 2026-05-20 — Knowledge base in Obsidian + CLAUDE.md

**Decision:** Create an Obsidian vault at `vault/` and a `CLAUDE.md` at
repo root.

**Reason:** User wants future Claude sessions to consume fewer tokens by
referencing structured project memory instead of re-pasting the full
spec each session.

**Mechanism:**

- `CLAUDE.md` auto-loads at every Claude Code session in this repo
  (short, high-signal, points to vault)
- `vault/` holds dense markdown notes Claude reads on demand
- User opens `vault/` as an Obsidian vault locally to read/edit

---

## 2026-05-19 — v1 scope locked

**Decision:** v1 ships with full design system, shell, 3 working
calculators (Mortgage, ARV, Fix & Flip), Rehab Estimator with Claude
vision, 60-term bilingual dictionary, and 2 contract templates (Cash +
Assignment) with `.docx` export in both languages. Remaining modules
stubbed as "En desarrollo."

**Reason:** Meets all 8 explicit deliverables in the original spec
without overpromising on stubbed modules.

---

## 2026-05-19 — Assignment Contract template

**Decision:** Use the user's Contrato de Asignación verbatim as the
Spanish source of truth.

**Key clauses preserved:**

- 10 sections (the user's 9 + signatures as X for consistency)
- Assignment fee split: initial deposit (within X days of signing) +
  final at closing
- EMD is **independent** of the assignment fee (Section IX)
- Anti-circumvention clause (Section V): end buyer cannot negotiate
  directly with seller without wholesaler authorization
- Two witness lines (not one optional)
- PR arbitration venue

---

## 2026-05-19 — Cash Contract template

**Decision:** Use the user's Contrato de Promesa de Compraventa
verbatim as the Spanish source of truth.

**Key clauses preserved:**

- 16 sections including page footer "El comprador y el vendedor acusan
  recibo de una copia de esta página"
- EMD paid day of inspection or within 24 hours, non-refundable after
  inspection ends
- Assignment rights pre-granted to buyer without seller approval
- "As Is" condition standard
- PR arbitration venue
- 3-way closing-cost checkbox (Comprador / Vendedor / Ambos)
- Optional witness line (single)

---

## 2026-05-19 — Jurisdiction = Puerto Rico

**Decision:** Default contract jurisdiction to Puerto Rico (arbitration
in PR). User originally said "multi-state / generic US" but the
provided contracts both anchor PR — PR overrides.

**Implementation:** Hard-coded in both contract templates. Editable per
deal is a roadmap item, not v1.

---

## 2026-05-19 — Accent color = muted terracotta #A8553D

**Decision:** Single accent across the whole platform.

**Rejected alternatives:**

- Deep olive `#5C5D3B` — too institutional
- Ink navy `#2A3140` — pulls aesthetic toward generic financial SaaS

**Reason:** Terracotta differentiates most from typical AI/SaaS look,
pairs naturally with the warm bone neutrals, communicates
"grounded/artisanal" without being precious.

---

## 2026-05-19 — Wordmark only (no symbol)

**Decision:** v1 brand is a typographic wordmark only — no logo mark or
monogram.

**Treatment:** "JD" in Fraunces + apostrophe in clay accent + "Property
Solutions" in small-caps grotesk as a subtitle.

**Reason:** Fast, polished, no asset dependencies. Symbol can come later.

---

## 2026-05-19 — Stack baseline

**Decision:**

- Next.js 14 (App Router) + TypeScript
- Tailwind with custom tokens (no stock shadcn look)
- next-intl v3 for i18n
- Anthropic SDK with `claude-sonnet-4-5`
- `docx` library for .docx generation
- `pdf-lib` reserved for future PDF export
- LocalStorage for v1 persistence (no backend)
- Deploy to Vercel with Root Directory = `web/`

**Reason:** Matches user's stated stack. Stays serverless-friendly and
deployable without infrastructure work.

---

## 2026-05-19 — Vault structure: `web/` subdirectory

**Decision:** New Next.js app lives in `web/`, not at repo root.

**Reason:** Repo root contains an unrelated Fix Up IV Therapy backend
(`server.js`, root `package.json`) on `main`. Putting Next.js at root
would conflict. `web/` cleanly separates the apps.

**Tradeoff:** Vercel deployment requires manually setting "Root
Directory" to `web/` in the dashboard (one-time UI setting, not a code
change).

---

## Pending / open decisions #open

- **Custom domain** for production — not yet decided
- **Per-deal jurisdiction editor** — roadmap, deferred from v1
- **PDF export** for contracts (in addition to .docx) — roadmap
- **Backend** for cross-device sync of Pipeline + Buyers — defer until
  we have real users complaining
- **Logo/monogram** — defer to v2; collect feedback on wordmark first
- **Section 8 FMR lookup** — currently user-entered; could embed HUD API
  later (free, gov-published)
