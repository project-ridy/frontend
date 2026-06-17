import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StateViewState = 'empty' | 'error' | 'offline' | 'loading';

interface StateViewProps {
  state: StateViewState;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const stateStyles: Record<StateViewState, string> = {
  empty: 'bg-surface-secondary border-border-default',
  error: 'bg-surface border-danger-on-muted',
  offline: 'bg-surface-secondary border-border-muted',
  loading: 'bg-surface border-border-default',
};

const buttonVariant: Record<StateViewState, 'default' | 'secondary'> = {
  empty: 'secondary',
  error: 'default',
  offline: 'secondary',
  loading: 'secondary',
};

function StateView({
  state,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: StateViewProps) {
  return (
    <section
      role="status"
      aria-live={state === 'loading' ? 'polite' : 'assertive'}
      className={cn(
        'flex flex-col items-start gap-3 rounded-ridy-lg border p-4 shadow-1',
        stateStyles[state],
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-h3 text-text-primary">{title}</h2>
        <p className="text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      {actionLabel ? (
        <Button type="button" variant={buttonVariant[state]} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}

export { StateView };
export type { StateViewProps, StateViewState };
