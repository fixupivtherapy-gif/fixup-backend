import { Construction } from 'lucide-react';

export function ComingSoon({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  return (
    <div className="mt-12 border-l-2 border-clay pl-5 py-4 max-w-xl">
      <div className="flex items-start gap-3">
        <Construction
          className="size-5 text-clay shrink-0 mt-0.5"
          strokeWidth={1.5}
        />
        <div>
          <p className="eyebrow text-clay mb-1">
            {isEn ? 'In development' : 'En desarrollo'}
          </p>
          <p className="text-[15px] text-ink leading-relaxed">
            {isEn
              ? 'This module is part of the v1 roadmap. The interface and math are scoped — implementation is next.'
              : 'Este módulo es parte del roadmap de la v1. La interfaz y los cálculos están definidos — la implementación es lo siguiente.'}
          </p>
        </div>
      </div>
    </div>
  );
}
