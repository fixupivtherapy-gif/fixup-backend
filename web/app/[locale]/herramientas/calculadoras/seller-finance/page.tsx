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
  const tc = await getTranslations('calculadoras');
  const tcommon = await getTranslations('common');
  return (
    <div className="container pt-10 pb-20 md:pt-14">
      <PageHeader
        eyebrow="06 / 08"
        title={tc('tools.seller.title')}
        description={tc('tools.seller.summary')}
        backHref="/herramientas/calculadoras"
        backLabel={tcommon('back')}
      />
      <ComingSoon locale={locale} />
    </div>
  );
}
