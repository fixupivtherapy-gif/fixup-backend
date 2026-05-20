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
        eyebrow="01 / 05"
        title={isEn ? 'Deal Pipeline' : 'Pipeline de Negocios'}
        description={
          isEn
            ? 'Kanban: Prospect → Under Contract → Assigned → Closed.'
            : 'Kanban: Prospecto → Bajo Contrato → Asignado → Cerrado.'
        }
        backHref="/herramientas/software"
        backLabel={tcommon('back')}
      />
      <ComingSoon locale={locale} />
    </div>
  );
}
