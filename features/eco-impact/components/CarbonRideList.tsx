import { CalendarDays, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { EcoImpactDashboardQuery } from '@/src/graphql/generated/graphql';

type RideSaving = EcoImpactDashboardQuery['carbonHistory']['rides'][number];
type PageInfo = EcoImpactDashboardQuery['carbonHistory']['pageInfo'];

interface CarbonRideListProps {
  rides: ReadonlyArray<RideSaving>;
  pageInfo: PageInfo;
  onLoadMore: () => void;
}

export function CarbonRideList({ rides, pageInfo, onLoadMore }: CarbonRideListProps) {
  return (
    <section className="mt-5" aria-labelledby="carbon-ride-list-heading">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-caption text-gray-500">완료한 카풀 기준</p>
          <h2 id="carbon-ride-list-heading" className="text-body font-semibold text-gray-900">
            운행별 절감 내역
          </h2>
        </div>
        <MapPin aria-hidden="true" size={18} className="text-secondary" />
      </div>

      {rides.length === 0 ? (
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-body font-semibold text-gray-900">아직 완료한 카풀이 없습니다</p>
            <p className="mt-1 text-caption text-gray-500">
              카풀을 완료하면 운행별 CO₂ 절감 내역이 표시됩니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-gap-tight">
          {rides.map((ride) => (
            <Card key={ride.rideId}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-h3 text-gray-900">{formatRideRoute(ride)}</p>
                    <p className="mt-1 flex items-center gap-1 text-caption text-gray-500">
                      <CalendarDays aria-hidden="true" size={14} />
                      {formatRideDate(ride.completedAt)}
                    </p>
                  </div>
                  <p className="shrink-0 rounded-full bg-secondary/10 px-3 py-1 text-caption font-semibold text-secondary">
                    {formatCarbon(ride.co2SavedKg)} CO₂
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-caption text-gray-700">
                  <span>공유 거리</span>
                  <span className="font-semibold">{formatDistance(ride.distanceKm)}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {pageInfo.hasNextPage ? (
            <Button type="button" variant="outline" className="w-full" onClick={onLoadMore}>
              더 보기
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function formatRideRoute(ride: RideSaving): string {
  return `${ride.departureAddr ?? '주소 정보 없음'} → ${ride.arrivalAddr ?? '주소 정보 없음'}`;
}

function formatDistance(value: number): string {
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}km`;
}

function formatCarbon(value: number): string {
  return `${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}kg`;
}

function formatRideDate(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return '완료일 정보 없음';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
