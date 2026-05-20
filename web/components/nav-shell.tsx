'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Wordmark } from './wordmark';
import { LanguageToggle } from './language-toggle';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/herramientas/calculadoras', key: 'calculadoras', num: '01' },
  { href: '/herramientas/recursos', key: 'recursos', num: '02' },
  { href: '/herramientas/software', key: 'software', num: '03' },
] as const;

export function NavShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <div className="min-h-dvh flex flex-col above-grain">
      <header className="sticky top-0 z-30 backdrop-blur-sm bg-bone/85 border-b border-rule">
        <div className="container flex h-14 items-center justify-between">
          <Wordmark size="md" />
          <LanguageToggle />
        </div>
        <nav className="container border-t border-rule/60">
          <ul className="flex items-stretch -mx-1">
            {tabs.map((tab) => {
              const active = pathname?.startsWith(tab.href);
              return (
                <li key={tab.key} className="flex-1">
                  <Link
                    href={tab.href}
                    className={cn(
                      'group flex items-center justify-center gap-2 px-2 py-3 text-[13px] tracking-wide',
                      'border-b-2 border-transparent transition-colors',
                      active
                        ? 'text-ink border-clay'
                        : 'text-muted hover:text-ink hover:border-rule',
                    )}
                  >
                    <span
                      className={cn(
                        'font-mono text-2xs',
                        active ? 'text-clay' : 'text-muted-soft',
                      )}
                    >
                      {tab.num}
                    </span>
                    <span className="font-sans">
                      {t(tab.key as 'calculadoras' | 'recursos' | 'software')}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}

function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="border-t border-rule mt-24">
      <div className="container py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Wordmark size="sm" asLink={false} />
          <p className="text-2xs uppercase tracking-caps text-muted">
            {t('tagline')}
          </p>
        </div>
        <p className="text-2xs uppercase tracking-caps text-muted">
          © {new Date().getFullYear()} · {t('rights')}
        </p>
      </div>
    </footer>
  );
}
