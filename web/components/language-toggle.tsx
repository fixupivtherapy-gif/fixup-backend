'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: 'es' | 'en') => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className="inline-flex items-center text-2xs uppercase tracking-caps"
    >
      <button
        type="button"
        onClick={() => switchTo('es')}
        className={cn(
          'px-1.5 py-0.5 transition-colors',
          locale === 'es' ? 'text-clay' : 'text-muted hover:text-ink',
        )}
        aria-pressed={locale === 'es'}
      >
        ES
      </button>
      <span className="text-muted-soft" aria-hidden>
        /
      </span>
      <button
        type="button"
        onClick={() => switchTo('en')}
        className={cn(
          'px-1.5 py-0.5 transition-colors',
          locale === 'en' ? 'text-clay' : 'text-muted hover:text-ink',
        )}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  );
}
