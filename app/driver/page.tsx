'use client';

import { ArrowLeft, Bell, CalendarClock, CircleDollarSign, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { MatchingCard } from '@/components/ridy/MatchingCard';
import { PageShell } from '@/components/ridy/PageShell';
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

type DriverRide = NonNullable<MyHomeRidesQuery['myRides']>['nodes'][number];
type MatchingCardStatus = 'OPEN' | 'MATCHED' | 'PENDING' | 'FAILED' | 'CANCELLED';

export default function DriverPage() {
  const router = useRouter();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const myRidesQuery = useMyHomeRidesQuery('OPEN');

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      home: '/',
      search: '/matchings',
      chat: '/chat',
      profile: '/profile',
    };

    router.push(routes[tabId] ?? '/');
  };

  return (
    <AuthGuard>
      <PageShell ariaLabel="차주 홈" bottomNavOffset className="lg:max-w-md lg:px-page-tablet">
        <header className="flex items-center justify-between" aria-label="차주 홈 헤더">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" aria-label="탑승자 홈으로 돌아가기" onClick={() => router.push('/')}>
              <ArrowLeft aria-hidden="true" size={20} />
            </Button>
            <div>
              <p className="text-small font-medium text-gray-500">오늘 운행</p>
              <h1 className="text-h2 text-gray-900">차주 모드</h1>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="요청 알림">
            <Bell aria-hidden="true" size={20} />
          </Button>
        </header>

        <section className="mt-6" aria-labelledby="driver-create-ride-heading">
          <Card>
            <CardContent className="space-y-gap-normal p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-caption font-semibold text-primary">출퇴근 경로 등록</p>
                  <h2 id="driver-create-ride-heading" className="mt-1 text-h3 text-gray-900">
                    운행 등록
                  </h2>
                </div>
                <Badge variant="open">OPEN</Badge>
              </div>

              <RouteInput
                departure={departure}
                destination={destination}
                departureLabel="운행 출발지"
                destinationLabel="운행 도착지"
                onDepartureChange={setDeparture}
                onDestinationChange={setDestination}
              />

              <div className="grid grid-cols-2 gap-3">
                <label className="block" htmlFor="driver-departure-time">
                  <span className="mb-2 flex items-center gap-1 text-caption font-semibold text-gray-900">
                    <CalendarClock aria-hidden="true" size={15} className="text-primary" />
                    시간
                  </span>
                  <input id="driver-departure-time" type="time" defaultValue="08:30" className="h-input w-full rounded-button border border-gray-100 bg-white px-3 text-body text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                <label className="block" htmlFor="driver-seats">
                  <span className="mb-2 flex items-center gap-1 text-caption font-semibold text-gray-900">
                    <Users aria-hidden="true" size={15} className="text-primary" />
                    좌석
                  </span>
                  <input id="driver-seats" aria-label="운행 좌석" defaultValue="2" inputMode="numeric" className="h-input w-full rounded-button border border-gray-100 bg-white px-3 text-body text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
              </div>

              <label className="block" htmlFor="driver-fare">
                <span className="mb-2 flex items-center gap-1 text-caption font-semibold text-gray-900">
                  <CircleDollarSign aria-hidden="true" size={15} className="text-primary" />
                  요금
                </span>
                <input id="driver-fare" aria-label="운행 요금" defaultValue="5000" inputMode="numeric" className="h-input w-full rounded-button border border-gray-100 bg-white px-3 text-body text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </label>

              <Button type="button" className="h-12 w-full">
                운행 등록
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 space-y-gap-normal" aria-labelledby="driver-requests-heading">
          <div>
            <h2 id="driver-requests-heading" className="text-h3 text-gray-900">
              요청 관리
            </h2>
            <p className="mt-1 text-caption text-gray-500">탑승 요청은 상태 badge와 함께 확인합니다.</p>
          </div>
          {myRidesQuery.isPending ? <div className="h-24 rounded-card bg-gray-100" aria-label="차주 운행 불러오는 중" /> : null}
          {myRidesQuery.isError ? <DriverRideError onRetry={() => void myRidesQuery.refetch()} /> : null}
          {myRidesQuery.isSuccess && myRidesQuery.data.nodes.length === 0 ? <DriverRideEmpty /> : null}
          {myRidesQuery.isSuccess ? myRidesQuery.data.nodes.map((ride) => <DriverRideCard key={ride.id} ride={ride} />) : null}
        </section>
      </PageShell>
      <BottomNavigation tabs={bottomTabs} activeTab="home" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function DriverRideCard({ ride }: { ride: DriverRide }) {
  const pendingCount = ride.requests.filter((request) => request.status === 'PENDING').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-card border border-orange-500/20 bg-orange-50 px-4 py-3">
        <span className="text-caption font-semibold text-orange-700">요청 대기 {pendingCount}건</span>
        <Badge variant="pending">PENDING</Badge>
      </div>
      <MatchingCard
        driverName={ride.driver.name}
        departure={ride.departureAddr ?? '출발지 미정'}
        destination={ride.arrivalAddr ?? '도착지 미정'}
        departureTime={formatRideTime(ride.departureTime)}
        estimatedFare={ride.fare === null ? '금액 미정' : `${ride.fare.toLocaleString('ko-KR')}원`}
        availableSeats={ride.availableSeats}
        status={toMatchingCardStatus(ride.status)}
      />
    </div>
  );
}

function toMatchingCardStatus(status: DriverRide['status']): MatchingCardStatus | undefined {
  if (status === 'COMPLETED' || status === 'IN_PROGRESS') {
    return undefined;
  }

  return status;
}

function DriverRideEmpty() {
  return (
    <div className="rounded-card border border-dashed border-gray-100 bg-white p-4 text-center">
      <p className="text-body font-semibold text-gray-900">카풀을 등록해보세요</p>
      <p className="mt-1 text-caption text-gray-500">출퇴근 경로를 등록하면 같은 회사 동료의 요청을 받을 수 있어요.</p>
      <Button type="button" className="mt-4 h-10">운행 등록 폼으로 이동</Button>
    </div>
  );
}

function DriverRideError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card border border-danger/20 bg-white p-4 text-center">
      <p className="text-body font-semibold text-gray-900">차주 운행을 불러오지 못했습니다.</p>
      <Button type="button" variant="outline" className="mt-3 h-9" onClick={onRetry}>다시 시도</Button>
    </div>
  );
}

function formatRideTime(value: DriverRide['departureTime']): string {
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
