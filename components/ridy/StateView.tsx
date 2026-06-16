import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StateViewTone = 'empty' | 'error' | 'loading' | 'offline';

interface StateViewProps {
  tone: StateViewTone;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

const toneClasses: Record<StateViewTone, string> = {
  empty: 'border-dashed border-gray-100 bg-white',
  error: 'border-danger/20 bg-white',
  loading: 'border-gray-100 bg-white',
  offline: 'border-warning/20 bg-warning/10',
};

export function StateView({
  tone,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  className,
}: StateViewProps) {
  const role = tone === 'error' ? 'alert' : 'status';

  return (
    <section
      role={role}
      className={cn('rounded-card border p-5 text-center', toneClasses[tone], className)}
    >
      {icon ? <div className="mx-auto mb-3 flex justify-center text-gray-500">{icon}</div> : null}
      <h2 className="text-body font-semibold text-gray-900">{title}</h2>
      {description ? <p className="mt-1 text-caption text-gray-500">{description}</p> : null}
      {actionLabel || secondaryActionLabel ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {actionLabel ? (
            <Button type="button" className="h-9" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
          {secondaryActionLabel ? (
            <Button type="button" variant="outline" className="h-9" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
