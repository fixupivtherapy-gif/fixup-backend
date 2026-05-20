import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-11 w-full border border-rule bg-paper px-3.5 py-2 font-sans text-[15px] text-ink',
      'placeholder:text-muted-soft',
      'focus-visible:outline-none focus-visible:border-clay focus-visible:ring-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      type === 'number' && 'font-mono tabular-nums',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
