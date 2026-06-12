'use client';

import { Bell, BriefcaseBusiness, CalendarClock, MapPin, Search, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { MatchingCard } from '@/components/ridy/MatchingCard';
import { RouteInput } from '@/components/ridy/RouteInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMyHomeRidesQuery } from '@/hooks/useMatchingQueries';
import type { MyHomeRidesQuery } from '@/src/graphql/generated/graphql';

const bottomTabs = [
  { id: 'home', label: '홈', icon: 'home' as const },
  { id: 'search', label: '검색', icon: 'search' as const },
  { id: 'chat', label: '채팅', icon: 'chat' as const },
  { id: 'profile', label: '내 정보', icon: 'profile' as const },
];

type HomeRide = NonNullable<MyHomeRidesQuery['myRides']>['nodes'][number];

export default function Home() {
  const router = useRouter();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('08:30');
  const myRidesQuery = useMyHomeRidesQuery('OPEN');

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (departure.trim()) params.set('departure', departure.trim());
    if (destination.trim()) params.set('destination', destination.trim());
    if (departureTime) params.set('departureTime', departureTime);

    router.push(`/matchings${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      home: '/',
      search: '/matchings',
      chat: '/chat',
      profile: '/my',
    };

    router.push(routes[tabId] ?? '/');
  };

  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gray-50 px-page-mobile pb-24 pt-5 sm:px-page-tablet">
        <header className="flex items-center justify-between" aria-label="홈 헤더">
          <div>
            <p className="text-small font-medium text-gray-500">Ridy</p>
            <h1 className="text-h2 text-gray-900">테크스타터</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="알림">
              <Bell aria-hidden="true" size={20} />
            </Button>
            <Button variant="ghost" size="icon" aria-label="프로필 바로가기">
              <UserRound aria-hidden="true" size={20} />
            </Button>
          </div>
        </header>

        <section className="mt-6" aria-labelledby="route-search-heading">
          <Card>
            <CardContent className="space-y-gap-normal p-4">
              <div>
                <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/10">
                  같은 회사 동료만
                </Badge>
                <h2 id="route-search-heading" className="mt-3 text-h3 text-gray-900">
                  어디로 가세요?
                </h2>
              </div>

              <RouteInput
                departure={departure}
                destination={destination}
                onDepartureChange={setDeparture}
                onDestinationChange={setDestination}
              />

              <label className="block" htmlFor="departure-time">
                <span className="mb-2 flex items-center gap-2 text-caption font-semibold text-gray-900">
                  <CalendarClock aria-hidden="true" size={16} className="text-primary" />
                  출발 시간
                </span>
                <input
                  id="departure-time"
                  type="time"
                  value={departureTime}
                  onChange={(event) => setDepartureTime(event.target.value)}
                  className="h-input w-full rounded-button border border-gray-100 bg-white px-3 text-body text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <Button type="button" className="h-12 w-full" onClick={handleSearch}>
                <Search aria-hidden="true" size={18} />
                매칭 찾기
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 space-y-gap-normal" aria-labelledby="regular-rides-heading">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="regular-rides-heading" className="text-h3 text-gray-900">
                내 정기 카풀
              </h2>
              <p className="mt-1 text-caption text-gray-500">출근길에 자주 만나는 동료 카풀이에요.</p>
            </div>
            <BriefcaseBusiness aria-hidden="true" size={22} className="text-primary" />
          </div>

          <div className="space-y-gap-tight">
            {myRidesQuery.isPending ? <HomeRideSkeleton /> : null}
            {myRidesQuery.isError ? <HomeRideError onRetry={() => void myRidesQuery.refetch()} /> : null}
            {myRidesQuery.isSuccess && myRidesQuery.data.nodes.length === 0 ? <HomeRideEmpty /> : null}
            {myRidesQuery.isSuccess
              ? myRidesQuery.data.nodes.map((ride) => (
                  <MatchingCard
                    key={ride.id}
                    driverName={ride.driver.name}
                    departure={ride.departureAddr ?? '출발지 미정'}
                    destination={ride.arrivalAddr ?? '도착지 미정'}
                    departureTime={formatRideTime(ride.departureTime)}
                    estimatedFare={formatFare(ride.fare)}
                    availableSeats={ride.availableSeats}
                  />
                ))
              : null}
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
    <div className="rounded-card border border-dashed border-gray-100 bg-white p-4 text-center">
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
    <div className="rounded-card border border-danger/20 bg-white p-4 text-center">
      <p className="text-body font-semibold text-gray-900">카풀 목록을 불러오지 못했습니다.</p>
      <p className="mt-1 text-caption text-gray-500">잠시 후 다시 시도해주세요.</p>
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
