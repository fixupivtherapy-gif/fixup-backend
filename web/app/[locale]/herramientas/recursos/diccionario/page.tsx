import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { DictionaryClient } from './dictionary-client';

export default async function DiccionarioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tcommon = await getTranslations('common');

  const titleEs = 'Diccionario de bienes raíces';
  const titleEn = 'Real estate dictionary';
  const descEs =
    'Términos bilingües de wholesaling, financiamiento creativo, legal, financiamiento, análisis y marketing. Busca por palabra o filtra por categoría.';
  const descEn =
    'Bilingual terms across wholesaling, creative finance, legal, financing, analysis and marketing. Search by word or filter by category.';

  return (
    <div className="container pt-10 pb-20 md:pt-14">
      <PageHeader
        eyebrow="01 / 03"
        title={locale === 'en' ? titleEn : titleEs}
        description={locale === 'en' ? descEn : descEs}
        backHref="/herramientas/recursos"
        backLabel={tcommon('back')}
      />
      <DictionaryClient locale={locale} />
    </div>
  );
}
