import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function Wordmark({
  size = 'md',
  asLink = true,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: 'text-[15px]',
    md: 'text-[17px]',
    lg: 'text-2xl',
  } as const;

  const inner = (
    <span
      className={cn(
        'inline-flex items-baseline gap-1.5 font-display tracking-tight text-ink',
        sizes[size],
        className,
      )}
    >
      <span className="text-ink">JD</span>
      <span className="text-clay">&apos;</span>
      <span className="text-ink">s</span>
      <span
        className={cn(
          'font-sans uppercase tracking-caps text-muted ml-1',
          size === 'lg' ? 'text-[11px]' : 'text-2xs',
        )}
      >
        Property Solutions
      </span>
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link href="/" className="inline-block group">
      {inner}
    </Link>
  );
}
