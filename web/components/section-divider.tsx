import { cn } from '@/lib/utils';

export function SectionDivider({
  label,
  className,
  align = 'center',
}: {
  label?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}) {
  if (!label) {
    return <div className={cn('h-px w-full bg-rule', className)} />;
  }
  return (
    <div
      className={cn(
        'flex items-center gap-4 text-2xs uppercase tracking-caps text-muted',
        align === 'left' && 'justify-start',
        align === 'right' && 'justify-end',
        className,
      )}
    >
      {(align === 'center' || align === 'right') && (
        <span className="h-px flex-1 bg-rule" />
      )}
      <span>{label}</span>
      {(align === 'center' || align === 'left') && (
        <span className="h-px flex-1 bg-rule" />
      )}
    </div>
  );
}
