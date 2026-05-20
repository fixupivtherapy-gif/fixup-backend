import { cn } from '@/lib/utils';

export function ResultRow({
  label,
  value,
  emphasis,
  hint,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 py-3 border-b border-rule last:border-b-0',
        emphasis && 'py-4',
      )}
    >
      <div className="min-w-0">
        <p
          className={cn(
            emphasis
              ? 'font-display text-lg text-ink'
              : 'text-2xs uppercase tracking-caps text-muted',
          )}
        >
          {label}
        </p>
        {hint && <p className="text-xs text-muted-soft mt-0.5">{hint}</p>}
      </div>
      <span
        className={cn(
          'font-mono tabular-nums whitespace-nowrap',
          emphasis ? 'text-2xl md:text-3xl text-clay' : 'text-base text-ink',
        )}
      >
        {value}
      </span>
    </div>
  );
}
