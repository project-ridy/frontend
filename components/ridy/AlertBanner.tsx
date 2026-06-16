import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AlertBannerTone = 'info' | 'success' | 'warning' | 'error' | 'offline';

interface AlertBannerProps {
  tone: AlertBannerTone;
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

const toneClasses: Record<AlertBannerTone, string> = {
  info: 'border-primary/20 bg-primary/10 text-primary',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  error: 'border-danger/20 bg-danger/10 text-danger',
  offline: 'border-warning/20 bg-warning/10 text-warning',
};

export function AlertBanner({ tone, title, description, icon, className }: AlertBannerProps) {
  const role = tone === 'error' ? 'alert' : 'status';

  return (
    <aside role={role} className={cn('rounded-card border px-4 py-3', toneClasses[tone], className)}>
      <div className="flex items-start gap-3">
        {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
        <div className="min-w-0">
          <p className="text-caption font-semibold">{title}</p>
          {description ? <p className="mt-1 text-caption text-gray-600">{description}</p> : null}
        </div>
      </div>
    </aside>
  );
}
