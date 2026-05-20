import {
  CASH_CONTRACT_ES,
  CASH_CONTRACT_EN,
} from './cash-contract';
import {
  ASSIGNMENT_CONTRACT_ES,
  ASSIGNMENT_CONTRACT_EN,
} from './assignment';
import type { ContractTemplate } from './types';

export function getContract(
  id: 'cash' | 'assignment',
  locale: 'es' | 'en',
): ContractTemplate {
  if (id === 'cash') return locale === 'en' ? CASH_CONTRACT_EN : CASH_CONTRACT_ES;
  return locale === 'en' ? ASSIGNMENT_CONTRACT_EN : ASSIGNMENT_CONTRACT_ES;
}

export { CONTRACT_META } from './types';
export type { ContractTemplate } from './types';
