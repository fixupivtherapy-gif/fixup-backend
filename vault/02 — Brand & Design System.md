---
title: Brand & Design System
tags:
  - spec
  - design
  - decision
---

# 02 — Brand & Design System

## Color palette #decision

Warm neutrals + a single restrained accent. **Never introduce a second accent.**

| Token       | Light hex | Dark hex  | Usage                                |
| ----------- | --------- | --------- | ------------------------------------ |
| `bone`      | `#F5F1EA` | `#1F1B16` | Page background                      |
| `paper`     | `#FAF7F2` | `#25201A` | Surfaces (cards, inputs)             |
| `ink`       | `#1A1714` | `#F0EADB` | Primary text                         |
| `ink-soft`  | `#2A2520` | `#E0D9C7` | Secondary headings                   |
| `muted`     | `#6B6358` | `#A39B8C` | Body / supporting text               |
| `muted-soft`| `#8F8779` | `#847C6E` | Captions, placeholders               |
| `rule`      | `#D9D2C5` | `#3A3328` | 1px hairline borders                 |
| `clay`      | `#A8553D` | `#C26B52` | **Accent** — CTAs, focus, emphasis   |
| `clay-dark` | `#8B4632` | `#A8553D` | Accent hover                         |

### How to use clay

- Primary CTA backgrounds (sparingly — one per screen, max two)
- Focus rings (2px outline, 2px offset)
- Selection highlight (`::selection`)
- Active state on tabs (bottom 2px border)
- Hover state on list items (text → clay)
- Numbered markers in section heads ("— 01 / Plataforma")
- Italic emphasis word in hero headline
- **Never** for body text, large surfaces, or decorative fills

## Typography #decision

| Role     | Family        | Loaded via                                |
| -------- | ------------- | ----------------------------------------- |
| Display  | Fraunces      | `next/font/google` (`var(--font-display)`) |
| UI/body  | Inter Tight   | `next/font/google` (`var(--font-sans)`)    |
| Mono     | JetBrains Mono | `next/font/google` (`var(--font-mono)`)   |

- **Headings** (`h1`–`h4`) always Fraunces, weight 400, letter-spacing `-0.015em`
- **Hero** uses italic Fraunces for the emphasized phrase, in clay
- **Numbers** (prices, calculator outputs) always JetBrains Mono with
  tabular numerals — class `font-mono tabular-nums`
- **Eyebrows / section labels** small-caps, tracking `0.14em`, muted color

Class helper: `.eyebrow` applies the small-caps treatment.

## Visual language #decision

- **Corners:** 4px (`rounded` token = `4px`). Never `rounded-full` except
  for true circular controls.
- **Borders:** 1px hairline (`border-rule`). Avoid heavy box-shadows.
- **Texture:** paper-grain SVG noise overlay at low opacity, mix-blend
  multiply on light mode, screen on dark. See `app/globals.css`.
- **Spacing:** generous and asymmetric. Section breaks at 24–32 rem in
  vertical rhythm.
- **Icons:** Lucide React, stroke-width `1.5`. Never emoji in nav or UI.
- **Dividers:** thin rules with optional centered small-caps label.
  Component: `<SectionDivider label="…" align="left|center|right" />`.

## Layout conventions

- **Top header:** sticky, backdrop-blur, wordmark left + ES/EN toggle right.
- **Tab nav:** below header, 3 tabs (Calculadoras / Recursos / Software)
  with a numeric "01 / 02 / 03" mono marker before each label. Active
  tab gets a 2px clay underline.
- **Hero:** 12-column grid, asymmetric. Headline + supporting text in
  cols 1–7. Right column (8–12) offset down with a small trust block
  bordered by a left-rule.
- **Feature lists:** ALWAYS list-row pattern, never 3-card grid:
  - Mono numeric marker (clay) → title (Fraunces) → summary (muted) →
    right-aligned "Abrir →" chevron
  - Hairline rule between rows, full-width

## Component primitives

Lives in `web/components/`:

- `<Button variant primary|secondary|ghost|link size sm|md|lg />`
- `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardBody>`, `<CardFooter>`
- `<Input />`, `<Label />`, `<Field label hint prefix suffix />`
- `<SectionDivider label align />`
- `<ResultRow label value emphasis hint />`
- `<PageHeader eyebrow title description backHref backLabel />`
- `<NavShell>` — top header + tab nav + footer
- `<Wordmark size sm|md|lg asLink />`
- `<LanguageToggle />`
- `<ComingSoon locale />` — used by stubbed routes

## Anti-patterns (do NOT do)

- ❌ Three-icon card grid for feature overview
- ❌ Centered gradient hero
- ❌ Multiple accent colors
- ❌ `rounded-full`, `rounded-2xl` on cards
- ❌ Heavy `shadow-lg` / `shadow-2xl` on cards
- ❌ Emoji in navigation labels
- ❌ Sans-serif headlines (always Fraunces)
- ❌ Pure black `#000` or pure white `#FFF`
- ❌ Saturated blue / purple
- ❌ Color-only success/error states without text label
