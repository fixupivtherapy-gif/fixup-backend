---
title: Contratos
tags:
  - spec
  - legal
  - decision
---

# 05 — Contratos

## Source of truth

The user provided the canonical Spanish contracts directly. We
preserved them **verbatim** in section structure and language; the
English versions are faithful translations meant to mirror the same
legal effect.

**Code location:**

- `web/data/contracts/cash-contract.ts` — Promesa de Compraventa (ES + EN)
- `web/data/contracts/assignment.ts` — Contrato de Asignación (ES + EN)
- `web/data/contracts/types.ts` — shared structure
- `web/data/contracts/index.ts` — `getContract(id, locale)`
- `web/lib/docx-generator.ts` — converts a `ContractTemplate` into a
  `Blob` with proper formatting

## Common conventions #decision

- **Jurisdiction:** Puerto Rico (arbitration). Editable per deal later
  but defaults to PR.
- **Currency:** USD.
- **Fields:** `[CAMPOS_ENTRE_CORCHETES]` in Spanish, `[BRACKETED_FIELDS]`
  in English. Both versions must preserve placeholders for per-deal fill.
- **As-Is:** standard property condition clause across both contracts.
- **EMD:** paid day of inspection or within 24 hours after; non-refundable
  once inspection period ends.
- **Assignment rights:** pre-granted to buyer without seller approval.

## Contract A — Promesa de Compraventa (Cash / Purchase & Sale) ✅ shipped

5 pages in the original PDF. 16 sections:

| # | ES                          | EN                           |
| --- | --------------------------- | ---------------------------- |
| I   | Partes                      | Parties                      |
| II  | Propiedad                   | Property                     |
| III | Precio de Compra            | Purchase Price               |
| IV  | Depósito (EMD)              | Earnest Money Deposit (EMD)  |
| V   | Periodo de Inspección       | Inspection Period            |
| VI  | Condición de la Propiedad   | Condition of the Property    |
| VII | Acceso a la Propiedad       | Access to the Property       |
| VIII| Derecho de Cesión           | Right of Assignment          |
| IX  | Cierre                      | Closing                      |
| X   | Costos de Cierre            | Closing Costs                |
| XI  | Incumplimiento              | Default                      |
| XII | Resolución de Disputas      | Dispute Resolution           |
| XIII| Modificaciones              | Amendments                   |
| XIV | Naturaleza del Documento    | Nature of the Document       |
| XV  | Acuerdo Completo            | Entire Agreement             |
| XVI | Firmas                      | Signatures                   |

**Signature lines:** Vendedor, Comprador, Testigo (Opcional) — each with
firma/nombre/fecha.

**Bracketed fields used:**

- `[DIA]`, `[MES]`, `[AÑO]` / `[DAY]`, `[MONTH]`, `[YEAR]`
- `[NOMBRE_DEL_VENDEDOR]` / `[SELLER_NAME]`
- `[NOMBRE_DEL_COMPRADOR]` / `[BUYER_NAME]`
- `[DIRECCION_DE_LA_PROPIEDAD]` / `[PROPERTY_ADDRESS]`
- `[PRECIO_DE_COMPRA]` / `[PURCHASE_PRICE]`
- `[MONTO_EMD]` / `[EMD_AMOUNT]`
- `[DIAS_INSPECCION]` / `[INSPECTION_DAYS]`
- `[FECHA_CIERRE]` / `[CLOSING_DATE]`

## Contract B — Contrato de Asignación (Assignment) ✅ shipped

10 sections (the original had 9 plus signatures — we made signatures
section X for consistency):

| # | ES                              | EN                                |
| --- | ------------------------------- | --------------------------------- |
| I   | Partes del Contrato             | Parties to the Contract           |
| II  | Referencia al Contrato Original | Reference to Original Contract    |
| III | Assignment Fee                  | Assignment Fee                    |
| IV  | Declaraciones del Comprador Final | End Buyer Representations       |
| V   | Protección para el Wholesaler   | Wholesaler Protection             |
| VI  | Cláusula de Contingencia        | Contingency Clause                |
| VII | Resolución de Disputas          | Dispute Resolution                |
| VIII| Modificaciones al Contrato      | Amendments                        |
| IX  | Confirmación de Depósito        | Deposit Confirmation              |
| X   | Firmas                          | Signatures                        |

**Signature lines:** Wholesaler, Comprador Final, Testigo 1, Testigo 2 —
each with firma/fecha (no name line in user's original).

**Key features:**

- **Section III:** assignment fee split into initial deposit (paid
  within X days of signing) + final payment at closing.
- **Section V (anti-circumvention):** end buyer cannot negotiate
  directly with seller without wholesaler authorization.
- **Section IX:** EMD is **separate** from assignment fee — confirms a
  distinct $X earnest money already paid.

**Bracketed fields used:**

- `[NOMBRE_DEL_WHOLESALER]` / `[WHOLESALER_NAME]`
- `[NOMBRE_DEL_COMPRADOR_FINAL]` / `[END_BUYER_NAME]`
- `[NOMBRE_DEL_VENDEDOR]` / `[SELLER_NAME]`
- `[DIRECCION_DE_LA_PROPIEDAD]` / `[PROPERTY_ADDRESS]`
- `[ASSIGNMENT_FEE_TOTAL]` / `[ASSIGNMENT_FEE_TOTAL]`
- `[ASSIGNMENT_FEE_INICIAL]` / `[ASSIGNMENT_FEE_INITIAL]`
- `[ASSIGNMENT_FEE_FINAL]` / `[ASSIGNMENT_FEE_FINAL]`
- `[DIAS_DEPOSITO_INICIAL]` / `[INITIAL_DEPOSIT_DAYS]`
- `[MONTO_EMD]` / `[EMD_AMOUNT]`
- `[DIA]`, `[MES]`, `[AÑO]` / `[DAY]`, `[MONTH]`, `[YEAR]`

## DOCX rendering

`web/lib/docx-generator.ts` walks the `ContractTemplate` structure and
emits a `.docx` Blob via the `docx` library:

- **Title:** centered, bold, 32pt
- **Section heads:** `{number}.` in clay (`#A8553D`) + title in ink
- **Body:** 22pt, line height 320 twips
- **Lists:** indented 360 twips, bullet `•` in clay
- **Signature blocks:** label bold, then firma/nombre/fecha lines

User downloads via button on `/{locale}/herramientas/recursos/contratos`.

## Future contracts (planned per original spec)

Not yet built — would extend the same `ContractTemplate` structure:

- Addendum al Contrato / Addendum to Contract
- Acuerdo de Terminación / Termination Agreement
- Acuerdo de Joint Venture / Joint Venture Agreement
- Acuerdo de Novación / Novation Agreement
- Contrato de Opción / Option Contract
- Contrato de Financiamiento Creativo / Creative Finance Contract

## Generator UI (planned — currently stubbed)

`/{locale}/herramientas/recursos/generador` will:

1. User selects contract type + language
2. Guided form for fields (buyer, seller, property, terms, dates)
3. Optional Claude pass to refine language for the specific deal flavor
4. Output `.docx` + final PDF

**Note:** Always preserve the user's exact contract language — Claude
should be used for *clause customization*, not for rewriting the
templates themselves.

## Legal disclaimer (always include in UI)

> Estas plantillas están basadas en formatos internos. Revísalas con un
> abogado licenciado en la jurisdicción donde opere antes de usarlas en
> producción.
