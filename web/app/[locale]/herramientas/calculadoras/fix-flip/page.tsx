import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { FixFlipCalculator } from './calculator';

export default async function FixFlipPage({
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
        eyebrow="04 / 08"
        title={tc('tools.fixflip.title')}
        description={tc('tools.fixflip.summary')}
        backHref="/herramientas/calculadoras"
        backLabel={tcommon('back')}
      />
      <FixFlipCalculator locale={locale} />
    </div>
  );
}
