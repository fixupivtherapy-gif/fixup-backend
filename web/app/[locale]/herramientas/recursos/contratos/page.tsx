import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { CONTRACT_META } from '@/data/contracts';
import { ContractsList } from './contracts-list';

export default async function ContratosPage({
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
        eyebrow="02 / 03"
        title={isEn ? 'Contracts' : 'Contratos'}
        description={
          isEn
            ? 'Downloadable legal templates in Spanish and English (.docx). Templates preserve bracketed fields for per-deal customization.'
            : 'Plantillas legales descargables en español e inglés (.docx). Las plantillas preservan los campos entre corchetes para personalización por negocio.'
        }
        backHref="/herramientas/recursos"
        backLabel={tcommon('back')}
      />
      <ContractsList contracts={CONTRACT_META} locale={locale} />
    </div>
  );
}
