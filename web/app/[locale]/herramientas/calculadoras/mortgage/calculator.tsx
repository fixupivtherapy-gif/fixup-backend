'use client';

import { useMemo, useState } from 'react';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { ResultRow } from '@/components/result-row';
import { SectionDivider } from '@/components/section-divider';
import { calcMortgage } from '@/lib/calculators';
import { formatCurrency } from '@/lib/utils';

const STRINGS = {
  es: {
    inputs: 'Datos del préstamo',
    loan: 'Monto del préstamo',
    rate: 'Tasa anual',
    term: 'Plazo (años)',
    calc: 'Calcular',
    reset: 'Limpiar',
    results: 'Resultados',
    monthly: 'Pago mensual (P&I)',
    totalInterest: 'Interés total a pagar',
    totalPaid: 'Total pagado',
    preview: 'Amortización — primeros 12 meses',
    month: 'Mes',
    interest: 'Interés',
    principal: 'Principal',
    balance: 'Saldo',
    emptyState:
      'Ingresa los datos del préstamo para ver el pago mensual y la amortización.',
  },
  en: {
    inputs: 'Loan details',
    loan: 'Loan amount',
    rate: 'Annual rate',
    term: 'Term (years)',
    calc: 'Calculate',
    reset: 'Reset',
    results: 'Results',
    monthly: 'Monthly payment (P&I)',
    totalInterest: 'Total interest paid',
    totalPaid: 'Total paid',
    preview: 'Amortization — first 12 months',
    month: 'Month',
    interest: 'Interest',
    principal: 'Principal',
    balance: 'Balance',
    emptyState:
      'Enter loan details to see the monthly payment and amortization.',
  },
};

export function MortgageCalculator({ locale }: { locale: string }) {
  const t = STRINGS[locale === 'en' ? 'en' : 'es'];
  const fmtLocale = locale === 'en' ? 'en-US' : 'es-US';

  const [loan, setLoan] = useState<string>('200000');
  const [rate, setRate] = useState<string>('7.25');
  const [term, setTerm] = useState<string>('30');

  const result = useMemo(() => {
    const ln = parseFloat(loan);
    const rt = parseFloat(rate);
    const tm = parseFloat(term);
    if (!ln || !rt || !tm) return null;
    return calcMortgage({ loanAmount: ln, annualRate: rt, termYears: tm });
  }, [loan, rate, term]);

  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-10">
      {/* Inputs */}
      <div className="col-span-12 lg:col-span-5">
        <SectionDivider label={t.inputs} align="left" />
        <div className="mt-6 space-y-5">
          <Field
            label={t.loan}
            type="number"
            inputMode="decimal"
            prefix="$"
            value={loan}
            onChange={(e) => setLoan(e.target.value)}
          />
          <Field
            label={t.rate}
            type="number"
            inputMode="decimal"
            suffix="%"
            step="0.125"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <Field
            label={t.term}
            type="number"
            inputMode="numeric"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setLoan('');
                setRate('');
                setTerm('');
              }}
            >
              {t.reset}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="col-span-12 lg:col-span-7">
        <SectionDivider label={t.results} align="left" />
        {!result ? (
          <p className="mt-6 text-[15px] text-muted">{t.emptyState}</p>
        ) : (
          <div className="mt-6">
            <ResultRow
              label={t.monthly}
              value={formatCurrency(result.monthlyPayment, fmtLocale, {
                maximumFractionDigits: 2,
              })}
              emphasis
            />
            <ResultRow
              label={t.totalInterest}
              value={formatCurrency(result.totalInterest, fmtLocale, {
                maximumFractionDigits: 0,
              })}
            />
            <ResultRow
              label={t.totalPaid}
              value={formatCurrency(result.totalPaid, fmtLocale, {
                maximumFractionDigits: 0,
              })}
            />

            <div className="mt-10">
              <SectionDivider label={t.preview} align="left" />
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-2xs uppercase tracking-caps text-muted border-b border-rule">
                      <th className="text-left py-2 font-normal">{t.month}</th>
                      <th className="text-right py-2 font-normal">
                        {t.interest}
                      </th>
                      <th className="text-right py-2 font-normal">
                        {t.principal}
                      </th>
                      <th className="text-right py-2 font-normal">
                        {t.balance}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono tabular-nums text-[13px]">
                    {result.schedulePreview.map((row) => (
                      <tr key={row.month} className="border-b border-rule/50">
                        <td className="py-1.5 text-muted">{row.month}</td>
                        <td className="py-1.5 text-right">
                          {formatCurrency(row.interest, fmtLocale, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="py-1.5 text-right">
                          {formatCurrency(row.principal, fmtLocale, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="py-1.5 text-right text-ink">
                          {formatCurrency(row.balance, fmtLocale, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
