'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResultRow } from '@/components/result-row';
import { SectionDivider } from '@/components/section-divider';
import { formatCurrency, cn } from '@/lib/utils';

const STRINGS = {
  es: {
    upload: 'Subir fotos',
    uploadHint:
      'Hasta 8 fotos · JPG, PNG o WEBP · cocina, baños, exterior, daños visibles',
    selected: 'fotos seleccionadas',
    remove: 'Quitar',
    analyze: 'Analizar con IA',
    analyzing: 'Analizando fotos…',
    results: 'Estimado',
    breakdown: 'Desglose por área',
    totalLow: 'Total — bajo',
    totalHigh: 'Total — alto',
    midpoint: 'Punto medio',
    condition: 'Condición general',
    summary: 'Resumen',
    emptyState:
      'Sube al menos una foto y presiona Analizar. El modelo evaluará la condición y producirá un desglose con rangos en USD.',
    errorPrefix: 'Error',
    item: 'Concepto',
    rango: 'Rango',
  },
  en: {
    upload: 'Upload photos',
    uploadHint:
      'Up to 8 photos · JPG, PNG or WEBP · kitchen, baths, exterior, visible damage',
    selected: 'photos selected',
    remove: 'Remove',
    analyze: 'Analyze with AI',
    analyzing: 'Analyzing photos…',
    results: 'Estimate',
    breakdown: 'Breakdown by area',
    totalLow: 'Total — low',
    totalHigh: 'Total — high',
    midpoint: 'Midpoint',
    condition: 'Overall condition',
    summary: 'Summary',
    emptyState:
      'Upload at least one photo and press Analyze. The model will evaluate the condition and produce a breakdown with USD ranges.',
    errorPrefix: 'Error',
    item: 'Item',
    rango: 'Range',
  },
};

interface PhotoFile {
  id: string;
  file: File;
  url: string;
  base64?: string;
  mediaType: string;
}

interface RehabItem {
  area: string;
  description: string;
  costLow: number;
  costHigh: number;
}
interface RehabEstimate {
  items: RehabItem[];
  totalLow: number;
  totalHigh: number;
  summary: string;
  conditionScore: number;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [, base64] = result.split(',');
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function RehabEstimator({ locale }: { locale: string }) {
  const t = STRINGS[locale === 'en' ? 'en' : 'es'];
  const fmtLocale = locale === 'en' ? 'en-US' : 'es-US';
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<RehabEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next: PhotoFile[] = [];
    for (const f of Array.from(files)) {
      if (photos.length + next.length >= 8) break;
      if (!f.type.startsWith('image/')) continue;
      next.push({
        id: crypto.randomUUID(),
        file: f,
        url: URL.createObjectURL(f),
        mediaType: f.type,
      });
    }
    setPhotos((prev) => [...prev, ...next]);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const analyze = async () => {
    setError(null);
    setEstimate(null);
    setLoading(true);
    try {
      const withBase64 = await Promise.all(
        photos.map(async (p) => ({
          base64: await fileToBase64(p.file),
          mediaType: p.mediaType,
        })),
      );
      const res = await fetch('/api/rehab-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: withBase64, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setEstimate(data.estimate);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const midpoint = estimate
    ? Math.round((estimate.totalLow + estimate.totalHigh) / 2)
    : 0;

  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-10">
      {/* Uploader */}
      <div className="col-span-12 lg:col-span-6">
        <SectionDivider label={t.upload} align="left" />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'mt-6 w-full border border-dashed border-rule bg-paper/40 hover:bg-paper transition-colors',
            'flex flex-col items-center justify-center gap-3 py-12 px-6 text-center',
          )}
        >
          <Upload className="size-6 text-clay" strokeWidth={1.5} />
          <span className="font-display text-lg text-ink">{t.upload}</span>
          <span className="text-xs text-muted max-w-xs">{t.uploadHint}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {photos.length > 0 && (
          <>
            <p className="mt-5 eyebrow">
              {photos.length} {t.selected}
            </p>
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {photos.map((p) => (
                <li key={p.id} className="relative group">
                  <img
                    src={p.url}
                    alt=""
                    className="w-full aspect-square object-cover border border-rule"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    className="absolute top-1 right-1 bg-ink/80 text-paper p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={t.remove}
                  >
                    <X className="size-3.5" strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-6">
          <Button
            type="button"
            size="lg"
            onClick={analyze}
            disabled={photos.length === 0 || loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                {t.analyzing}
              </>
            ) : (
              <>
                <ImageIcon />
                {t.analyze}
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-5 border border-clay/40 bg-clay/5 p-4 flex gap-2 items-start text-sm">
            <AlertCircle
              className="size-4 text-clay shrink-0 mt-0.5"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-clay font-medium">{t.errorPrefix}</p>
              <p className="text-ink mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="col-span-12 lg:col-span-6">
        <SectionDivider label={t.results} align="left" />

        {!estimate && !loading && (
          <p className="mt-6 text-[15px] text-muted leading-relaxed">
            {t.emptyState}
          </p>
        )}

        {loading && (
          <div className="mt-6 flex items-center gap-3 text-muted">
            <Loader2 className="animate-spin size-4" strokeWidth={1.5} />
            <span>{t.analyzing}</span>
          </div>
        )}

        {estimate && (
          <div className="mt-6">
            <ResultRow
              label={t.midpoint}
              value={formatCurrency(midpoint, fmtLocale)}
              emphasis
            />
            <ResultRow
              label={t.totalLow}
              value={formatCurrency(estimate.totalLow, fmtLocale)}
            />
            <ResultRow
              label={t.totalHigh}
              value={formatCurrency(estimate.totalHigh, fmtLocale)}
            />
            <ResultRow
              label={t.condition}
              value={`${estimate.conditionScore} / 10`}
            />

            <div className="mt-6 border-l-2 border-clay pl-4 py-1">
              <p className="eyebrow mb-1">{t.summary}</p>
              <p className="text-[14px] text-ink leading-relaxed">
                {estimate.summary}
              </p>
            </div>

            <div className="mt-8">
              <p className="eyebrow mb-3">{t.breakdown}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-2xs uppercase tracking-caps text-muted border-b border-rule">
                    <th className="text-left py-2 font-normal">{t.item}</th>
                    <th className="text-right py-2 font-normal">{t.rango}</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.items.map((it, i) => (
                    <tr key={i} className="border-b border-rule/60 align-top">
                      <td className="py-2.5 pr-4">
                        <p className="text-ink font-medium">{it.area}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {it.description}
                        </p>
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums whitespace-nowrap">
                        {formatCurrency(it.costLow, fmtLocale)}
                        <span className="text-muted-soft px-1">–</span>
                        {formatCurrency(it.costHigh, fmtLocale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
