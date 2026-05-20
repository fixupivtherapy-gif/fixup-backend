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
        eyebrow="04 / 05"
        title={isEn ? 'Direct Mail Generator' : 'Generador de Cartas Directas'}
        description={
          isEn
            ? 'Seller letters in ES/EN by motivation: probate, pre-foreclosure, tired landlord, vacant.'
            : 'Cartas al vendedor en ES/EN por motivación: probate, pre-ejecución, casero cansado, vacante.'
        }
        backHref="/herramientas/software"
        backLabel={tcommon('back')}
      />
      <ComingSoon locale={locale} />
    </div>
  );
}
