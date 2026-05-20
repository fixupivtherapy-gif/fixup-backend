import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, ArrowRight, Check } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { SectionDivider } from '@/components/section-divider';

const tiles = [
  { key: 'calculadoras', num: '01', href: '/herramientas/calculadoras' },
  { key: 'recursos', num: '02', href: '/herramientas/recursos' },
  { key: 'software', num: '03', href: '/herramientas/software' },
] as const;

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('home');
  const tc = useTranslations('common');

  return (
    <div className="container pt-12 pb-16 md:pt-20 md:pb-24">
      {/* HERO — asymmetric, left-aligned, serif-dominant */}
      <section className="grid grid-cols-12 gap-x-6 gap-y-10 animate-fade-up">
        <div className="col-span-12 md:col-span-8 lg:col-span-7">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="marker">— 01 / {t('eyebrow')}</span>
          </div>
          <h1 className="font-display text-[2.5rem] md:text-[3.75rem] lg:text-[4.5rem] leading-[1.02] tracking-[-0.025em] text-ink">
            {t('intro1')}{' '}
            <span className="italic text-clay">{t('intro2')}</span>
          </h1>
          <p className="mt-7 max-w-prose text-[17px] leading-relaxed text-muted">
            {t('introBody')}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/herramientas/calculadoras">
                {t('ctaPrimary')}
                <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/herramientas/recursos">
                {t('ctaSecondary')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Right column — small trust block, offset down for asymmetry */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-4 lg:col-start-9 md:pt-24">
          <div className="border-l border-rule pl-5">
            <p className="eyebrow mb-4">{t('trust.label')}</p>
            <ul className="space-y-3">
              {(t.raw('trust.items') as string[]).map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[14px] text-ink"
                >
                  <Check className="size-4 text-clay mt-0.5 shrink-0" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {/* HERRAMIENTAS — list-style rows, not card grid */}
      <section className="mt-24 md:mt-32">
        <SectionDivider label={t('sectionLabel')} align="left" />

        <ul className="mt-2 divide-y divide-rule border-b border-rule">
          {tiles.map((tile) => (
            <li key={tile.key}>
              <Link
                href={tile.href}
                className="group block py-7 md:py-9 hover:bg-paper/60 transition-colors -mx-2 px-2"
              >
                <div className="grid grid-cols-12 gap-x-6 items-baseline">
                  <div className="col-span-2 md:col-span-1">
                    <span className="font-mono text-2xs text-clay tracking-caps">
                      {tile.num}
                    </span>
                  </div>
                  <div className="col-span-10 md:col-span-7 lg:col-span-6">
                    <h3 className="font-display text-2xl md:text-3xl text-ink leading-tight">
                      {t(`tiles.${tile.key}.title`)}
                    </h3>
                    <p className="mt-2 text-[15px] text-muted leading-relaxed">
                      {t(`tiles.${tile.key}.summary`)}
                    </p>
                  </div>
                  <div className="hidden md:flex md:col-span-4 lg:col-span-5 items-center justify-end gap-2 text-2xs uppercase tracking-caps text-muted group-hover:text-clay transition-colors">
                    <span>{tc('open')}</span>
                    <ArrowRight className="size-3.5" strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
