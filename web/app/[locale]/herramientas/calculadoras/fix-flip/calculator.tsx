'use client';

import { useMemo, useState } from 'react';
import { Field } from '@/components/ui/field';
import { ResultRow } from '@/components/result-row';
import { SectionDivider } from '@/components/section-divider';
import { calcFixFlip } from '@/lib/calculators';
import { formatCurrency, cn } from '@/lib/utils';

const STRINGS = {
  es: {
    inputs: 'Datos del negocio',
    arv: 'ARV (valor después de reparaciones)',
    rehab: 'Costo de rehabilitación',
    purchase: 'Precio de compra',
    holding: 'Costos de mantenimiento (holding)',
    selling: 'Costos de venta',
    rule: 'Regla MAO',
    results: 'Resultados',
    mao: 'MAO — Máxima Oferta Permitida',
    margin: 'Margen vs. precio de compra',
    invested: 'Total invertido',
    sellingCost: 'Costo de venta calculado',
    profit: 'Ganancia estimada',
    roi: 'ROI',
    emptyState: 'Ingresa el ARV y los costos para evaluar el negocio.',
    marginHint:
      'Diferencia entre MAO y tu precio de compra. Positivo = margen disponible.',
  },
  en: {
    inputs: 'Deal inputs',
    arv: 'ARV (after-repair value)',
    rehab: 'Rehab cost',
    purchase: 'Purchase price',
    holding: 'Holding costs',
    selling: 'Selling costs',
    rule: 'MAO rule',
    results: 'Results',
    mao: 'MAO — Maximum Allowable Offer',
    margin: 'Margin vs. purchase price',
    invested: 'Total invested',
    sellingCost: 'Computed selling cost',
    profit: 'Estimated profit',
    roi: 'ROI',
    emptyState: 'Enter ARV and costs to evaluate the deal.',
    marginHint:
      'Difference between MAO and your purchase price. Positive = margin available.',
  },
};

export function FixFlipCalculator({ locale }: { locale: string }) {
  const t = STRINGS[locale === 'en' ? 'en' : 'es'];
  const fmtLocale = locale === 'en' ? 'en-US' : 'es-US';

  const [arv, setArv] = useState('260000');
  const [rehab, setRehab] = useState('35000');
  const [purchase, setPurchase] = useState('140000');
  const [holding, setHolding] = useState('5000');
  const [sellingPct, setSellingPct] = useState('8');
  const [rulePct, setRulePct] = useState('70');

  const result = useMemo(() => {
    const a = parseFloat(arv);
    const r = parseFloat(rehab);
    const p = parseFloat(purchase);
    const h = parseFloat(holding);
    const sp = parseFloat(sellingPct);
    const rp = parseFloat(rulePct);
    if (!a) return null;
    return calcFixFlip({
      arv: a,
      rehabCost: r || 0,
      purchasePrice: p || 0,
      holdingCost: h || 0,
      sellingCostPct: sp || 0,
      rulePct: rp || 70,
    });
  }, [arv, rehab, purchase, holding, sellingPct, rulePct]);

  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-10">
      <div className="col-span-12 lg:col-span-6">
        <SectionDivider label={t.inputs} align="left" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Field
            label={t.arv}
            type="number"
            prefix="$"
            value={arv}
            onChange={(e) => setArv(e.target.value)}
            className="col-span-2"
          />
          <Field
            label={t.rehab}
            type="number"
            prefix="$"
            value={rehab}
            onChange={(e) => setRehab(e.target.value)}
          />
          <Field
            label={t.purchase}
            type="number"
            prefix="$"
            value={purchase}
            onChange={(e) => setPurchase(e.target.value)}
          />
          <Field
            label={t.holding}
            type="number"
            prefix="$"
            value={holding}
            onChange={(e) => setHolding(e.target.value)}
          />
          <Field
            label={t.selling}
            type="number"
            suffix="%"
            value={sellingPct}
            onChange={(e) => setSellingPct(e.target.value)}
          />
          <Field
            label={t.rule}
            type="number"
            suffix="%"
            value={rulePct}
            onChange={(e) => setRulePct(e.target.value)}
            hint={locale === 'en' ? 'Default 70%' : 'Default 70%'}
            className="col-span-2 max-w-[12rem]"
          />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-6">
        <SectionDivider label={t.results} align="left" />
        {!result ? (
          <p className="mt-6 text-[15px] text-muted">{t.emptyState}</p>
        ) : (
          <div className="mt-6">
            <ResultRow
              label={t.mao}
              value={formatCurrency(result.mao, fmtLocale)}
              emphasis
            />
            <ResultRow
              label={t.margin}
              value={formatCurrency(result.marginVsMao, fmtLocale)}
              hint={t.marginHint}
            />
            <ResultRow
              label={t.profit}
              value={formatCurrency(result.profit, fmtLocale)}
            />
            <ResultRow
              label={t.roi}
              value={`${result.roi.toFixed(1)}%`}
            />
            <ResultRow
              label={t.sellingCost}
              value={formatCurrency(result.sellingCost, fmtLocale)}
            />
            <ResultRow
              label={t.invested}
              value={formatCurrency(result.totalInvested, fmtLocale)}
            />

            <div
              className={cn(
                'mt-8 border-l-2 pl-4 py-2',
                result.profit > 0 ? 'border-clay' : 'border-muted',
              )}
            >
              <p className="text-xs uppercase tracking-caps text-muted mb-1">
                {result.profit > 0
                  ? locale === 'en'
                    ? 'Deal profile'
                    : 'Perfil del negocio'
                  : locale === 'en'
                    ? 'Caution'
                    : 'Precaución'}
              </p>
              <p className="text-sm text-ink leading-relaxed">
                {result.profit > 0
                  ? locale === 'en'
                    ? `Profit-positive. ${result.marginVsMao > 0 ? 'Purchase price is under MAO.' : 'Purchase price is at or above MAO — review.'}`
                    : `Ganancia positiva. ${result.marginVsMao > 0 ? 'El precio de compra está bajo la MAO.' : 'El precio está en o sobre la MAO — revisar.'}`
                  : locale === 'en'
                    ? 'Estimated profit is negative or zero — the deal does not work at these numbers.'
                    : 'La ganancia estimada es cero o negativa — el negocio no funciona con estos números.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
