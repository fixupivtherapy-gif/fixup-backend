import type { ContractTemplate } from './types';

export const CASH_CONTRACT_ES: ContractTemplate = {
  id: 'cash',
  locale: 'es',
  title: 'CONTRATO DE PROMESA DE COMPRAVENTA',
  sections: [
    {
      number: 'I',
      title: 'PARTES',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Este Contrato (“Acuerdo”) de Promesa de Compraventa se celebra hoy [DIA] de [MES] del [AÑO], entre las siguientes partes:',
        },
        {
          kind: 'list',
          items: [
            'Vendedor: [NOMBRE_DEL_VENDEDOR]',
            'Comprador: [NOMBRE_DEL_COMPRADOR]',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Comprar en los términos y condiciones que se especifican a continuación la propiedad descrita como:',
        },
        {
          kind: 'paragraph',
          text: 'Dirección: [DIRECCION_DE_LA_PROPIEDAD]',
        },
        { kind: 'paragraph', text: 'Ambas partes reconocen que:' },
        {
          kind: 'list',
          items: [
            'actúan de manera voluntaria',
            'tienen capacidad legal para obligarse',
            'entienden la naturaleza de este Acuerdo',
          ],
        },
      ],
    },
    {
      number: 'II',
      title: 'PROPIEDAD',
      blocks: [
        {
          kind: 'paragraph',
          text: 'La propiedad objeto de este Acuerdo es:',
        },
        {
          kind: 'paragraph',
          text: 'Dirección: [DIRECCION_DE_LA_PROPIEDAD]',
        },
      ],
    },
    {
      number: 'III',
      title: 'PRECIO DE COMPRA',
      blocks: [
        {
          kind: 'paragraph',
          text: 'El precio acordado para la compraventa será: $[PRECIO_DE_COMPRA] USD.',
        },
        {
          kind: 'paragraph',
          text: 'Este precio representa el acuerdo total entre las partes, sujeto a los términos establecidos en este documento.',
        },
      ],
    },
    {
      number: 'IV',
      title: 'DEPÓSITO (EMD)',
      blocks: [
        {
          kind: 'paragraph',
          text: 'El depósito será de: $[MONTO_EMD] USD.',
        },
        { kind: 'paragraph', text: 'Condiciones:' },
        {
          kind: 'list',
          items: [
            'Será pagado el día de la inspección o dentro de 24 horas posteriores.',
            'Será no reembolsable una vez finalizado el periodo de inspección.',
            'Será retenido por la parte designada para el cierre.',
          ],
        },
      ],
    },
    {
      number: 'V',
      title: 'PERIODO DE INSPECCIÓN',
      blocks: [
        {
          kind: 'paragraph',
          text: 'El Comprador tendrá [DIAS_INSPECCION] días para:',
        },
        {
          kind: 'list',
          items: [
            'inspeccionar la propiedad',
            'evaluar condiciones',
            'validar el negocio',
          ],
        },
        { kind: 'paragraph', text: 'Durante este periodo:' },
        {
          kind: 'list',
          items: [
            'el Comprador podrá cancelar sin penalidad',
            'no estará obligado a continuar',
          ],
        },
        { kind: 'paragraph', text: 'Una vez finalizado:' },
        {
          kind: 'list',
          items: ['el Comprador acepta continuar bajo las condiciones existentes'],
        },
      ],
    },
    {
      number: 'VI',
      title: 'CONDICIÓN DE LA PROPIEDAD',
      blocks: [
        {
          kind: 'paragraph',
          text: 'La propiedad será aceptada en condición: “As Is” (tal como está).',
        },
        { kind: 'paragraph', text: 'El Vendedor declara que:' },
        {
          kind: 'list',
          items: [
            'no oculta información material conocida',
            'permite inspección previa al cierre',
          ],
        },
      ],
    },
    {
      number: 'VII',
      title: 'ACCESO A LA PROPIEDAD',
      blocks: [
        { kind: 'paragraph', text: 'El Comprador tendrá acceso razonable para:' },
        {
          kind: 'list',
          items: ['inspecciones', 'evaluaciones', 'visitas necesarias'],
        },
        {
          kind: 'paragraph',
          text: 'Todo acceso será coordinado previamente con el Vendedor.',
        },
      ],
    },
    {
      number: 'VIII',
      title: 'DERECHO DE CESIÓN',
      blocks: [
        { kind: 'paragraph', text: 'El Comprador tendrá el derecho de:' },
        { kind: 'list', items: ['ceder', 'transferir', 'asignar'] },
        {
          kind: 'paragraph',
          text: 'su posición contractual sin necesidad de aprobación adicional del Vendedor.',
        },
        { kind: 'paragraph', text: 'El Vendedor reconoce y acepta que:' },
        {
          kind: 'list',
          items: [
            'la parte que ejecutará el cierre puede ser distinta al Comprador original',
          ],
        },
      ],
    },
    {
      number: 'IX',
      title: 'CIERRE',
      blocks: [
        {
          kind: 'paragraph',
          text: 'La fecha estimada de cierre será: [FECHA_CIERRE].',
        },
        {
          kind: 'paragraph',
          text: 'El cierre podrá extenderse mediante acuerdo entre las partes si fuese necesario.',
        },
      ],
    },
    {
      number: 'X',
      title: 'COSTOS DE CIERRE',
      blocks: [
        { kind: 'paragraph', text: 'Los costos serán asumidos por:' },
        {
          kind: 'list',
          items: ['[ ] Comprador', '[ ] Vendedor', '[ ] Ambos'],
        },
      ],
    },
    {
      number: 'XI',
      title: 'INCUMPLIMIENTO',
      blocks: [
        { kind: 'paragraph', text: 'Si el Comprador incumple:' },
        { kind: 'list', items: ['perderá el depósito según lo establecido'] },
        { kind: 'paragraph', text: 'Si el Vendedor incumple:' },
        {
          kind: 'list',
          items: [
            'deberá devolver cualquier cantidad recibida',
            'podrá estar sujeto a acciones adicionales',
          ],
        },
      ],
    },
    {
      number: 'XII',
      title: 'RESOLUCIÓN DE DISPUTAS',
      blocks: [
        { kind: 'paragraph', text: 'Las partes acuerdan:' },
        {
          kind: 'list',
          items: [
            'Intentar mediación.',
            'De no resolverse, arbitraje en Puerto Rico.',
          ],
        },
      ],
    },
    {
      number: 'XIII',
      title: 'MODIFICACIONES',
      blocks: [
        { kind: 'paragraph', text: 'Cualquier cambio deberá:' },
        {
          kind: 'list',
          items: ['ser por escrito', 'firmado por ambas partes'],
        },
      ],
    },
    {
      number: 'XIV',
      title: 'NATURALEZA DEL DOCUMENTO',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Este documento establece un acuerdo vinculante entre las partes.',
        },
        { kind: 'paragraph', text: 'Cada parte reconoce que:' },
        {
          kind: 'list',
          items: [
            'ha leído el contenido',
            'entiende los términos',
            'actúa bajo su propio criterio',
          ],
        },
      ],
    },
    {
      number: 'XV',
      title: 'ACUERDO COMPLETO',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Este documento representa el acuerdo total entre las partes.',
        },
      ],
    },
    {
      number: 'XVI',
      title: 'FIRMAS',
      blocks: [
        {
          kind: 'signatures',
          roles: [
            { label: 'Vendedor', hasName: true, hasDate: true },
            { label: 'Comprador', hasName: true, hasDate: true },
            { label: 'Testigo (Opcional)', hasName: true, hasDate: true },
          ],
        },
      ],
    },
  ],
  pageFooterEs:
    'El comprador y el vendedor acusan recibo de una copia de esta página.',
};

export const CASH_CONTRACT_EN: ContractTemplate = {
  id: 'cash',
  locale: 'en',
  title: 'PURCHASE & SALE AGREEMENT',
  sections: [
    {
      number: 'I',
      title: 'PARTIES',
      blocks: [
        {
          kind: 'paragraph',
          text: 'This Purchase & Sale Agreement (“Agreement”) is entered into on this [DAY] day of [MONTH], [YEAR], by and between the following parties:',
        },
        {
          kind: 'list',
          items: [
            'Seller: [SELLER_NAME]',
            'Buyer: [BUYER_NAME]',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Buyer agrees to purchase, under the terms and conditions set forth below, the property described as:',
        },
        {
          kind: 'paragraph',
          text: 'Address: [PROPERTY_ADDRESS]',
        },
        { kind: 'paragraph', text: 'Both parties acknowledge that they:' },
        {
          kind: 'list',
          items: [
            'are acting voluntarily',
            'have legal capacity to be bound',
            'understand the nature of this Agreement',
          ],
        },
      ],
    },
    {
      number: 'II',
      title: 'PROPERTY',
      blocks: [
        { kind: 'paragraph', text: 'The property subject to this Agreement is:' },
        { kind: 'paragraph', text: 'Address: [PROPERTY_ADDRESS]' },
      ],
    },
    {
      number: 'III',
      title: 'PURCHASE PRICE',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The agreed purchase price is: $[PURCHASE_PRICE] USD.',
        },
        {
          kind: 'paragraph',
          text: 'This price represents the entire agreement between the parties, subject to the terms set forth herein.',
        },
      ],
    },
    {
      number: 'IV',
      title: 'EARNEST MONEY DEPOSIT (EMD)',
      blocks: [
        { kind: 'paragraph', text: 'The deposit shall be: $[EMD_AMOUNT] USD.' },
        { kind: 'paragraph', text: 'Conditions:' },
        {
          kind: 'list',
          items: [
            'To be paid on the day of inspection or within 24 hours thereafter.',
            'Non-refundable once the inspection period has concluded.',
            'To be held by the party designated for closing.',
          ],
        },
      ],
    },
    {
      number: 'V',
      title: 'INSPECTION PERIOD',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Buyer shall have [INSPECTION_DAYS] days to:',
        },
        {
          kind: 'list',
          items: [
            'inspect the property',
            'evaluate its condition',
            'validate the deal',
          ],
        },
        { kind: 'paragraph', text: 'During this period:' },
        {
          kind: 'list',
          items: [
            'Buyer may cancel without penalty',
            'Buyer shall not be obligated to proceed',
          ],
        },
        { kind: 'paragraph', text: 'Once concluded:' },
        {
          kind: 'list',
          items: ['Buyer agrees to proceed under the existing conditions'],
        },
      ],
    },
    {
      number: 'VI',
      title: 'CONDITION OF THE PROPERTY',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The property shall be accepted in “As Is” condition.',
        },
        { kind: 'paragraph', text: 'Seller represents that they:' },
        {
          kind: 'list',
          items: [
            'do not conceal known material information',
            'allow inspection prior to closing',
          ],
        },
      ],
    },
    {
      number: 'VII',
      title: 'ACCESS TO THE PROPERTY',
      blocks: [
        { kind: 'paragraph', text: 'Buyer shall have reasonable access for:' },
        {
          kind: 'list',
          items: ['inspections', 'evaluations', 'necessary visits'],
        },
        {
          kind: 'paragraph',
          text: 'All access shall be coordinated in advance with the Seller.',
        },
      ],
    },
    {
      number: 'VIII',
      title: 'RIGHT OF ASSIGNMENT',
      blocks: [
        { kind: 'paragraph', text: 'Buyer shall have the right to:' },
        { kind: 'list', items: ['assign', 'transfer', 'designate'] },
        {
          kind: 'paragraph',
          text: 'Buyer’s contractual position without further approval from the Seller.',
        },
        { kind: 'paragraph', text: 'Seller acknowledges and accepts that:' },
        {
          kind: 'list',
          items: [
            'the party closing the transaction may differ from the original Buyer',
          ],
        },
      ],
    },
    {
      number: 'IX',
      title: 'CLOSING',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The estimated closing date shall be: [CLOSING_DATE].',
        },
        {
          kind: 'paragraph',
          text: 'Closing may be extended by mutual agreement of the parties if necessary.',
        },
      ],
    },
    {
      number: 'X',
      title: 'CLOSING COSTS',
      blocks: [
        { kind: 'paragraph', text: 'Closing costs shall be borne by:' },
        {
          kind: 'list',
          items: ['[ ] Buyer', '[ ] Seller', '[ ] Both parties'],
        },
      ],
    },
    {
      number: 'XI',
      title: 'DEFAULT',
      blocks: [
        { kind: 'paragraph', text: 'If Buyer defaults:' },
        { kind: 'list', items: ['Buyer shall forfeit the deposit as established'] },
        { kind: 'paragraph', text: 'If Seller defaults:' },
        {
          kind: 'list',
          items: [
            'Seller shall return any amount received',
            'Seller may be subject to additional actions',
          ],
        },
      ],
    },
    {
      number: 'XII',
      title: 'DISPUTE RESOLUTION',
      blocks: [
        { kind: 'paragraph', text: 'The parties agree to:' },
        {
          kind: 'list',
          items: [
            'Attempt mediation first.',
            'If unresolved, arbitration in Puerto Rico.',
          ],
        },
      ],
    },
    {
      number: 'XIII',
      title: 'AMENDMENTS',
      blocks: [
        { kind: 'paragraph', text: 'Any change must:' },
        {
          kind: 'list',
          items: ['be in writing', 'be signed by both parties'],
        },
      ],
    },
    {
      number: 'XIV',
      title: 'NATURE OF THE DOCUMENT',
      blocks: [
        {
          kind: 'paragraph',
          text: 'This document establishes a binding agreement between the parties.',
        },
        { kind: 'paragraph', text: 'Each party acknowledges that they:' },
        {
          kind: 'list',
          items: [
            'have read the content',
            'understand the terms',
            'act upon their own judgment',
          ],
        },
      ],
    },
    {
      number: 'XV',
      title: 'ENTIRE AGREEMENT',
      blocks: [
        {
          kind: 'paragraph',
          text: 'This document represents the entire agreement between the parties.',
        },
      ],
    },
    {
      number: 'XVI',
      title: 'SIGNATURES',
      blocks: [
        {
          kind: 'signatures',
          roles: [
            { label: 'Seller', hasName: true, hasDate: true },
            { label: 'Buyer', hasName: true, hasDate: true },
            { label: 'Witness (Optional)', hasName: true, hasDate: true },
          ],
        },
      ],
    },
  ],
  pageFooterEn:
    'Buyer and Seller acknowledge receipt of a copy of this page.',
};
