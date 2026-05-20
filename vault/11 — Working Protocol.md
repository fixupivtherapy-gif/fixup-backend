---
title: Working Protocol
tags:
  - protocol
  - operations
---

# 11 — Working Protocol

How to work with Claude on this project **without wasting tokens**.

## The core idea

Every Claude Code session in this repo automatically loads
[[CLAUDE.md (root)]] — that file is intentionally short and points
here. **You do not need to re-paste the project spec.** Instead, tell
Claude what task you're doing and which vault note(s) it should read.

## Session opening — what to say

### ✅ Good (low token cost)

> Continúa con la calculadora de Sección 8. Lee `vault/04 — Calculadoras.md`
> y `vault/02 — Brand & Design System.md` antes de empezar.

> Add the Pipeline de Negocios module. Spec is in `vault/07 — Software.md`.
> Use the same patterns as the existing calculators.

> Bug: el toggle ES/EN no preserva la ruta. Mira `components/language-toggle.tsx`.

### ❌ Avoid (high token cost)

> [paste of the original 800-line spec] now add Section 8.

> Tell me everything about this project and then add Section 8.

> Re-read the whole project before making changes.

## What Claude does automatically each session

1. Reads `CLAUDE.md` at repo root (auto-loaded by Claude Code) — ~200 lines
2. Knows where the vault is and what's in it (from the CLAUDE.md map)
3. Does NOT read every vault note proactively — it reads only what your
   task touches

## When to update the vault

Update the vault whenever:

- A new feature is shipped → update [[10 — Roadmap & Status]]
- A decision is made → append to [[09 — Decisions Log]] with a date heading
- Brand, design tokens, or visual rules change → update [[02 — Brand & Design System]]
- A new contract template is added → update [[05 — Contratos]]
- The folder layout changes → update [[03 — Tech Stack & Architecture]]

**Claude should propose vault updates when it makes a meaningful change.**
If Claude doesn't, the user can prompt: "Update the vault with what you
just did."

## When NOT to update the vault

- Minor copy edits
- Bug fixes that don't change architecture
- Routine dependency bumps

## Vault editing conventions

- **Newest decisions at the top** of [[09 — Decisions Log]]
- **Status changes** flip checkboxes in [[10 — Roadmap & Status]]
- **Wikilinks** (`[[...]]`) for cross-references — they're real navigable
  links in Obsidian
- **Tags** at the top of each note (in frontmatter) — used for filtering
  in Obsidian's tag pane
- **Code references** by file path (e.g. `web/lib/calculators.ts`) — keep
  them up to date when you move files

## Token-saving cheatsheet

| Instead of...                              | Do this...                                  |
| ------------------------------------------ | ------------------------------------------- |
| Pasting the full spec                      | Reference `vault/<note>.md`                 |
| "Tell me about this project"               | "Read `00 — Index.md` and summarize status" |
| Re-explaining brand for every UI request   | "Use the design system per `02 — …`"        |
| Asking Claude to invent contract clauses   | "Use the templates in `data/contracts/`"    |
| Re-listing every calculator                | "See `04 — Calculadoras.md` for the list"   |

## Branch + commit conventions

- **Branch:** develop on `claude/jds-property-solutions-*` — never
  push to `main` without explicit ask
- **Commits:** describe the WHY, not the WHAT. One commit per logical
  change.
- **Don't squash CI fixes** mid-feature — they're useful history. Squash
  before merging to `main` if you must.
- **Always run `npm run build` + `npm run typecheck`** before pushing.
  Both must pass.

## When a session is going off-rails

If Claude is regenerating the whole spec, hallucinating decisions, or
ignoring vault structure:

1. Stop. Say: "Read `vault/09 — Decisions Log.md` and `vault/11 —
   Working Protocol.md` before continuing."
2. If it persists, end the session and start fresh — context may be
   poisoned.
3. If a decision was wrong, log it in [[09 — Decisions Log]] with a
   note about why it was reversed.
