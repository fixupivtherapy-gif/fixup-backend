import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, BookOpen, FileText, FilePlus2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { SectionDivider } from '@/components/section-divider';

export default function RecursosPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  return <Content />;
}

function Content() {
  const t = useTranslations('recursos');
  const tc = useTranslations('common');

  const sections = [
    {
      key: 'dictionary',
      href: '/herramientas/recursos/diccionario',
      num: '01',
      Icon: BookOpen,
      titleEs: 'Diccionario de bienes raíces',
      titleEn: 'Real estate dictionary',
      summary:
        '350+ términos bilingües de wholesaling, financiamiento creativo, legal y marketing.',
    },
    {
      key: 'contracts',
      href: '/herramientas/recursos/contratos',
      num: '02',
      Icon: FileText,
      titleEs: 'Contratos',
      titleEn: 'Contracts',
      summary:
        'Plantillas legales descargables en español e inglés (.docx y .pdf).',
    },
    {
      key: 'generator',
      href: '/herramientas/recursos/generador',
      num: '03',
      Icon: FilePlus2,
      titleEs: 'Generador de contratos',
      titleEn: 'Contract generator',
      summary:
        'Llena un formulario guiado, ajusta el lenguaje con IA y exporta a .docx o PDF.',
    },
  ];

  return (
    <div className="container pt-10 pb-16 md:pt-16">
      <div className="max-w-2xl">
        <p className="marker mb-4">— 02</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-4 text-[16px] text-muted leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      <section className="mt-16">
        <SectionDivider label={tc('all')} align="left" />
        <ul className="mt-2 divide-y divide-rule border-b border-rule">
          {sections.map(({ key, href, num, Icon, titleEs, summary }) => (
            <li key={key}>
              <Link
                href={href}
                className="group block py-7 hover:bg-paper/60 transition-colors -mx-2 px-2"
              >
                <div className="grid grid-cols-12 gap-x-6 items-baseline">
                  <div className="col-span-2 md:col-span-1">
                    <span className="font-mono text-2xs text-clay tracking-caps">
                      {num}
                    </span>
                  </div>
                  <div className="col-span-10 md:col-span-7 flex items-baseline gap-3">
                    <Icon
                      className="size-5 text-muted shrink-0 translate-y-1"
                      strokeWidth={1.5}
                    />
                    <div>
                      <h3 className="font-display text-xl md:text-2xl text-ink">
                        {titleEs}
                      </h3>
                      <p className="mt-1.5 text-[14px] text-muted leading-relaxed">
                        {summary}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex md:col-span-4 items-center justify-end gap-2 text-2xs uppercase tracking-caps text-muted group-hover:text-clay transition-colors">
                    <span>{tc('open')}</span>
                    <ArrowRight className="size-3.5" strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
