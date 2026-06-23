'use client';

import { ArrowLeft, MapPin, RefreshCw, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { MatchingCard } from '@/components/ridy/MatchingCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNearbyCommuteOffersQuery } from '@/hooks/useMatchingQueries';
import { formatFare, formatRideTime } from '@/lib/matching-format';

const bottomTabs = [
  { id: 'home', label: '홈', icon: 'home' as const },
  { id: 'history', label: '기록', icon: 'history' as const },
  { id: 'chat', label: '채팅', icon: 'chat' as const },
  { id: 'profile', label: '내 정보', icon: 'profile' as const },
];

export default function MatchingsPage() {
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
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface-muted px-page-mobile pb-36 pt-5 sm:px-page-tablet lg:max-w-6xl lg:px-page-desktop lg:pb-page-desktop">
        <header className="flex items-center gap-3" aria-label="주변 카풀 헤더">
          <Button type="button" variant="ghost" size="icon" aria-label="뒤로가기" onClick={() => router.push('/')}>
            <ArrowLeft aria-hidden="true" size={20} />
          </Button>
          <div className="min-w-0">
            <h1 className="text-h2 text-gray-900">주변 카풀</h1>
            <p className="mt-1 truncate text-caption text-text-tertiary-on-muted">집 근처에서 회사까지 가는 카풀</p>
          </div>
        </header>

        <section className="mt-5" aria-label="주변 카풀 요약">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-caption text-text-tertiary">같은 회사 동료</p>
                <p className="mt-1 text-h3 text-text-primary">
                  {nearbyOffersQuery.data?.totalCount ?? 0}명의 동료
                </p>
              </div>
              <Users aria-hidden="true" size={22} className="text-primary" />
            </CardContent>
          </Card>
        </section>

        <section className="mt-5 space-y-gap-tight" aria-label="매칭 목록">
          {nearbyOffersQuery.isPending ? <MatchingsLoading /> : null}
          {nearbyOffersQuery.isError ? (
            <MatchingsError onRetry={() => void nearbyOffersQuery.refetch()} />
          ) : null}
          {nearbyOffersQuery.isSuccess && nearbyOffersQuery.data.nodes.length === 0 ? <MatchingsEmpty /> : null}
          {nearbyOffersQuery.isSuccess
            ? nearbyOffersQuery.data.nodes.map((ride) => (
                <div key={ride.id} data-testid="matching-result-card" className="space-y-2">
                  <MatchingCard
                    driverName={ride.driver.name}
                    departure={ride.pickupLabel}
                    destination={ride.workplace.name}
                    departureTime={formatRideTime(ride.departureTime)}
                    estimatedFare={formatFare(ride.fare)}
                    availableSeats={ride.availableSeats}
                    status={ride.status}
                    onClick={() => router.push(`/matchings/${ride.id}`)}
                  />
                  <div className="flex items-center gap-2 px-1 text-caption text-text-tertiary-on-muted">
                    <span>평점 {ride.driver.rating.toFixed(1)}</span>
                    <span aria-hidden="true">·</span>
                    <span>운행 {ride.driver.rideCount}회</span>
                  </div>
                </div>
              ))
            : null}
        </section>
      </main>

      <BottomNavigation tabs={bottomTabs} activeTab="home" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function MatchingsLoading() {
  return (
    <div className="space-y-2" aria-label="매칭 결과를 찾고 있습니다">
      <div className="h-28 rounded-card bg-gray-100" />
      <div className="h-28 rounded-card bg-gray-100" />
    </div>
  );
}

function MatchingsEmpty() {
  return (
    <div className="rounded-card border border-dashed border-primary/20 bg-primary-subtle/40 p-5 text-center">
      <MapPin aria-hidden="true" className="mx-auto text-gray-500" size={24} />
      <h2 className="mt-3 text-body font-semibold text-gray-900">근처 카풀이 없습니다</h2>
      <p className="mt-1 text-caption text-gray-500">출발 시간을 조금 바꾸면 더 많은 동료를 찾을 수 있어요.</p>
    </div>
  );
}

function MatchingsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card border border-orange-100 bg-orange-50/60 p-5 text-center">
      <p className="text-body font-semibold text-gray-900">매칭 결과를 불러오지 못했습니다.</p>
      <p className="mt-1 text-caption text-gray-500">연결이 불안정해요. 잠시 후 다시 확인해주세요.</p>
      <Button type="button" variant="outline" className="mt-3 h-9" onClick={onRetry}>
        <RefreshCw aria-hidden="true" size={16} />
        다시 시도
      </Button>
    </div>
  );
}
