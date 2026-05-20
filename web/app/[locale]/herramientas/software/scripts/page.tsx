import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { ComingSoon } from '@/components/coming-soon';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tcommon = await getTranslations('common');
  const isEn = locale === 'en';
  return (
    <div className="container pt-10 pb-20 md:pt-14">
      <PageHeader
        eyebrow="05 / 05"
        title={isEn ? 'Cold Call Script Builder' : 'Constructor de Scripts'}
        description={
          isEn
            ? 'Claude generates scripts in ES/EN based on lead type.'
            : 'Claude genera scripts en ES/EN según el tipo de lead.'
        }
        backHref="/herramientas/software"
        backLabel={tcommon('back')}
      />
      <ComingSoon locale={locale} />
    </div>
  );
}
