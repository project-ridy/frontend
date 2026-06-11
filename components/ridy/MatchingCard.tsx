'use client';

import { MapPin, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MatchingCardProps {
  driverName: string;
  departure: string;
  destination: string;
  departureTime: string;
  estimatedFare: string;
  availableSeats: number;
  onClick?: () => void;
  className?: string;
}

export function MatchingCard({
  driverName,
  departure,
  destination,
  departureTime,
  estimatedFare,
  availableSeats,
  onClick,
  className,
}: MatchingCardProps) {
  return (
    <Card
      className={cn('cursor-pointer transition-shadow hover:shadow-md', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-body font-semibold text-gray-900">{driverName}</span>
          <span className="text-caption text-primary font-medium">{departureTime}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-caption text-gray-500">
          <MapPin aria-hidden="true" size={14} className="shrink-0 text-primary" />
          <span className="font-medium text-gray-900">{departure}</span>
          <span aria-hidden="true">→</span>
          <span className="font-medium text-gray-900">{destination}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-h3 font-bold text-primary">{estimatedFare}</span>
          <div className="flex items-center gap-1 text-caption text-gray-500">
            <Users aria-hidden="true" size={14} />
            <span>{availableSeats}석</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
