'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionDivider } from '@/components/section-divider';
import { getContract } from '@/data/contracts';
import type { ContractMeta } from '@/data/contracts/types';
import { generateContractDocx, downloadBlob } from '@/lib/docx-generator';

const STRINGS = {
  es: {
    available: 'Contratos disponibles',
    downloadEs: 'Descargar en español (.docx)',
    downloadEn: 'Descargar en inglés (.docx)',
    generating: 'Generando…',
    note: 'Estos contratos están basados en plantillas internas. Revísalos con un abogado licenciado en la jurisdicción donde opere antes de usarlos en producción.',
  },
  en: {
    available: 'Available contracts',
    downloadEs: 'Download in Spanish (.docx)',
    downloadEn: 'Download in English (.docx)',
    generating: 'Generating…',
    note: 'These contracts are based on internal templates. Have them reviewed by a licensed attorney in the operating jurisdiction before production use.',
  },
};

export function ContractsList({
  contracts,
  locale,
}: {
  contracts: ContractMeta[];
  locale: string;
}) {
  const t = STRINGS[locale === 'en' ? 'en' : 'es'];
  const [busy, setBusy] = useState<string | null>(null);

  const handleDownload = async (
    id: 'cash' | 'assignment',
    lang: 'es' | 'en',
    title: string,
  ) => {
    setBusy(`${id}-${lang}`);
    try {
      const template = getContract(id, lang);
      const blob = await generateContractDocx(template);
      const filename = `${title.replace(/\s+/g, '-').toLowerCase()}-${lang}.docx`;
      downloadBlob(blob, filename);
    } finally {
      setBusy(null);
    }
  };

  const isEn = locale === 'en';

  return (
    <div>
      <SectionDivider label={t.available} align="left" />

      <ul className="mt-2 divide-y divide-rule border-b border-rule">
        {contracts.map((c) => (
          <li key={c.id} className="py-7">
            <div className="grid grid-cols-12 gap-x-6 gap-y-4 items-start">
              <div className="col-span-12 md:col-span-7 flex items-baseline gap-3">
                <FileText
                  className="size-5 text-muted shrink-0 translate-y-1"
                  strokeWidth={1.5}
                />
                <div>
                  <h3 className="font-display text-2xl text-ink">
                    {isEn ? c.titleEn : c.titleEs}
                  </h3>
                  <p className="mt-1.5 text-[14px] text-muted leading-relaxed">
                    {isEn ? c.summaryEn : c.summaryEs}
                  </p>
                </div>
              </div>
              <div className="col-span-12 md:col-span-5 flex flex-col gap-2 md:items-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    handleDownload(
                      c.id,
                      'es',
                      isEn ? c.titleEn : c.titleEs,
                    )
                  }
                  disabled={busy === `${c.id}-es`}
                >
                  {busy === `${c.id}-es` ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download />
                  )}
                  {t.downloadEs}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleDownload(c.id, 'en', isEn ? c.titleEn : c.titleEs)
                  }
                  disabled={busy === `${c.id}-en`}
                >
                  {busy === `${c.id}-en` ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download />
                  )}
                  {t.downloadEn}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 max-w-2xl text-xs text-muted leading-relaxed border-l border-rule pl-3 italic">
        {t.note}
      </p>
    </div>
  );
}
