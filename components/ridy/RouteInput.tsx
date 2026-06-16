'use client';

import { ArrowDown, MapPin } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RouteInputProps {
  departure?: string;
  destination?: string;
  departureLabel?: string;
  destinationLabel?: string;
  onDepartureChange?: (value: string) => void;
  onDestinationChange?: (value: string) => void;
  className?: string;
}

export function RouteInput({
  departure,
  destination,
  departureLabel = '출발지',
  destinationLabel = '도착지',
  onDepartureChange,
  onDestinationChange,
  className,
}: RouteInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
        <MapPin
          aria-hidden="true"
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
        />
        <Input
          placeholder="출발지"
          value={departure}
          onChange={(e) => onDepartureChange?.(e.target.value)}
          className="h-input pl-10"
          aria-label={departureLabel}
        />
      </div>

      <div className="flex items-center justify-center" aria-hidden="true">
        <ArrowDown size={16} className="text-text-secondary" />
      </div>

      <div className="relative">
        <MapPin
          aria-hidden="true"
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-danger"
        />
        <Input
          placeholder="도착지"
          value={destination}
          onChange={(e) => onDestinationChange?.(e.target.value)}
          className="h-input pl-10 focus-visible:border-primary"
          aria-label={destinationLabel}
        />
      </div>
    </div>
  );
}
