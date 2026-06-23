'use client';

import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { MatchingCard } from '@/components/ridy/MatchingCard';
import { NeighborhoodCommuteMap } from '@/components/ridy/NeighborhoodCommuteMap';
import { Button } from '@/components/ui/button';
import { useNearbyCommuteOffersQuery } from '@/hooks/useMatchingQueries';
import type { NearbyCommuteOffersQuery } from '@/src/graphql/generated/graphql';

const bottomTabs = [
  { id: 'home', label: '홈', icon: 'home' as const },
  { id: 'history', label: '기록', icon: 'history' as const },
  { id: 'chat', label: '채팅', icon: 'chat' as const },
  { id: 'profile', label: '내 정보', icon: 'profile' as const },
];

type HomeRide = NonNullable<NearbyCommuteOffersQuery['nearbyCommuteOffers']>['nodes'][number];

export default function Home() {
  const router = useRouter();
  const nearbyOffersQuery = useNearbyCommuteOffersQuery();

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      home: '/',
      history: '/payments',
      chat: '/chat',
      profile: '/profile',
    };

    router.push(routes[tabId] ?? '/');
  };

  return (
    <AuthGuard>
      <main className="relative min-h-screen overflow-hidden bg-surface-muted">
        <NeighborhoodCommuteMap className="box-border h-screen" />

        <section className="fixed inset-x-0 bottom-24 z-20 mx-auto max-h-[24vh] max-w-6xl overflow-hidden px-4" aria-label="선택 가능한 카풀">
          <div className="rounded-ridy-xl bg-surface/90 p-3 shadow-2 backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-body font-bold text-gray-900">선택 가능한 카풀</h2>
                <p className="text-caption text-gray-500">주변 회사행 카풀</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => router.push('/matchings')}>
                전체 보기
              </Button>
            </div>

            <div className="flex snap-x gap-3 overflow-x-auto pb-1">
            {nearbyOffersQuery.isPending ? <HomeRideSkeleton /> : null}
            {nearbyOffersQuery.isError ? <HomeRideError onRetry={() => void nearbyOffersQuery.refetch()} /> : null}
            {nearbyOffersQuery.isSuccess && nearbyOffersQuery.data.nodes.length === 0 ? <HomeRideEmpty /> : null}
            {nearbyOffersQuery.isSuccess
              ? nearbyOffersQuery.data.nodes.map((ride) => (
                  <MatchingCard
                    key={ride.id}
                    driverName={ride.driver.name}
                    departure={ride.pickupLabel}
                    destination={ride.workplace.name}
                    departureTime={formatRideTime(ride.departureTime)}
                    estimatedFare={formatFare(ride.fare)}
                    availableSeats={ride.availableSeats}
                    ctaLabel="선택"
                    compact
                    className="min-w-72 snap-center"
                    onClick={() => router.push(`/matchings/${ride.id}`)}
                  />
                ))
              : null}
            </div>
          </div>
        </section>
      </main>

      <BottomNavigation tabs={bottomTabs} activeTab="home" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function HomeRideSkeleton() {
  return (
    <div className="space-y-2" aria-label="내 카풀 불러오는 중">
      <div className="h-24 rounded-card bg-gray-100" />
      <div className="h-24 rounded-card bg-gray-100" />
    </div>
  );
}

function HomeRideEmpty() {
  return (
    <div className="rounded-card border border-dashed border-primary/20 bg-primary-subtle/40 p-4 text-center">
      <MapPin aria-hidden="true" className="mx-auto text-gray-500" size={22} />
      <h2 id="empty-home-heading" className="mt-3 text-body font-semibold text-gray-900">
        첫 카풀을 찾아보세요
      </h2>
      <p className="mt-1 text-caption text-gray-500">회사 동료의 출근길과 내 이동 경로를 맞춰볼 수 있어요.</p>
    </div>
  );
}

function HomeRideError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card border border-orange-100 bg-orange-50/60 p-4 text-center">
      <p className="text-body font-semibold text-gray-900">카풀 목록을 불러오지 못했습니다.</p>
      <p className="mt-1 text-caption text-gray-500">연결이 불안정해요. 잠시 후 다시 확인해주세요.</p>
      <Button type="button" variant="outline" className="mt-3 h-9" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}

function formatRideTime(value: HomeRide['departureTime']): string {
  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return '시간 미정';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function formatFare(value: HomeRide['fare']): string {
  if (value === null) {
    return '금액 미정';
  }

  return `${value.toLocaleString('ko-KR')}원`;
}
