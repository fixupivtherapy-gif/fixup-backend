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
        eyebrow="02 / 05"
        title={isEn ? 'Buyers List' : 'Lista de Compradores'}
        description={
          isEn
            ? 'CRM-lite: name, criteria, areas, price range.'
            : 'CRM ligero: nombre, criterios, áreas, rango de precio.'
        }
        backHref="/herramientas/software"
        backLabel={tcommon('back')}
      />
      <ComingSoon locale={locale} />
    </div>
  );
}
