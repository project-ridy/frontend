'use client';

import { ArrowRight, Clock3, MapPin, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MatchingStatus = 'OPEN' | 'MATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';

interface MatchingCardProps {
  driverName: string;
  departure: string;
  destination: string;
  departureTime: string;
  estimatedFare: string;
  availableSeats: number;
  status?: MatchingStatus;
  ctaLabel?: string;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

const statusVariant = {
  OPEN: 'open',
  MATCHED: 'matched',
  IN_PROGRESS: 'matched',
  COMPLETED: 'matched',
  PENDING: 'pending',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export function MatchingCard({
  driverName,
  departure,
  destination,
  departureTime,
  estimatedFare,
  availableSeats,
  status,
  ctaLabel,
  onClick,
  compact = false,
  className,
}: MatchingCardProps) {
  const seatsLabel = availableSeats === 0 ? '만석' : `${availableSeats}석${status ? ' 남음' : ''}`;
  const isUnavailable = availableSeats === 0 || status === 'CANCELLED' || status === 'FAILED';
  const unavailableReason = availableSeats === 0 ? '잔여 좌석이 없어 요청할 수 없습니다.' : null;
  const shouldShowCta = Boolean(ctaLabel && !isUnavailable);

  return (
    <Card
      className={cn(
        'rounded-ridy-lg border-border-default bg-surface shadow-1 transition-shadow duration-fast hover:shadow-md',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={`${driverName} 카풀 카드`}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      } : undefined}
    >
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="block truncate text-body font-bold text-text-primary">{driverName}</span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-caption font-medium text-text-tertiary">
              <Clock3 aria-hidden="true" size={13} />
              {departureTime}
            </span>
          </div>
          {status ? <Badge variant={statusVariant[status]}>{status}</Badge> : null}
        </div>

        <div className={compact ? 'mt-2 rounded-ridy-md bg-surface-secondary/70 p-2' : 'mt-4 rounded-ridy-md bg-surface-secondary/70 p-3'}>
          <div className="flex min-w-0 items-center gap-2 text-caption text-text-secondary">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
              <MapPin aria-hidden="true" size={14} />
            </span>
            <span className="truncate font-semibold text-text-primary">{departure}</span>
            <ArrowRight aria-hidden="true" size={14} className="shrink-0 text-text-tertiary" />
            <span className="truncate font-semibold text-text-primary">{destination}</span>
          </div>
        </div>

        <div className={compact ? 'mt-2 flex items-end justify-between gap-3' : 'mt-4 flex items-end justify-between gap-3'}>
          <div>
            <span className="text-caption font-medium text-text-tertiary">예상 정산</span>
            <span className={compact ? 'mt-0.5 block text-body font-extrabold text-text-primary' : 'mt-0.5 block text-h2 font-extrabold text-text-primary'}>{estimatedFare}</span>
          </div>
          <div className="inline-flex items-center gap-1 rounded-pill bg-primary-subtle px-3 py-1.5 text-caption font-semibold text-primary">
            <Users aria-hidden="true" size={14} />
            <span className="text-text-secondary text-primary">{seatsLabel}</span>
          </div>
        </div>

        {(shouldShowCta || unavailableReason) ? (
          <div className={compact ? 'mt-2 flex items-center justify-between gap-3 border-t border-border-subtle pt-2' : 'mt-4 flex items-center justify-between gap-3 border-t border-border-subtle pt-3'}>
            <div className="flex min-w-0 flex-col items-start gap-1">
              {unavailableReason ? (
                <span className="text-caption text-text-secondary">{unavailableReason}</span>
              ) : null}
            </div>
            {shouldShowCta ? (
              <Button
                type="button"
                size="sm"
                className={compact ? 'min-h-9' : 'min-h-11'}
                onClick={(event) => {
                  event.stopPropagation();
                  onClick?.();
                }}
              >
                {ctaLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
