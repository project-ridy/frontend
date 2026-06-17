'use client';

import { ArrowLeft, ArrowUpDown, MapPin, RefreshCw, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { MatchingCard } from '@/components/ridy/MatchingCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createDefaultSearchInput, useSearchRidesQuery } from '@/hooks/useMatchingQueries';
import { formatFare, formatRideTime } from '@/lib/matching-format';
import type { SearchRidesQuery } from '@/src/graphql/generated/graphql';

const bottomTabs = [
  { id: 'home', label: '홈', icon: 'home' as const },
  { id: 'search', label: '검색', icon: 'search' as const },
  { id: 'chat', label: '채팅', icon: 'chat' as const },
  { id: 'profile', label: '내 정보', icon: 'profile' as const },
];

const sortOptions = [
  { id: 'departureTime', label: '출발시간순' },
  { id: 'fare', label: '요금순' },
  { id: 'rating', label: '평점순' },
] as const;

type SortOption = (typeof sortOptions)[number]['id'];
type SearchRide = NonNullable<SearchRidesQuery['searchRides']>['nodes'][number];

export default function MatchingsPage() {
  return (
    <Suspense fallback={<MatchingsPageFallback />}>
      <MatchingsPageContent />
    </Suspense>
  );
}

function MatchingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>('departureTime');

  const departure = searchParams.get('departure') ?? '출발지';
  const destination = searchParams.get('destination') ?? '도착지';
  const departureTime = searchParams.get('departureTime');
  const searchInput = useMemo(() => createDefaultSearchInput(departureTime), [departureTime]);
  const searchRidesQuery = useSearchRidesQuery({
    input: searchInput,
    pagination: { first: 20, after: null },
  });

  const sortedRides = useMemo(() => {
    const rides = searchRidesQuery.data?.nodes ?? [];

    return [...rides].sort((first, second) => compareRides(first, second, sortBy));
  }, [searchRidesQuery.data?.nodes, sortBy]);

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
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface-muted px-page-mobile pb-36 pt-5 sm:px-page-tablet lg:max-w-6xl lg:px-page-desktop lg:pb-page-desktop">
        <header className="flex items-center gap-3" aria-label="매칭 결과 헤더">
          <Button type="button" variant="ghost" size="icon" aria-label="뒤로가기" onClick={() => router.push('/')}>
            <ArrowLeft aria-hidden="true" size={20} />
          </Button>
          <div className="min-w-0">
            <h1 className="text-h2 text-gray-900">
              {searchRidesQuery.isPending ? '매칭 검색 중' : '매칭 결과'}
            </h1>
              <p className="mt-1 truncate text-caption text-text-tertiary-on-muted">
              {departure} → {destination}
            </p>
          </div>
        </header>

        <section className="mt-5" aria-label="검색 결과 요약">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-caption text-text-tertiary">같은 회사 동료</p>
                <p className="mt-1 text-h3 text-text-primary">
                  {searchRidesQuery.data?.totalCount ?? 0}명의 동료
                </p>
              </div>
              <Search aria-hidden="true" size={22} className="text-primary" />
            </CardContent>
          </Card>
        </section>

        <section className="mt-5" aria-labelledby="sort-heading">
          <div className="mb-3 flex items-center gap-2">
            <ArrowUpDown aria-hidden="true" size={16} className="text-gray-450" />
            <h2 id="sort-heading" className="text-body font-semibold text-text-primary">
              정렬
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sortOptions.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant={sortBy === option.id ? 'default' : 'outline'}
                className="h-10 px-2 text-caption"
                onClick={() => setSortBy(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </section>

        <section className="mt-5 space-y-gap-tight" aria-label="매칭 목록">
          {searchRidesQuery.isPending ? <MatchingsLoading /> : null}
          {searchRidesQuery.isError ? (
            <MatchingsError onRetry={() => void searchRidesQuery.refetch()} />
          ) : null}
          {searchRidesQuery.isSuccess && sortedRides.length === 0 ? <MatchingsEmpty /> : null}
          {searchRidesQuery.isSuccess
            ? sortedRides.map((ride) => (
                <div key={ride.id} data-testid="matching-result-card" className="space-y-2">
                  <MatchingCard
                    driverName={ride.driver.name}
                    departure={ride.departureAddr ?? '출발지 미정'}
                    destination={ride.arrivalAddr ?? '도착지 미정'}
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

      <BottomNavigation tabs={bottomTabs} activeTab="search" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function MatchingsPageFallback() {
  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface-muted px-page-mobile pb-36 pt-5 sm:px-page-tablet">
        <header className="flex items-center gap-3" aria-label="매칭 결과 헤더">
          <div className="size-8" aria-hidden="true" />
          <div>
            <h1 className="text-h2 text-gray-900">매칭 검색 중</h1>
            <p className="mt-1 text-caption text-gray-500">검색 조건을 확인하고 있습니다</p>
          </div>
        </header>
        <section className="mt-5 space-y-2" aria-label="매칭 결과를 찾고 있습니다">
          <div className="h-28 rounded-card bg-gray-100" />
          <div className="h-28 rounded-card bg-gray-100" />
        </section>
      </main>
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

function compareRides(first: SearchRide, second: SearchRide, sortBy: SortOption): number {
  if (sortBy === 'fare') {
    return (first.fare ?? Number.MAX_SAFE_INTEGER) - (second.fare ?? Number.MAX_SAFE_INTEGER);
  }

  if (sortBy === 'rating') {
    return second.driver.rating - first.driver.rating;
  }

  return getRideTime(first.departureTime) - getRideTime(second.departureTime);
}

function getRideTime(value: unknown): number {
  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return Number.MAX_SAFE_INTEGER;
  }

  return date.getTime();
}
