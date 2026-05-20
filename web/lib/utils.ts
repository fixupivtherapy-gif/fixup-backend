import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  locale: string = 'es-US',
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
}

export function formatNumber(value: number, locale: string = 'es-US') {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(date: Date, locale: string = 'es-US') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
