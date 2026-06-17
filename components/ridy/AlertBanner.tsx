import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AlertSeverity = 'info' | 'warning' | 'danger';

interface AlertBannerProps {
  severity?: AlertSeverity;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const severityStyles: Record<AlertSeverity, string> = {
  info: 'border-primary bg-primary-subtle',
  warning: 'border-orange-700 bg-orange-50',
  danger: 'border-danger-on-muted bg-red-50',
};

const titleStyles: Record<AlertSeverity, string> = {
  info: 'text-primary',
  warning: 'text-orange-700',
  danger: 'text-danger-on-muted',
};

function AlertBanner({
  severity = 'info',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: AlertBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-3 rounded-ridy-lg border p-4 shadow-1 sm:flex-row sm:items-center sm:justify-between',
        severityStyles[severity],
        className,
      )}
    >
      <div className="space-y-1">
        <p className={cn('text-sm font-semibold', titleStyles[severity])}>{title}</p>
        <p className="text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      {actionLabel ? (
        <Button type="button" variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export { AlertBanner };
export type { AlertBannerProps, AlertSeverity };
