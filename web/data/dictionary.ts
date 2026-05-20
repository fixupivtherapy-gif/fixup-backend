export type DictionaryCategory =
  | 'wholesaling'
  | 'creativo'
  | 'financiamiento'
  | 'legal'
  | 'marketing'
  | 'analisis';

export interface DictionaryTerm {
  id: string;
  category: DictionaryCategory;
  es: {
    term: string;
    definition: string;
    example?: string;
  };
  en: {
    term: string;
    definition: string;
    example?: string;
  };
}

export const CATEGORY_LABELS: Record<
  DictionaryCategory,
  { es: string; en: string }
> = {
  wholesaling: { es: 'Wholesaling', en: 'Wholesaling' },
  creativo: { es: 'Financiamiento creativo', en: 'Creative finance' },
  financiamiento: { es: 'Financiamiento', en: 'Financing' },
  legal: { es: 'Legal', en: 'Legal' },
  marketing: { es: 'Marketing', en: 'Marketing' },
  analisis: { es: 'Análisis de negocios', en: 'Deal analysis' },
};

export const DICTIONARY: DictionaryTerm[] = [
  {
    id: 'wholesaling',
    category: 'wholesaling',
    es: {
      term: 'Wholesaling (mayoreo)',
      definition:
        'Estrategia de bienes raíces donde el mayorista pone una propiedad bajo contrato y luego cede ese contrato a un comprador final por una tarifa, sin tomar título.',
      example:
        'Pongo la propiedad bajo contrato en $100,000 y la cedo a un inversionista en $110,000 — gano $10,000 sin comprarla.',
    },
    en: {
      term: 'Wholesaling',
      definition:
        'Real estate strategy where the wholesaler puts a property under contract and assigns that contract to an end buyer for a fee, without taking title.',
      example:
        'I put the property under contract at $100,000 and assign it to an investor for $110,000 — I make $10,000 without owning it.',
    },
  },
  {
    id: 'assignment',
    category: 'wholesaling',
    es: {
      term: 'Cesión / Asignación de contrato',
      definition:
        'Transferencia legal del derecho del comprador a comprar una propiedad bajo un contrato existente, a un tercero (el cesionario o comprador final).',
      example:
        'Mediante un Contrato de Asignación, transfiero mis derechos al comprador final por una tarifa.',
    },
    en: {
      term: 'Assignment of contract',
      definition:
        'Legal transfer of the buyer’s right to purchase a property under an existing contract to a third party (the assignee or end buyer).',
      example:
        'Via an Assignment Agreement, I transfer my rights to the end buyer for a fee.',
    },
  },
  {
    id: 'assignment-fee',
    category: 'wholesaling',
    es: {
      term: 'Assignment Fee (tarifa de cesión)',
      definition:
        'Cantidad pagada por el comprador final al mayorista por ceder el contrato. Es la ganancia del mayorista.',
      example:
        'Mi assignment fee fue de $15,000 — desglosada en $1,000 inicial y $14,000 al cierre.',
    },
    en: {
      term: 'Assignment fee',
      definition:
        'Amount paid by the end buyer to the wholesaler for assigning the contract. It is the wholesaler’s profit.',
      example:
        'My assignment fee was $15,000 — split as $1,000 up front and $14,000 at closing.',
    },
  },
  {
    id: 'double-close',
    category: 'wholesaling',
    es: {
      term: 'Doble cierre (Double close)',
      definition:
        'Estructura donde el mayorista compra realmente la propiedad y luego la revende inmediatamente al comprador final en dos cierres separados, usando fondos transaccionales.',
      example:
        'Hicimos un doble cierre para ocultar el assignment fee — el vendedor no vio nuestro margen.',
    },
    en: {
      term: 'Double close',
      definition:
        'Structure where the wholesaler actually buys the property and immediately resells it to the end buyer in two separate closings, using transactional funding.',
      example:
        'We did a double close to keep the assignment fee private — the seller didn’t see our margin.',
    },
  },
  {
    id: 'end-buyer',
    category: 'wholesaling',
    es: {
      term: 'Comprador final (End buyer)',
      definition:
        'El inversionista que finalmente compra la propiedad del mayorista. Normalmente paga en efectivo y reforma o renta.',
      example:
        'Mi lista de compradores finales recibe cada negocio antes de salir al público.',
    },
    en: {
      term: 'End buyer',
      definition:
        'The investor who ultimately purchases the property from the wholesaler. Typically pays cash and rehabs or rents.',
      example:
        'My end buyer list receives every deal before it goes public.',
    },
  },
  {
    id: 'jv',
    category: 'wholesaling',
    es: {
      term: 'Joint Venture (JV)',
      definition:
        'Acuerdo entre dos mayoristas o inversionistas para colaborar en un negocio y dividir la ganancia.',
      example:
        'Hice un JV 50/50 con otro mayorista — él trajo el negocio, yo traje el comprador.',
    },
    en: {
      term: 'Joint Venture (JV)',
      definition:
        'Agreement between two wholesalers or investors to collaborate on a deal and split the profit.',
      example:
        'I JV’d 50/50 with another wholesaler — he brought the deal, I brought the buyer.',
    },
  },
  {
    id: 'arv',
    category: 'analisis',
    es: {
      term: 'ARV (After Repair Value)',
      definition:
        'Valor de mercado estimado de la propiedad después de completar todas las reparaciones planeadas.',
      example:
        'El ARV es $260,000 basado en comparables vendidos en los últimos 90 días.',
    },
    en: {
      term: 'ARV (After Repair Value)',
      definition:
        'Estimated market value of the property after all planned repairs are completed.',
      example: 'ARV is $260,000 based on comps sold in the last 90 days.',
    },
  },
  {
    id: 'mao',
    category: 'analisis',
    es: {
      term: 'MAO (Máxima Oferta Permitida)',
      definition:
        'La oferta máxima que un inversionista puede hacer y aun mantener un margen objetivo. Fórmula clásica: ARV × 70% − rehab.',
      example: 'MAO = ($260,000 × 0.70) − $35,000 = $147,000.',
    },
    en: {
      term: 'MAO (Maximum Allowable Offer)',
      definition:
        'The highest offer an investor can make and still keep target margin. Classic formula: ARV × 70% − rehab.',
      example: 'MAO = ($260,000 × 0.70) − $35,000 = $147,000.',
    },
  },
  {
    id: 'regla-70',
    category: 'analisis',
    es: {
      term: 'Regla del 70%',
      definition:
        'Heurística: el inversionista no paga más del 70% del ARV menos el costo de reparación. Ajustable según mercado.',
      example:
        'En mercados calientes ajustamos a 75% — en mercados lentos bajamos a 65%.',
    },
    en: {
      term: '70% rule',
      definition:
        'Heuristic: the investor pays no more than 70% of ARV minus repair cost. Adjustable per market.',
      example: 'In hot markets we go to 75% — in slow markets down to 65%.',
    },
  },
  {
    id: 'fix-flip',
    category: 'analisis',
    es: {
      term: 'Fix & Flip',
      definition:
        'Comprar una propiedad, repararla y revenderla en el corto plazo para ganancia.',
      example:
        'Mi último fix & flip generó $42,000 en 4 meses tras una rehab de $35K.',
    },
    en: {
      term: 'Fix & Flip',
      definition:
        'Buying a property, rehabbing it, and reselling short-term for profit.',
      example:
        'My last fix & flip netted $42,000 in 4 months after a $35K rehab.',
    },
  },
  {
    id: 'brrrr',
    category: 'analisis',
    es: {
      term: 'BRRRR',
      definition:
        'Buy, Rehab, Rent, Refinance, Repeat — estrategia para construir un portafolio de renta refinanciando para recuperar el capital invertido.',
      example: 'Hice BRRRR y saqué el 100% del capital al refinanciar.',
    },
    en: {
      term: 'BRRRR',
      definition:
        'Buy, Rehab, Rent, Refinance, Repeat — strategy to build a rental portfolio by refinancing to recover invested capital.',
      example: 'I did a BRRRR and pulled out 100% of capital at refinance.',
    },
  },
  {
    id: 'comps',
    category: 'analisis',
    es: {
      term: 'Comparables (Comps)',
      definition:
        'Propiedades vendidas recientemente similares a la propiedad sujeto, usadas para estimar valor.',
      example:
        'Saqué tres comps a media milla, vendidos en 60 días, de tamaño similar.',
    },
    en: {
      term: 'Comparables (Comps)',
      definition:
        'Recently sold properties similar to the subject, used to estimate value.',
      example:
        'I pulled three comps within half a mile, sold within 60 days, similar size.',
    },
  },
  {
    id: 'ppsf',
    category: 'analisis',
    es: {
      term: '$/pie cuadrado ($/sqft, PPSF)',
      definition:
        'Precio por pie cuadrado de un inmueble. Métrica común para comparar.',
      example: 'Los comps promedian $185/ft²; el sujeto a 1,200 ft² → $222K.',
    },
    en: {
      term: '$/sqft (PPSF)',
      definition:
        'Price per square foot of a property. Common metric for comparison.',
      example: 'Comps average $185/sqft; subject at 1,200 sqft → $222K.',
    },
  },
  {
    id: 'cap-rate',
    category: 'analisis',
    es: {
      term: 'Cap Rate',
      definition:
        'Tasa de capitalización: ingreso operativo neto anual ÷ precio de compra. Mide rendimiento sin financiamiento.',
      example: 'NOI de $14,400 sobre compra de $160K = 9% cap rate.',
    },
    en: {
      term: 'Cap Rate',
      definition:
        'Capitalization rate: annual net operating income ÷ purchase price. Measures yield unleveraged.',
      example: 'NOI of $14,400 on a $160K purchase = 9% cap rate.',
    },
  },
  {
    id: 'cash-on-cash',
    category: 'analisis',
    es: {
      term: 'Cash-on-Cash Return',
      definition:
        'Flujo de caja anual antes de impuestos ÷ efectivo invertido. Mide rendimiento del capital propio.',
      example: 'Flujo de $6,000 sobre $40K de capital = 15% cash-on-cash.',
    },
    en: {
      term: 'Cash-on-Cash Return',
      definition:
        'Annual pre-tax cash flow ÷ cash invested. Measures return on equity put in.',
      example: 'Cash flow of $6,000 on $40K equity = 15% cash-on-cash.',
    },
  },
  {
    id: 'noi',
    category: 'analisis',
    es: {
      term: 'NOI (Ingreso Operativo Neto)',
      definition:
        'Ingreso bruto menos vacancia y gastos operativos. Excluye servicio de deuda.',
      example: 'Renta $1,400/mes × 12 − $2,400 gastos = $14,400 NOI.',
    },
    en: {
      term: 'NOI (Net Operating Income)',
      definition:
        'Gross income minus vacancy and operating expenses. Excludes debt service.',
      example: 'Rent $1,400/mo × 12 − $2,400 expenses = $14,400 NOI.',
    },
  },
  {
    id: 'dscr',
    category: 'financiamiento',
    es: {
      term: 'DSCR (Cobertura del Servicio de Deuda)',
      definition:
        'NOI ÷ pago anual de deuda. Prestamistas DSCR usan esta razón para calificar inversionistas sin verificar ingresos.',
      example: 'NOI $14,400 / pago anual $11,000 = DSCR 1.31.',
    },
    en: {
      term: 'DSCR (Debt Service Coverage Ratio)',
      definition:
        'NOI ÷ annual debt payment. DSCR lenders use this to qualify investors without income docs.',
      example: 'NOI $14,400 / annual P&I $11,000 = DSCR 1.31.',
    },
  },
  {
    id: 'hard-money',
    category: 'financiamiento',
    es: {
      term: 'Préstamo de dinero duro (Hard Money)',
      definition:
        'Préstamo a corto plazo basado en el valor de la propiedad y experiencia del inversionista, con tasas altas y plazos cortos.',
      example: 'Cerré con hard money al 11% por 12 meses, 2 puntos al inicio.',
    },
    en: {
      term: 'Hard money loan',
      definition:
        'Short-term loan based on property value and investor experience, with high rates and short terms.',
      example: 'Closed with hard money at 11% for 12 months, 2 points upfront.',
    },
  },
  {
    id: 'private-money',
    category: 'financiamiento',
    es: {
      term: 'Dinero privado (Private Money)',
      definition:
        'Préstamo de un individuo (no banco) para financiar una inversión, generalmente con términos más flexibles que hard money.',
      example: 'Mi prestamista privado me dio 8% solo intereses por 18 meses.',
    },
    en: {
      term: 'Private money',
      definition:
        'Loan from an individual (not a bank) to finance an investment, generally with more flexible terms than hard money.',
      example: 'My private lender gave me 8% interest-only for 18 months.',
    },
  },
  {
    id: 'transactional',
    category: 'financiamiento',
    es: {
      term: 'Financiamiento transaccional',
      definition:
        'Préstamo muy corto (horas o días) usado en doble cierres para que el mayorista pueda comprar y revender en el mismo día.',
      example:
        'Usé $150K de transactional funding por 4 horas — costo $2,000.',
    },
    en: {
      term: 'Transactional funding',
      definition:
        'Very short-term loan (hours or days) used in double closings so the wholesaler can buy and resell on the same day.',
      example: 'I used $150K of transactional funding for 4 hours — cost $2,000.',
    },
  },
  {
    id: 'gap-funding',
    category: 'financiamiento',
    es: {
      term: 'Gap Funding',
      definition:
        'Financiamiento que cubre la diferencia entre el préstamo principal y el capital necesario para cerrar el negocio.',
      example: 'Mi gap funder me prestó $25K al 15% por el efectivo restante.',
    },
    en: {
      term: 'Gap funding',
      definition:
        'Financing that covers the gap between the primary loan and the cash needed to close the deal.',
      example: 'My gap funder lent me $25K at 15% for the remaining cash.',
    },
  },
  {
    id: 'subject-to',
    category: 'creativo',
    es: {
      term: 'Subject-To (Asumir hipoteca existente)',
      definition:
        'Compra donde el comprador toma título pero la hipoteca existente del vendedor permanece a nombre del vendedor; el comprador paga la hipoteca.',
      example:
        'Compré sub-to: la hipoteca del 3.5% se quedó a nombre del vendedor pero yo hago los pagos.',
    },
    en: {
      term: 'Subject-To',
      definition:
        'Purchase where the buyer takes title but the seller’s existing mortgage stays in the seller’s name; the buyer makes the payments.',
      example:
        'I bought sub-to: the 3.5% mortgage stayed in the seller’s name but I make the payments.',
    },
  },
  {
    id: 'seller-finance',
    category: 'creativo',
    es: {
      term: 'Financiamiento del vendedor (Seller Financing)',
      definition:
        'El vendedor actúa como banco — financia la compra al comprador con un pagaré garantizado por la propiedad.',
      example:
        'Enganche $20K, 6% por 10 años, balloon al 5to año. El vendedor recibe pagos mensuales.',
    },
    en: {
      term: 'Seller financing',
      definition:
        'The seller acts as the bank — finances the purchase to the buyer with a note secured by the property.',
      example:
        'Down $20K, 6% over 10 years, 5-year balloon. Seller receives monthly payments.',
    },
  },
  {
    id: 'wraparound',
    category: 'creativo',
    es: {
      term: 'Wraparound Mortgage',
      definition:
        'Hipoteca que "envuelve" la hipoteca existente del vendedor. El comprador paga al vendedor, y el vendedor sigue pagando su hipoteca original.',
      example:
        'Wrap del 7% — el vendedor sigue pagando su préstamo al 3.5% y se queda con el spread.',
    },
    en: {
      term: 'Wraparound mortgage',
      definition:
        'Mortgage that "wraps" around the seller’s existing mortgage. Buyer pays the seller, seller continues paying their original mortgage.',
      example:
        '7% wrap — seller keeps paying their 3.5% loan and pockets the spread.',
    },
  },
  {
    id: 'novation',
    category: 'creativo',
    es: {
      term: 'Novación (Novation)',
      definition:
        'Sustitución de un contrato existente por uno nuevo, normalmente para cambiar partes o términos con consentimiento total.',
      example:
        'Usamos novación para vender por encima del contrato original con el visto bueno del vendedor.',
    },
    en: {
      term: 'Novation',
      definition:
        'Replacement of an existing contract with a new one, usually to change parties or terms with full consent.',
      example:
        'We used novation to sell above the original contract with the seller’s blessing.',
    },
  },
  {
    id: 'option',
    category: 'creativo',
    es: {
      term: 'Contrato de Opción',
      definition:
        'Acuerdo que le da al comprador el derecho (no la obligación) de comprar una propiedad a un precio fijo dentro de un plazo.',
      example:
        'Pagué $1,000 por una opción de 6 meses a $180K — durante ese tiempo busqué comprador.',
    },
    en: {
      term: 'Option contract',
      definition:
        'Agreement giving the buyer the right (not obligation) to purchase a property at a fixed price within a timeframe.',
      example:
        'I paid $1,000 for a 6-month option at $180K — during that window I sourced a buyer.',
    },
  },
  {
    id: 'lease-option',
    category: 'creativo',
    es: {
      term: 'Lease Option (renta con opción a compra)',
      definition:
        'Combina arrendamiento con opción de compra. El inquilino renta y tiene derecho a comprar a precio fijo más tarde.',
      example: 'Renta $1,400/mes, opción a compra a $200K en 24 meses.',
    },
    en: {
      term: 'Lease option',
      definition:
        'Combines a lease with a purchase option. Tenant rents and has the right to buy at a fixed price later.',
      example: 'Rent $1,400/mo, option to buy at $200K in 24 months.',
    },
  },
  {
    id: 'balloon',
    category: 'creativo',
    es: {
      term: 'Pago Balloon (Globo)',
      definition:
        'Pago grande de saldo restante al final de un plazo de préstamo, en lugar de amortizar completamente.',
      example:
        'Pagos amortizados a 30 años pero balloon al año 5 — el saldo es debido entonces.',
    },
    en: {
      term: 'Balloon payment',
      definition:
        'Large remaining balance payment at the end of a loan term, instead of fully amortizing.',
      example:
        '30-year amortized payments but balloon at year 5 — balance is due then.',
    },
  },
  {
    id: 'land-trust',
    category: 'creativo',
    es: {
      term: 'Land Trust (fideicomiso de tierras)',
      definition:
        'Estructura legal donde un fiduciario sostiene el título de la propiedad para beneficio del beneficiario. Útil para privacidad y subject-to.',
      example:
        'Pusimos la propiedad en un land trust para sub-to — preserva la cláusula due-on-sale.',
    },
    en: {
      term: 'Land trust',
      definition:
        'Legal structure where a trustee holds title to property for the benefit of a beneficiary. Useful for privacy and sub-to.',
      example:
        'We placed the property in a land trust for sub-to — preserves the due-on-sale clause.',
    },
  },
  {
    id: 'due-on-sale',
    category: 'creativo',
    es: {
      term: 'Cláusula Due-on-Sale',
      definition:
        'Cláusula hipotecaria que permite al prestamista exigir el saldo total al transferir la propiedad. Riesgo principal en sub-to.',
      example:
        'Existe riesgo de due-on-sale, pero los bancos rara vez la ejercen si los pagos están al día.',
    },
    en: {
      term: 'Due-on-sale clause',
      definition:
        'Mortgage clause allowing the lender to demand the full balance when the property is transferred. Main risk in sub-to.',
      example:
        'Due-on-sale risk exists but banks rarely call it if payments are current.',
    },
  },
  {
    id: 'emd',
    category: 'legal',
    es: {
      term: 'EMD (Depósito en Garantía / Earnest Money Deposit)',
      definition:
        'Depósito que muestra buena fe del comprador. Generalmente se libera al vendedor al cierre o si el comprador incumple post-inspección.',
      example: 'EMD de $1,000 retenido por la titulera hasta el cierre.',
    },
    en: {
      term: 'EMD (Earnest Money Deposit)',
      definition:
        'Deposit showing buyer’s good faith. Typically released to seller at closing or if buyer defaults post-inspection.',
      example: 'EMD of $1,000 held by title company until closing.',
    },
  },
  {
    id: 'title-company',
    category: 'legal',
    es: {
      term: 'Compañía de título (Title Company)',
      definition:
        'Entidad neutral que maneja el cierre, asegura el título, retiene depósitos y desembolsa fondos.',
      example: 'La titulera revisa el título y emite la póliza al cierre.',
    },
    en: {
      term: 'Title company',
      definition:
        'Neutral entity that handles closing, insures title, holds deposits, and disburses funds.',
      example: 'The title company reviews title and issues the policy at closing.',
    },
  },
  {
    id: 'escrow',
    category: 'legal',
    es: {
      term: 'Escrow',
      definition:
        'Cuenta o proceso neutral donde se retienen fondos o documentos hasta que se cumplan las condiciones del contrato.',
      example: 'Los $1,000 de EMD están en escrow hasta el cierre.',
    },
    en: {
      term: 'Escrow',
      definition:
        'Neutral account or process where funds or documents are held until contract conditions are met.',
      example: 'The $1,000 EMD sits in escrow until closing.',
    },
  },
  {
    id: 'inspeccion',
    category: 'legal',
    es: {
      term: 'Período de Inspección',
      definition:
        'Plazo durante el cual el comprador puede inspeccionar la propiedad y cancelar sin penalidad.',
      example:
        '10 días de inspección — si encuentras algo grave, cancelas y recuperas el EMD.',
    },
    en: {
      term: 'Inspection period',
      definition:
        'Window during which the buyer can inspect the property and cancel without penalty.',
      example:
        '10-day inspection — if you find something serious, cancel and recover the EMD.',
    },
  },
  {
    id: 'as-is',
    category: 'legal',
    es: {
      term: 'As Is (tal como está)',
      definition:
        'Cláusula que indica que la propiedad se vende en su condición actual; el vendedor no hará reparaciones.',
      example:
        'Comprada as-is — sin garantías de techo, plomería ni HVAC.',
    },
    en: {
      term: 'As Is',
      definition:
        'Clause stating the property is sold in its current condition; seller will make no repairs.',
      example: 'Bought as-is — no warranties on roof, plumbing, or HVAC.',
    },
  },
  {
    id: 'addendum',
    category: 'legal',
    es: {
      term: 'Addendum',
      definition:
        'Documento añadido al contrato principal que modifica o complementa términos sin reemplazar el contrato.',
      example: 'Firmamos un addendum extendiendo el cierre 15 días.',
    },
    en: {
      term: 'Addendum',
      definition:
        'Document added to the main contract that modifies or supplements terms without replacing the contract.',
      example: 'We signed an addendum extending closing by 15 days.',
    },
  },
  {
    id: 'mls',
    category: 'analisis',
    es: {
      term: 'MLS (Multiple Listing Service)',
      definition:
        'Base de datos profesional de propiedades en venta. Acceso típicamente vía agente con licencia.',
      example:
        'Los comps de MLS son los más confiables — datos verificados de cierre.',
    },
    en: {
      term: 'MLS (Multiple Listing Service)',
      definition:
        'Professional database of properties for sale. Access typically through a licensed agent.',
      example:
        'MLS comps are most reliable — verified closing data.',
    },
  },
  {
    id: 'rvm',
    category: 'marketing',
    es: {
      term: 'RVM (Ringless Voicemail)',
      definition:
        'Mensaje de voz dejado directamente en el buzón del prospecto sin que el teléfono suene.',
      example:
        'Enviamos 5,000 RVMs y conseguimos 12 leads calificados.',
    },
    en: {
      term: 'RVM (Ringless Voicemail)',
      definition:
        'Voice message left directly in a prospect’s voicemail without their phone ringing.',
      example: 'We blasted 5,000 RVMs and got 12 qualified leads.',
    },
  },
  {
    id: 'cold-call',
    category: 'marketing',
    es: {
      term: 'Cold Call (llamada en frío)',
      definition:
        'Llamada telefónica a un prospecto que no ha solicitado contacto. Canal clave de prospección.',
      example:
        'Hago 100 cold calls al día — convierten al 1-2% en citas.',
    },
    en: {
      term: 'Cold call',
      definition:
        'Phone call to a prospect who has not requested contact. Key prospecting channel.',
      example:
        'I make 100 cold calls a day — they convert at 1-2% to appointments.',
    },
  },
  {
    id: 'direct-mail',
    category: 'marketing',
    es: {
      term: 'Direct Mail (correo directo)',
      definition:
        'Cartas o postales enviadas a propietarios con propuesta de compra.',
      example:
        'Mando 5,000 cartas/mes a probate y absentee owners.',
    },
    en: {
      term: 'Direct mail',
      definition: 'Letters or postcards sent to owners with a buy offer.',
      example: 'I mail 5,000 pieces/month to probate and absentee owners.',
    },
  },
  {
    id: 'skip-trace',
    category: 'marketing',
    es: {
      term: 'Skip Trace',
      definition:
        'Proceso de investigación para encontrar información de contacto del dueño de una propiedad (teléfono, email).',
      example:
        'Skip tracé una lista de 500 absentee — saqué 380 teléfonos.',
    },
    en: {
      term: 'Skip trace',
      definition:
        'Research process to find a property owner’s contact info (phone, email).',
      example: 'I skip traced a 500-owner absentee list — got 380 phone numbers.',
    },
  },
  {
    id: 'absentee',
    category: 'marketing',
    es: {
      term: 'Absentee Owner (dueño ausente)',
      definition:
        'Propietario que no vive en la propiedad. Lista de marketing muy buscada.',
      example:
        'Los absentee owners suelen ser inversionistas cansados — buenos motivados.',
    },
    en: {
      term: 'Absentee owner',
      definition:
        'Owner who does not live in the property. Highly sought-after marketing list.',
      example:
        'Absentee owners are often tired investors — good motivated leads.',
    },
  },
  {
    id: 'probate',
    category: 'marketing',
    es: {
      term: 'Probate (sucesión)',
      definition:
        'Proceso legal para distribuir bienes de una persona fallecida. Lista común de prospección.',
      example:
        'Los probate leads suelen tener motivación alta — heredan una casa que no quieren.',
    },
    en: {
      term: 'Probate',
      definition:
        'Legal process to distribute a deceased person’s assets. Common prospecting list.',
      example:
        'Probate leads tend to be highly motivated — they inherit a house they don’t want.',
    },
  },
  {
    id: 'pre-foreclosure',
    category: 'marketing',
    es: {
      term: 'Pre-ejecución hipotecaria (Pre-foreclosure)',
      definition:
        'Etapa después del aviso de incumplimiento pero antes de la subasta. Dueños motivados.',
      example:
        'Los leads pre-foreclosure necesitan vender rápido — antes que el banco se la lleve.',
    },
    en: {
      term: 'Pre-foreclosure',
      definition:
        'Stage after notice of default but before auction. Highly motivated owners.',
      example:
        'Pre-foreclosure leads need to sell fast — before the bank takes it.',
    },
  },
  {
    id: 'tired-landlord',
    category: 'marketing',
    es: {
      term: 'Tired Landlord (Casero cansado)',
      definition:
        'Propietario de renta que ya no quiere lidiar con la propiedad — motivado a vender.',
      example: 'Los tired landlords cierran rápido si el número les funciona.',
    },
    en: {
      term: 'Tired landlord',
      definition:
        'Rental owner who no longer wants to deal with the property — motivated to sell.',
      example: 'Tired landlords close fast if the number works for them.',
    },
  },
  {
    id: 'vacant',
    category: 'marketing',
    es: {
      term: 'Propiedad vacante (Vacant property)',
      definition:
        'Casa desocupada. Indicador fuerte de motivación — sin renta y costos continuos.',
      example: 'Las vacantes son leads top — costo continuo sin ingreso.',
    },
    en: {
      term: 'Vacant property',
      definition:
        'Unoccupied house. Strong motivation signal — no rent and ongoing costs.',
      example: 'Vacants are top-tier leads — ongoing cost with no income.',
    },
  },
  {
    id: 'list-pull',
    category: 'marketing',
    es: {
      term: 'List Pull (extracción de lista)',
      definition:
        'Generar una lista de prospectos filtrada por criterios (vacancia, equity, fechas, etc.).',
      example: 'Saqué una lista de absentee + high equity + 1980 o antes.',
    },
    en: {
      term: 'List pull',
      definition:
        'Generating a prospect list filtered by criteria (vacancy, equity, dates, etc.).',
      example: 'Pulled a list of absentee + high equity + 1980 or older.',
    },
  },
  {
    id: 'high-equity',
    category: 'marketing',
    es: {
      term: 'Alto Equity (High Equity)',
      definition:
        'Propietario con poca o ninguna hipoteca — más flexibilidad para negociar.',
      example: 'Los high-equity son los favoritos — pueden vender por debajo.',
    },
    en: {
      term: 'High equity',
      definition:
        'Owner with little or no mortgage — more flexibility to negotiate.',
      example: 'High-equity is the favorite list — they can sell below market.',
    },
  },
  {
    id: 'driving-for-dollars',
    category: 'marketing',
    es: {
      term: 'Driving for Dollars',
      definition:
        'Manejar por vecindarios buscando propiedades distressed visibles para añadir a la lista de marketing.',
      example:
        'Manejé 4 horas el sábado — saqué 27 propiedades distressed nuevas.',
    },
    en: {
      term: 'Driving for Dollars',
      definition:
        'Driving neighborhoods looking for visible distressed properties to add to marketing list.',
      example: 'Drove 4 hours Saturday — added 27 fresh distressed properties.',
    },
  },
  {
    id: 'distressed',
    category: 'marketing',
    es: {
      term: 'Propiedad distressed',
      definition:
        'Propiedad en mal estado físico o con dueño en situación difícil — candidata a oferta de mayoreo.',
      example:
        'Distressed exterior + alto equity + dueño absentee = lead ideal.',
    },
    en: {
      term: 'Distressed property',
      definition:
        'Property in poor physical condition or with owner in difficult situation — wholesale candidate.',
      example: 'Distressed exterior + high equity + absentee = ideal lead.',
    },
  },
  {
    id: 'po-financing',
    category: 'financiamiento',
    es: {
      term: 'Refinanciamiento Cash-Out',
      definition:
        'Refinanciar una propiedad por más del saldo actual, sacando la diferencia en efectivo.',
      example: 'Cash-out al 75% LTV — saqué $40K para el siguiente negocio.',
    },
    en: {
      term: 'Cash-out refinance',
      definition:
        'Refinancing a property for more than the current balance, taking the difference in cash.',
      example: 'Cash-out at 75% LTV — pulled $40K for the next deal.',
    },
  },
  {
    id: 'ltv',
    category: 'financiamiento',
    es: {
      term: 'LTV (Loan-to-Value)',
      definition:
        'Razón entre el préstamo y el valor de la propiedad. Métrica clave para prestamistas.',
      example: 'LTV 75% — préstamo $150K sobre valor $200K.',
    },
    en: {
      term: 'LTV (Loan-to-Value)',
      definition:
        'Ratio of loan to property value. Key metric for lenders.',
      example: 'LTV 75% — $150K loan on $200K value.',
    },
  },
  {
    id: 'arvl-ltv',
    category: 'financiamiento',
    es: {
      term: 'ARV LTV',
      definition:
        'Razón préstamo / ARV — prestamistas de hard money típicamente prestan 65-75% del ARV.',
      example: 'ARV LTV 70% en un ARV de $260K = préstamo máximo $182K.',
    },
    en: {
      term: 'ARV LTV',
      definition:
        'Loan / ARV ratio — hard money lenders typically lend 65-75% of ARV.',
      example: 'ARV LTV 70% on $260K ARV = max $182K loan.',
    },
  },
  {
    id: 'points',
    category: 'financiamiento',
    es: {
      term: 'Puntos (Points)',
      definition:
        '1 punto = 1% del préstamo. Costo de originación pagado al prestamista al cierre.',
      example: '2 puntos sobre $150K = $3,000 al cierre.',
    },
    en: {
      term: 'Points',
      definition:
        '1 point = 1% of the loan. Origination cost paid to the lender at closing.',
      example: '2 points on $150K = $3,000 at closing.',
    },
  },
  {
    id: 'pof',
    category: 'wholesaling',
    es: {
      term: 'POF (Proof of Funds)',
      definition:
        'Documento que prueba que el comprador tiene los fondos para cerrar — requerido por vendedores y agentes.',
      example: 'Mostré POF de $200K para que aceptaran la oferta.',
    },
    en: {
      term: 'POF (Proof of Funds)',
      definition:
        'Document proving the buyer has funds to close — required by sellers and agents.',
      example: 'Showed $200K POF so they’d accept the offer.',
    },
  },
  {
    id: 'lop',
    category: 'wholesaling',
    es: {
      term: 'LOI (Carta de Intención)',
      definition:
        'Carta informal del comprador con términos preliminares de oferta antes de firmar contrato.',
      example: 'Mandé LOI a $145K, contraoferta a $155K, cerramos en $150K.',
    },
    en: {
      term: 'LOI (Letter of Intent)',
      definition:
        'Informal letter from buyer with preliminary offer terms before signing a contract.',
      example: 'Sent LOI at $145K, counter at $155K, closed at $150K.',
    },
  },
  {
    id: 'section-8',
    category: 'analisis',
    es: {
      term: 'Sección 8',
      definition:
        'Programa de vivienda HUD que subsidia el alquiler a inquilinos de bajos ingresos — paga directamente al casero.',
      example:
        'Sección 8 paga $1,250/mes — depósito directo confiable cada mes.',
    },
    en: {
      term: 'Section 8',
      definition:
        'HUD housing program subsidizing rent for low-income tenants — pays the landlord directly.',
      example:
        'Section 8 pays $1,250/mo — reliable direct deposit every month.',
    },
  },
  {
    id: 'fmr',
    category: 'analisis',
    es: {
      term: 'FMR (Fair Market Rent)',
      definition:
        'Renta de mercado justa publicada por HUD por código postal — base de pago para Sección 8.',
      example: 'FMR para 3 recámaras en mi zip = $1,425.',
    },
    en: {
      term: 'FMR (Fair Market Rent)',
      definition:
        'Fair Market Rent published by HUD by zip code — Section 8 payment basis.',
      example: 'FMR for 3-bedroom in my zip = $1,425.',
    },
  },
  {
    id: 'closing-costs',
    category: 'legal',
    es: {
      term: 'Costos de Cierre',
      definition:
        'Honorarios y gastos pagados al cierre (titulera, escrow, impuestos, seguros, etc.). Típicamente 2-5% del precio.',
      example:
        'En este contrato ambos comparten costos de cierre 50/50.',
    },
    en: {
      term: 'Closing costs',
      definition:
        'Fees and expenses paid at closing (title, escrow, taxes, insurance, etc.). Typically 2-5% of price.',
      example: 'In this contract both parties split closing costs 50/50.',
    },
  },
  {
    id: 'termination',
    category: 'legal',
    es: {
      term: 'Acuerdo de Terminación',
      definition:
        'Documento firmado por ambas partes para cancelar formalmente un contrato existente.',
      example:
        'Firmamos terminación mutua — el EMD regresó al comprador.',
    },
    en: {
      term: 'Termination agreement',
      definition:
        'Document signed by both parties to formally cancel an existing contract.',
      example: 'We signed mutual termination — EMD went back to the buyer.',
    },
  },
];
