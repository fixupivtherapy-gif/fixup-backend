import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="border-b border-rule pb-8 mb-10">
      {backHref && backLabel && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-caps text-muted hover:text-clay mb-5"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.5} />
          {backLabel}
        </Link>
      )}
      {eyebrow && <p className="marker mb-3">— {eyebrow}</p>}
      <h1 className="font-display text-3xl md:text-[2.75rem] leading-tight tracking-tight text-ink">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-2xl text-[15px] text-muted leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
