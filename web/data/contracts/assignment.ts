import type { ContractTemplate } from './types';

export const ASSIGNMENT_CONTRACT_ES: ContractTemplate = {
  id: 'assignment',
  locale: 'es',
  title: 'CONTRATO DE ASIGNACIÓN',
  sections: [
    {
      number: 'I',
      title: 'PARTES DEL CONTRATO',
      blocks: [
        {
          kind: 'list',
          items: [
            'Wholesaler: [NOMBRE_DEL_WHOLESALER]',
            'Comprador Final: [NOMBRE_DEL_COMPRADOR_FINAL]',
          ],
        },
        { kind: 'paragraph', text: 'Ambas partes acuerdan lo siguiente:' },
      ],
    },
    {
      number: 'II',
      title: 'REFERENCIA AL CONTRATO ORIGINAL',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Este Contrato asigna los derechos del Contrato de Compra-Venta firmado el [DIA] de [MES] del año [AÑO] entre las siguientes partes:',
        },
        {
          kind: 'list',
          items: [
            'Nombre del Vendedor: [NOMBRE_DEL_VENDEDOR]',
            'Nombre del Wholesaler: [NOMBRE_DEL_WHOLESALER]',
            'Dirección de la Propiedad: [DIRECCION_DE_LA_PROPIEDAD]',
          ],
        },
      ],
    },
    {
      number: 'III',
      title: 'ASSIGNMENT FEE',
      blocks: [
        {
          kind: 'paragraph',
          text: 'El Comprador Final acepta pagar al Wholesaler la suma de USD $[ASSIGNMENT_FEE_TOTAL] como cuota de asignación (Assignment Fee), desglosada de la siguiente manera:',
        },
        {
          kind: 'list',
          items: [
            'Depósito Inicial del Assignment Fee: USD $[ASSIGNMENT_FEE_INICIAL], a ser pagado dentro de [DIAS_DEPOSITO_INICIAL] días tras la firma de este contrato.',
            'Pago Final del Assignment Fee: USD $[ASSIGNMENT_FEE_FINAL], a ser pagado en la fecha de cierre.',
          ],
        },
      ],
    },
    {
      number: 'IV',
      title: 'DECLARACIONES DEL COMPRADOR FINAL',
      blocks: [
        { kind: 'paragraph', text: 'El Comprador Final declara y garantiza:' },
        {
          kind: 'list',
          items: [
            'Poseer los fondos necesarios para completar la transacción.',
            'Aceptar la propiedad en su condición actual (“As Is”).',
            'Conocer y aceptar los términos del Contrato de Compra-Venta original.',
          ],
        },
      ],
    },
    {
      number: 'V',
      title: 'PROTECCIÓN PARA EL WHOLESALER',
      blocks: [
        {
          kind: 'list',
          items: [
            'El Comprador Final no podrá negociar directamente con el Vendedor sin la autorización del Wholesaler.',
            'Cualquier intento de eludir al Wholesaler resultará en la anulación del contrato y la aplicación de penalidades.',
          ],
        },
      ],
    },
    {
      number: 'VI',
      title: 'CLÁUSULA DE CONTINGENCIA',
      blocks: [
        {
          kind: 'paragraph',
          text: 'El Earnest Money no reembolsable sólo se hará efectivo tras la finalización y aceptación del período de inspección de la propiedad.',
        },
      ],
    },
    {
      number: 'VII',
      title: 'RESOLUCIÓN DE DISPUTAS',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Las disputas que surjan de este Contrato serán gestionadas inicialmente mediante mediación entre las partes. De no lograrse un acuerdo, las partes podrán recurrir al arbitraje conforme a las leyes aplicables en Puerto Rico.',
        },
      ],
    },
    {
      number: 'VIII',
      title: 'MODIFICACIONES AL CONTRATO',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cualquier modificación o enmienda a este Contrato deberá realizarse por escrito y ser firmada por ambas partes para ser válida.',
        },
      ],
    },
    {
      number: 'IX',
      title: 'CONFIRMACIÓN DE DEPÓSITO',
      blocks: [
        {
          kind: 'paragraph',
          text: 'El Comprador Final confirma la entrega del Earnest Money de USD $[MONTO_EMD] como muestra de compromiso hacia la compra de la propiedad. Este depósito es independiente del Assignment Fee.',
        },
      ],
    },
    {
      number: 'X',
      title: 'FIRMAS',
      blocks: [
        {
          kind: 'signatures',
          roles: [
            { label: 'Wholesaler', hasName: false, hasDate: true },
            { label: 'Comprador Final', hasName: false, hasDate: true },
            { label: 'Testigo 1', hasName: false, hasDate: true },
            { label: 'Testigo 2', hasName: false, hasDate: true },
          ],
        },
      ],
    },
  ],
};

export const ASSIGNMENT_CONTRACT_EN: ContractTemplate = {
  id: 'assignment',
  locale: 'en',
  title: 'ASSIGNMENT AGREEMENT',
  sections: [
    {
      number: 'I',
      title: 'PARTIES TO THE CONTRACT',
      blocks: [
        {
          kind: 'list',
          items: [
            'Wholesaler: [WHOLESALER_NAME]',
            'End Buyer: [END_BUYER_NAME]',
          ],
        },
        { kind: 'paragraph', text: 'Both parties agree to the following:' },
      ],
    },
    {
      number: 'II',
      title: 'REFERENCE TO ORIGINAL CONTRACT',
      blocks: [
        {
          kind: 'paragraph',
          text: 'This Contract assigns the rights of the Purchase & Sale Agreement signed on this [DAY] day of [MONTH], [YEAR], between the following parties:',
        },
        {
          kind: 'list',
          items: [
            'Seller Name: [SELLER_NAME]',
            'Wholesaler Name: [WHOLESALER_NAME]',
            'Property Address: [PROPERTY_ADDRESS]',
          ],
        },
      ],
    },
    {
      number: 'III',
      title: 'ASSIGNMENT FEE',
      blocks: [
        {
          kind: 'paragraph',
          text: 'End Buyer agrees to pay Wholesaler the sum of USD $[ASSIGNMENT_FEE_TOTAL] as the Assignment Fee, broken down as follows:',
        },
        {
          kind: 'list',
          items: [
            'Initial Assignment Fee Deposit: USD $[ASSIGNMENT_FEE_INITIAL], to be paid within [INITIAL_DEPOSIT_DAYS] days after signing this contract.',
            'Final Assignment Fee Payment: USD $[ASSIGNMENT_FEE_FINAL], to be paid on the closing date.',
          ],
        },
      ],
    },
    {
      number: 'IV',
      title: 'END BUYER REPRESENTATIONS',
      blocks: [
        { kind: 'paragraph', text: 'End Buyer represents and warrants:' },
        {
          kind: 'list',
          items: [
            'To possess the funds necessary to complete the transaction.',
            'To accept the property in its current “As Is” condition.',
            'To know and accept the terms of the original Purchase & Sale Agreement.',
          ],
        },
      ],
    },
    {
      number: 'V',
      title: 'WHOLESALER PROTECTION',
      blocks: [
        {
          kind: 'list',
          items: [
            'End Buyer may not negotiate directly with Seller without Wholesaler’s authorization.',
            'Any attempt to circumvent the Wholesaler shall result in contract voidance and applicable penalties.',
          ],
        },
      ],
    },
    {
      number: 'VI',
      title: 'CONTINGENCY CLAUSE',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The non-refundable Earnest Money shall only become effective upon completion and acceptance of the property inspection period.',
        },
      ],
    },
    {
      number: 'VII',
      title: 'DISPUTE RESOLUTION',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Any disputes arising from this Contract shall initially be handled through mediation between the parties. If no agreement is reached, the parties may resort to arbitration under the laws applicable in Puerto Rico.',
        },
      ],
    },
    {
      number: 'VIII',
      title: 'AMENDMENTS',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Any modification or amendment to this Contract must be made in writing and signed by both parties to be valid.',
        },
      ],
    },
    {
      number: 'IX',
      title: 'DEPOSIT CONFIRMATION',
      blocks: [
        {
          kind: 'paragraph',
          text: 'End Buyer confirms delivery of the Earnest Money of USD $[EMD_AMOUNT] as a sign of commitment toward purchasing the property. This deposit is independent of the Assignment Fee.',
        },
      ],
    },
    {
      number: 'X',
      title: 'SIGNATURES',
      blocks: [
        {
          kind: 'signatures',
          roles: [
            { label: 'Wholesaler', hasName: false, hasDate: true },
            { label: 'End Buyer', hasName: false, hasDate: true },
            { label: 'Witness 1', hasName: false, hasDate: true },
            { label: 'Witness 2', hasName: false, hasDate: true },
          ],
        },
      ],
    },
  ],
};
