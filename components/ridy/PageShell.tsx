import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageShellProps {
  children: ReactNode;
  ariaLabel?: string;
  bottomNavOffset?: boolean;
  className?: string;
}

export function PageShell({ children, ariaLabel, bottomNavOffset = false, className }: PageShellProps) {
  return (
    <main
      aria-label={ariaLabel}
      className={cn(
        'mx-auto flex min-h-dvh w-full flex-col bg-surface-muted px-page-mobile pt-5 sm:px-page-tablet lg:max-w-6xl lg:px-page-desktop',
        bottomNavOffset ? 'pb-[calc(6rem+env(safe-area-inset-bottom))]' : 'pb-page-desktop',
        className,
      )}
    >
      {children}
    </main>
  );
}
