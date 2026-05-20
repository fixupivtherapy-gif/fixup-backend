import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { SectionDivider } from '@/components/section-divider';

const quickTools = [
  { key: 'rehab', href: '/herramientas/calculadoras/rehab', num: '01' },
  { key: 'arv', href: '/herramientas/calculadoras/arv', num: '02' },
  { key: 'mortgage', href: '/herramientas/calculadoras/mortgage', num: '03' },
] as const;

const dealTools = [
  { key: 'fixflip', href: '/herramientas/calculadoras/fix-flip', num: '01' },
  { key: 'section8', href: '/herramientas/calculadoras/section-8', num: '02' },
  { key: 'seller', href: '/herramientas/calculadoras/seller-finance', num: '03' },
  { key: 'subto', href: '/herramientas/calculadoras/subject-to', num: '04' },
  { key: 'sheets', href: '/herramientas/calculadoras/sheets', num: '05' },
] as const;

export default function CalculadorasPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  return <Content />;
}

function Content() {
  const t = useTranslations('calculadoras');
  const tc = useTranslations('common');

  return (
    <div className="container pt-10 pb-16 md:pt-16">
      <div className="max-w-2xl">
        <p className="marker mb-4">— {tc('all')}</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-4 text-[16px] text-muted leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      <ToolList
        label={t('groups.quick')}
        tools={quickTools}
        groupKey="tools"
      />
      <ToolList
        label={t('groups.deals')}
        tools={dealTools}
        groupKey="tools"
      />
    </div>
  );
}

function ToolList({
  label,
  tools,
}: {
  label: string;
  tools: ReadonlyArray<{ key: string; href: string; num: string }>;
  groupKey: string;
}) {
  const t = useTranslations('calculadoras');
  const tc = useTranslations('common');

  return (
    <section className="mt-16">
      <SectionDivider label={label} align="left" />
      <ul className="mt-2 divide-y divide-rule border-b border-rule">
        {tools.map((tool) => (
          <li key={tool.key}>
            <Link
              href={tool.href}
              className="group block py-6 md:py-7 hover:bg-paper/60 transition-colors -mx-2 px-2"
            >
              <div className="grid grid-cols-12 gap-x-6 items-baseline">
                <div className="col-span-2 md:col-span-1">
                  <span className="font-mono text-2xs text-clay tracking-caps">
                    {tool.num}
                  </span>
                </div>
                <div className="col-span-10 md:col-span-7">
                  <h3 className="font-display text-xl md:text-2xl text-ink">
                    {t(`tools.${tool.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-[14px] text-muted leading-relaxed">
                    {t(`tools.${tool.key}.summary`)}
                  </p>
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
  );
}
