'use client';

import { MapPin, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MatchingStatus = 'OPEN' | 'MATCHED' | 'PENDING' | 'FAILED' | 'CANCELLED';

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
  className?: string;
}

const statusVariant = {
  OPEN: 'open',
  MATCHED: 'matched',
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
  className,
}: MatchingCardProps) {
  const seatsLabel = availableSeats === 0 ? '만석' : `${availableSeats}석${status ? ' 남음' : ''}`;

  return (
    <Card
      className={cn(
        'rounded-xl border-border-default bg-surface-raised shadow-card transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={`${driverName} 카풀 카드`}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-body font-semibold text-text-primary">{driverName}</span>
          <span className="text-caption text-primary font-medium">{departureTime}</span>
        </div>

        <div className="mt-3 flex min-w-0 items-center gap-2 text-caption text-text-secondary">
          <MapPin aria-hidden="true" size={14} className="shrink-0 text-primary" />
          <span className="truncate font-medium text-text-primary">{departure}</span>
          <span aria-hidden="true">→</span>
          <span className="truncate font-medium text-text-primary">{destination}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-h3 font-bold text-primary">{estimatedFare}</span>
          <div className="flex items-center gap-1 text-caption text-text-secondary">
            <Users aria-hidden="true" size={14} />
            <span>{seatsLabel}</span>
          </div>
        </div>

        {(status || ctaLabel) ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            {status ? <Badge variant={statusVariant[status]}>{status}</Badge> : <span />}
            {ctaLabel ? (
              <Button type="button" size="sm" onClick={(event) => event.stopPropagation()}>
                {ctaLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
