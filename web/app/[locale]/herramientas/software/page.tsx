import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, KanbanSquare, Users, Search, Mail, Phone } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { SectionDivider } from '@/components/section-divider';

export default function SoftwarePage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  return <Content />;
}

function Content() {
  const t = useTranslations('software');
  const tc = useTranslations('common');

  const tools = [
    {
      key: 'pipeline',
      href: '/herramientas/software/pipeline',
      num: '01',
      Icon: KanbanSquare,
      title: 'Pipeline de negocios',
      summary:
        'Kanban: Prospecto → Bajo contrato → Asignado → Cerrado.',
    },
    {
      key: 'buyers',
      href: '/herramientas/software/compradores',
      num: '02',
      Icon: Users,
      title: 'Lista de compradores',
      summary:
        'CRM ligero con criterios, áreas y rangos de precio por comprador.',
    },
    {
      key: 'skip',
      href: '/herramientas/software/skip-trace',
      num: '03',
      Icon: Search,
      title: 'Skip trace helper',
      summary:
        'Entrada manual a plantilla formateada de investigación de dueño.',
    },
    {
      key: 'mail',
      href: '/herramientas/software/cartas',
      num: '04',
      Icon: Mail,
      title: 'Generador de cartas directas',
      summary:
        'Cartas en ES o EN según motivación: probate, pre-foreclosure, vacante…',
    },
    {
      key: 'scripts',
      href: '/herramientas/software/scripts',
      num: '05',
      Icon: Phone,
      title: 'Scripts de llamadas en frío',
      summary:
        'Scripts en ES o EN generados según tipo de lead.',
    },
  ];

  return (
    <div className="container pt-10 pb-16 md:pt-16">
      <div className="max-w-2xl">
        <p className="marker mb-4">— 03</p>
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
          {tools.map(({ key, href, num, Icon, title, summary }) => (
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
                        {title}
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
