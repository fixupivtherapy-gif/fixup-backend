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
        eyebrow="03 / 03"
        title={isEn ? 'Contract Generator' : 'Generador de Contratos'}
        description={
          isEn
            ? 'Guided form + Claude-powered language customization, output to .docx and PDF.'
            : 'Formulario guiado + personalización de lenguaje con Claude, salida en .docx y PDF.'
        }
        backHref="/herramientas/recursos"
        backLabel={tcommon('back')}
      />
      <ComingSoon locale={locale} />
    </div>
  );
}
