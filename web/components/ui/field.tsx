'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Input } from './input';

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, prefix, suffix, error, className, id, ...props }, ref) => {
    const fieldId = id || React.useId();
    return (
      <div className={cn('flex flex-col', className)}>
        <Label htmlFor={fieldId}>{label}</Label>
        <div className="relative">
          {prefix && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">
              {prefix}
            </span>
          )}
          <Input
            ref={ref}
            id={fieldId}
            className={cn(
              prefix && 'pl-7',
              suffix && 'pr-10',
              error && 'border-clay',
            )}
            {...props}
          />
          {suffix && (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">
              {suffix}
            </span>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1.5 text-xs text-muted">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-clay">{error}</p>
        )}
      </div>
    );
  },
);
Field.displayName = 'Field';
