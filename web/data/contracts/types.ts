export type ContractSectionContent =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'signatures'; roles: SignatureRole[] };

export interface SignatureRole {
  label: string;
  hasName?: boolean;
  hasDate?: boolean;
}

export interface ContractSection {
  number: string; // Roman numeral or arabic
  title: string;
  blocks: ContractSectionContent[];
}

export interface ContractTemplate {
  id: 'cash' | 'assignment';
  locale: 'es' | 'en';
  title: string;
  preamble?: string;
  sections: ContractSection[];
  /** Footer text per page (e.g. "El comprador y el vendedor acusan recibo…") */
  pageFooterEs?: string;
  pageFooterEn?: string;
}

export interface ContractMeta {
  id: 'cash' | 'assignment';
  titleEs: string;
  titleEn: string;
  summaryEs: string;
  summaryEn: string;
}

export const CONTRACT_META: ContractMeta[] = [
  {
    id: 'cash',
    titleEs: 'Contrato de Promesa de Compraventa',
    titleEn: 'Purchase & Sale Agreement',
    summaryEs:
      'Contrato principal de compra en efectivo. Incluye depósito, inspección, cesión y arbitraje en Puerto Rico.',
    summaryEn:
      'Primary cash purchase contract. Includes deposit, inspection, assignment rights, and Puerto Rico arbitration.',
  },
  {
    id: 'assignment',
    titleEs: 'Contrato de Asignación',
    titleEn: 'Assignment Agreement',
    summaryEs:
      'Cesión del Contrato de Compraventa al comprador final con assignment fee desglosado.',
    summaryEn:
      'Assignment of the Purchase & Sale Agreement to the end buyer with itemized assignment fee.',
  },
];
