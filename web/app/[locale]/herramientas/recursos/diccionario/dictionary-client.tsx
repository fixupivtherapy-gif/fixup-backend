'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  CATEGORY_LABELS,
  DICTIONARY,
  type DictionaryCategory,
} from '@/data/dictionary';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const STRINGS = {
  es: {
    search: 'Buscar término…',
    all: 'Todas',
    noResults: 'Sin resultados.',
    showing: 'Mostrando',
    of: 'de',
    terms: 'términos',
    example: 'Ejemplo',
    equivalent: 'Equivalente en inglés',
    equivalentEn: 'Spanish equivalent',
  },
  en: {
    search: 'Search term…',
    all: 'All',
    noResults: 'No results.',
    showing: 'Showing',
    of: 'of',
    terms: 'terms',
    example: 'Example',
    equivalent: 'Spanish equivalent',
    equivalentEn: 'Spanish equivalent',
  },
};

const CATEGORIES: DictionaryCategory[] = [
  'wholesaling',
  'creativo',
  'analisis',
  'financiamiento',
  'legal',
  'marketing',
];

export function DictionaryClient({ locale }: { locale: string }) {
  const t = STRINGS[locale === 'en' ? 'en' : 'es'];
  const isEn = locale === 'en';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DictionaryCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DICTIONARY.filter((term) => {
      if (category !== 'all' && term.category !== category) return false;
      if (!q) return true;
      const hay = [
        term.es.term,
        term.es.definition,
        term.es.example || '',
        term.en.term,
        term.en.definition,
        term.en.example || '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, category]);

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-xl">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none"
            strokeWidth={1.5}
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-clay"
              aria-label="Clear"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 -mx-1">
          <CategoryChip
            active={category === 'all'}
            onClick={() => setCategory('all')}
            label={t.all}
          />
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
              label={CATEGORY_LABELS[c][isEn ? 'en' : 'es']}
            />
          ))}
        </div>

        <p className="eyebrow">
          {t.showing} {filtered.length} {t.of} {DICTIONARY.length} {t.terms}
        </p>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="mt-12 text-muted">{t.noResults}</p>
      ) : (
        <ul className="mt-8 divide-y divide-rule border-t border-rule">
          {filtered.map((term) => {
            const primary = isEn ? term.en : term.es;
            const alt = isEn ? term.es : term.en;
            return (
              <li key={term.id} className="py-7">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-3">
                    <p className="font-mono text-2xs tracking-caps text-clay uppercase">
                      {CATEGORY_LABELS[term.category][isEn ? 'en' : 'es']}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-9">
                    <h3 className="font-display text-2xl text-ink">
                      {primary.term}
                    </h3>
                    <p className="mt-2 text-[15px] text-ink leading-relaxed">
                      {primary.definition}
                    </p>
                    {primary.example && (
                      <p className="mt-3 text-[14px] text-muted italic border-l border-rule pl-3">
                        <span className="not-italic font-sans uppercase text-2xs tracking-caps text-muted-soft mr-2">
                          {t.example}:
                        </span>
                        {primary.example}
                      </p>
                    )}
                    <div className="mt-4 pt-3 border-t border-rule/60">
                      <p className="text-2xs uppercase tracking-caps text-muted-soft mb-1">
                        {isEn ? 'Spanish equivalent' : 'English equivalent'}
                      </p>
                      <p className="text-[13px] text-muted">
                        <span className="text-ink">{alt.term}</span> · {alt.definition}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 px-3 mx-1 my-0.5 text-2xs uppercase tracking-caps border transition-colors',
        active
          ? 'bg-ink text-paper border-ink'
          : 'border-rule text-muted hover:text-ink hover:border-ink/40',
      )}
    >
      {label}
    </button>
  );
}
