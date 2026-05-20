'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { ResultRow } from '@/components/result-row';
import { SectionDivider } from '@/components/section-divider';
import { calcArv, type Comp } from '@/lib/calculators';
import { formatCurrency } from '@/lib/utils';

const STRINGS = {
  es: {
    subject: 'Propiedad sujeto',
    subjectSqft: 'Pies cuadrados del sujeto',
    comps: 'Comparables vendidos',
    address: 'Dirección',
    sold: 'Precio vendido',
    sqft: 'Pies cuadrados',
    add: 'Agregar comparable',
    remove: 'Quitar',
    results: 'Resultados',
    avgPpsf: 'Promedio $/pie²',
    weightedPpsf: 'Promedio ponderado $/pie²',
    arv: 'ARV estimado',
    range: 'Rango ARV',
    breakdown: '$/pie² por comparable',
    emptyState:
      'Ingresa los pies cuadrados del sujeto y al menos un comparable para calcular el ARV.',
  },
  en: {
    subject: 'Subject property',
    subjectSqft: 'Subject square feet',
    comps: 'Sold comparables',
    address: 'Address',
    sold: 'Sold price',
    sqft: 'Square feet',
    add: 'Add comparable',
    remove: 'Remove',
    results: 'Results',
    avgPpsf: 'Average $/sqft',
    weightedPpsf: 'Weighted average $/sqft',
    arv: 'Estimated ARV',
    range: 'ARV range',
    breakdown: '$/sqft per comparable',
    emptyState:
      'Enter subject square feet and at least one comparable to calculate ARV.',
  },
};

interface CompRow extends Comp {
  id: string;
}

function emptyRow(): CompRow {
  return { id: crypto.randomUUID(), address: '', soldPrice: 0, sqft: 0 };
}

export function ArvCalculator({ locale }: { locale: string }) {
  const t = STRINGS[locale === 'en' ? 'en' : 'es'];
  const fmtLocale = locale === 'en' ? 'en-US' : 'es-US';

  const [subjectSqft, setSubjectSqft] = useState<string>('1200');
  const [comps, setComps] = useState<CompRow[]>([
    { id: '1', address: '123 Main St', soldPrice: 220000, sqft: 1180 },
    { id: '2', address: '456 Oak Ave', soldPrice: 245000, sqft: 1260 },
    { id: '3', address: '789 Pine Rd', soldPrice: 210000, sqft: 1140 },
  ]);

  const updateComp = (id: string, patch: Partial<Comp>) => {
    setComps((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  const result = useMemo(() => {
    const sqft = parseFloat(subjectSqft);
    if (!sqft || comps.length === 0) return null;
    return calcArv({ subjectSqft: sqft, comps });
  }, [subjectSqft, comps]);

  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-10">
      <div className="col-span-12 lg:col-span-7">
        <SectionDivider label={t.subject} align="left" />
        <div className="mt-6">
          <Field
            label={t.subjectSqft}
            type="number"
            inputMode="numeric"
            suffix="ft²"
            value={subjectSqft}
            onChange={(e) => setSubjectSqft(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="mt-10">
          <SectionDivider label={t.comps} align="left" />
          <div className="mt-6 space-y-4">
            {comps.map((c, i) => (
              <div
                key={c.id}
                className="surface p-4 grid grid-cols-12 gap-3 items-end"
              >
                <div className="col-span-12 md:col-span-5">
                  <Field
                    label={`${t.address} ${i + 1}`}
                    value={c.address}
                    onChange={(e) =>
                      updateComp(c.id, { address: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <Field
                    label={t.sold}
                    type="number"
                    prefix="$"
                    value={c.soldPrice || ''}
                    onChange={(e) =>
                      updateComp(c.id, { soldPrice: +e.target.value })
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <Field
                    label={t.sqft}
                    type="number"
                    suffix="ft²"
                    value={c.sqft || ''}
                    onChange={(e) =>
                      updateComp(c.id, { sqft: +e.target.value })
                    }
                  />
                </div>
                <div className="col-span-12 md:col-span-1 flex md:justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setComps((prev) => prev.filter((x) => x.id !== c.id))
                    }
                    className="text-muted hover:text-clay h-11 inline-flex items-center gap-1 text-xs uppercase tracking-caps md:justify-center"
                    aria-label={t.remove}
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
            <Button
              variant="secondary"
              type="button"
              onClick={() => setComps((p) => [...p, emptyRow()])}
            >
              <Plus />
              {t.add}
            </Button>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <SectionDivider label={t.results} align="left" />
        {!result ? (
          <p className="mt-6 text-[15px] text-muted">{t.emptyState}</p>
        ) : (
          <div className="mt-6">
            <ResultRow
              label={t.arv}
              value={formatCurrency(result.arv, fmtLocale)}
              emphasis
            />
            <ResultRow
              label={t.range}
              value={`${formatCurrency(result.arvLow, fmtLocale)} – ${formatCurrency(result.arvHigh, fmtLocale)}`}
            />
            <ResultRow
              label={t.avgPpsf}
              value={formatCurrency(result.avgPricePerSqft, fmtLocale, {
                maximumFractionDigits: 2,
              })}
            />
            <ResultRow
              label={t.weightedPpsf}
              value={formatCurrency(
                result.weightedAvgPricePerSqft,
                fmtLocale,
                { maximumFractionDigits: 2 },
              )}
            />

            <div className="mt-8">
              <p className="eyebrow mb-3">{t.breakdown}</p>
              <ul className="text-sm divide-y divide-rule border-y border-rule">
                {result.perCompPpsf.map((row, i) => (
                  <li
                    key={i}
                    className="flex items-baseline justify-between py-2"
                  >
                    <span className="text-ink truncate pr-3">
                      {row.address || `${t.address} ${i + 1}`}
                    </span>
                    <span className="font-mono tabular-nums text-muted">
                      {formatCurrency(row.ppsf, fmtLocale, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
