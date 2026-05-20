import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { ArvCalculator } from './calculator';

export default async function ArvPage({
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
        eyebrow="02 / 08"
        title={tc('tools.arv.title')}
        description={tc('tools.arv.summary')}
        backHref="/herramientas/calculadoras"
        backLabel={tcommon('back')}
      />
      <ArvCalculator locale={locale} />
    </div>
  );
}
