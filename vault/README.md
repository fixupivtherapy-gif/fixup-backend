# JD's Property Solutions — Obsidian Vault

This folder is an **Obsidian vault**. It is the source-of-truth knowledge
base for the JD's Property Solutions wholesale real estate platform.

## How to open

1. Clone the repository to your local machine.
2. Open Obsidian.
3. **Open folder as vault** → select this `vault/` directory.
4. Start at [[00 — Index]].

The `.obsidian/` config folder will be created automatically the first
time you open the vault.

## Why this exists

- **Single source of truth** for the project: brand, design tokens,
  feature specs, contract source text, decisions log, and roadmap.
- **Lower token usage in future Claude sessions.** Instead of re-pasting
  the full project spec into a new chat, you ask Claude to read the
  relevant vault note. The repository-level `CLAUDE.md` tells Claude
  Code how to use the vault.
- **Portable.** You can sync the entire vault via iCloud / Dropbox /
  Obsidian Sync if you want it on your phone or another machine.

## Vault map

| File                            | Purpose                                          |
| ------------------------------- | ------------------------------------------------ |
| [[00 — Index]]                  | Map of content (MOC) — start here                |
| [[01 — Project Overview]]       | What JDPS is, who it's for, the elevator pitch   |
| [[02 — Brand & Design System]]  | Colors, typography, visual language, dos & don'ts |
| [[03 — Tech Stack & Architecture]] | Stack choices, folder layout, key conventions  |
| [[04 — Calculadoras]]           | All 8 calculators — specs, math, status          |
| [[05 — Contratos]]              | Both contract templates verbatim (ES + EN)       |
| [[06 — Diccionario]]            | Dictionary structure, categories, expansion plan |
| [[07 — Software]]               | 5 software-tab tools — specs and status          |
| [[08 — i18n]]                   | Bilingual strategy, message catalogs, formats    |
| [[09 — Decisions Log]]          | Dated record of every project decision           |
| [[10 — Roadmap & Status]]       | What's done, what's stubbed, what's next         |
| [[11 — Working Protocol]]       | How to run sessions efficiently with Claude      |

## Tag conventions

- `#decision` — locked-in choices that should not change without discussion
- `#spec` — feature or component specifications
- `#status` — anything that tracks progress
- `#open` — open questions, parked decisions
- `#legal` — contracts, compliance, jurisdiction matters
