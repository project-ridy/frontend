import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variantClassName: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-sm hover:bg-primary-light active:bg-primary-dark',
  secondary: 'border border-primary bg-white text-primary hover:bg-primary/5',
  ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
};

export function Button({ children, className, type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg px-4 text-body font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:h-10',
        variantClassName[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
