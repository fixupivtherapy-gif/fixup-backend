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
        eyebrow="03 / 05"
        title={isEn ? 'Skip Trace Helper' : 'Skip Trace Helper'}
        description={
          isEn
            ? 'Manual input → formatted owner research template.'
            : 'Entrada manual → plantilla formateada de investigación de dueño.'
        }
        backHref="/herramientas/software"
        backLabel={tcommon('back')}
      />
      <ComingSoon locale={locale} />
    </div>
  );
}
