'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-clay text-paper hover:bg-clay-dark border border-clay hover:border-clay-dark',
        secondary:
          'bg-transparent text-ink border border-rule hover:bg-paper hover:border-ink/40',
        ghost:
          'bg-transparent text-ink hover:bg-paper border border-transparent',
        link:
          'bg-transparent text-clay underline decoration-clay/40 underline-offset-4 hover:decoration-clay border border-transparent p-0 h-auto',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs tracking-wide',
        md: 'h-11 px-5',
        lg: 'h-12 px-6 text-[15px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
