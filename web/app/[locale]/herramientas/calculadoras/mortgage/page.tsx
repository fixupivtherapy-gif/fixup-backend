import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { MortgageCalculator } from './calculator';

export default async function MortgagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations('calculadoras');
  const tcommon = await getTranslations('common');

  return (
    <div className="container pt-10 pb-20 md:pt-14">
      <PageHeader
        eyebrow="01 / 08"
        title={tc('tools.mortgage.title')}
        description={tc('tools.mortgage.summary')}
        backHref="/herramientas/calculadoras"
        backLabel={tcommon('back')}
      />
      <MortgageCalculator locale={locale} />
    </div>
  );
}
