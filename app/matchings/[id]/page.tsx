'use client';

import { ArrowLeft, CarFront, MessageSquare, RefreshCw, Send, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { PageShell } from '@/components/ridy/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRequestRideMutation, useRideDetailQuery } from '@/hooks/useMatchingQueries';
import { formatFare, formatRideTime, formatRoute } from '@/lib/matching-format';

const bottomTabs = [
  { id: 'home', label: '홈', icon: 'home' as const },
  { id: 'search', label: '검색', icon: 'search' as const },
  { id: 'chat', label: '채팅', icon: 'chat' as const },
  { id: 'profile', label: '내 정보', icon: 'profile' as const },
];

export default function MatchingDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const rideId = Array.isArray(params.id) ? params.id[0] : params.id;
  const rideDetailQuery = useRideDetailQuery(rideId);
  const requestRideMutation = useRequestRideMutation();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      home: '/',
      search: '/matchings',
      chat: '/chat',
      profile: '/profile',
    };

    router.push(routes[tabId] ?? '/');
  };

  const handleSubmitRequest = async () => {
    if (!rideDetailQuery.data) {
      return;
    }

    try {
      await requestRideMutation.mutateAsync({
        input: {
          rideId: rideDetailQuery.data.id,
          pickup: null,
          pickupAddr: null,
          message: message.trim() || null,
        },
      });
    } catch {
      return;
    }

    setRequestSent(true);
    setIsRequestOpen(false);
  };

  const ride = rideDetailQuery.data;
  const hasPendingRequest = ride?.requests.some((request) => request.status === 'PENDING') ?? false;
  const isFull = (ride?.availableSeats ?? 1) <= 0;
  const isCancelled = ride?.status === 'CANCELLED';
  const isRequestDisabled = requestSent || hasPendingRequest || isFull || isCancelled;

  return (
    <AuthGuard>
      <PageShell ariaLabel="매칭 상세" bottomNavOffset className="lg:max-w-5xl">
        <header className="flex items-center gap-3" aria-label="매칭 상세 헤더">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="매칭 결과로 돌아가기"
            onClick={() => router.push('/matchings')}
          >
            <ArrowLeft aria-hidden="true" size={20} />
          </Button>
          <div>
            <p className="text-small font-medium text-gray-500">매칭 상세</p>
            <h1 className="text-h2 text-gray-900">
              {rideDetailQuery.data?.driver.name ?? '카풀 정보'}
            </h1>
          </div>
        </header>

        {rideDetailQuery.isPending ? <DetailLoading /> : null}
        {rideDetailQuery.isError ? (
          <DetailError onRetry={() => void rideDetailQuery.refetch()} />
        ) : null}
        {rideDetailQuery.isSuccess ? (
          <>
            <section className="mt-5 space-y-gap-normal lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-gap-normal lg:space-y-0" aria-label="카풀 상세 정보">
              <Card>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-caption text-gray-500">경로</p>
                      <p className="mt-1 text-h3 text-gray-900">
                        {formatRoute(rideDetailQuery.data.departureAddr, rideDetailQuery.data.arrivalAddr)}
                      </p>
                    </div>
                    <CarFront aria-hidden="true" size={24} className="shrink-0 text-primary" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DetailMetric label="출발 시간" value={formatRideTime(rideDetailQuery.data.departureTime)} />
                    <DetailMetric label="예상 요금" value={formatFare(rideDetailQuery.data.fare)} />
                    <DetailMetric label="남은 좌석" value={`${rideDetailQuery.data.availableSeats}석`} />
                    <DetailMetric label="운행 상태" value={rideDetailQuery.data.status} />
                  </div>
                </CardContent>
              </Card>

              <Card role="region" aria-label="차주 신뢰 정보">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-caption text-gray-500">차주</p>
                      <p className="mt-1 text-h3 text-gray-900">{rideDetailQuery.data.driver.name}</p>
                    </div>
                    <Users aria-hidden="true" size={22} className="text-primary" />
                  </div>
                  <div className="flex gap-2 text-caption text-gray-500">
                    <span>평점 {rideDetailQuery.data.driver.rating.toFixed(1)}</span>
                    <span aria-hidden="true">·</span>
                    <span>운행 {rideDetailQuery.data.driver.rideCount}회</span>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-4 space-y-2" aria-label="요청 가능 상태">
              {hasPendingRequest ? (
                <div className="flex items-center justify-between rounded-card border border-orange-500/20 bg-orange-50 p-4">
                  <p className="text-body font-semibold text-orange-700">요청 대기</p>
                  <Badge variant="pending">PENDING</Badge>
                </div>
              ) : null}
              {isCancelled ? (
                <p className="rounded-card border border-danger/20 bg-white p-4 text-body font-semibold text-danger">
                  운행이 취소되었습니다
                </p>
              ) : null}
              {isFull ? (
                <p className="rounded-card border border-gray-100 bg-white p-4 text-body font-semibold text-gray-700">
                  남은 좌석이 없습니다
                </p>
              ) : null}
            </section>

            {requestSent ? (
              <p className="mt-4 rounded-card bg-secondary/10 p-4 text-body font-semibold text-secondary">
                탑승 요청을 보냈습니다
              </p>
            ) : null}

            {requestRideMutation.isError ? (
              <p className="mt-4 rounded-card border border-danger/20 bg-white p-4 text-body font-semibold text-danger">
                탑승 요청을 보내지 못했습니다.
              </p>
            ) : null}

            <Button
              type="button"
              className="mt-5 h-12 w-full"
              disabled={isRequestDisabled}
              onClick={() => setIsRequestOpen(true)}
            >
              <MessageSquare aria-hidden="true" size={18} />
              탑승 요청
            </Button>

            {isRequestOpen ? (
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="request-ride-title"
                className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-card border border-gray-100 bg-white p-4 shadow-lg"
              >
                <h2 id="request-ride-title" className="text-h3 text-gray-900">
                  탑승 요청
                </h2>
                <label className="mt-4 block" htmlFor="request-message">
                  <span className="mb-2 block text-caption font-semibold text-gray-900">요청 메시지</span>
                  <textarea
                    id="request-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-button border border-gray-100 bg-white p-3 text-body text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="출발 위치나 요청 사항을 남겨주세요"
                  />
                </label>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10"
                    onClick={() => setIsRequestOpen(false)}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    className="h-10"
                    disabled={requestRideMutation.isPending}
                    onClick={() => void handleSubmitRequest()}
                  >
                    <Send aria-hidden="true" size={16} />
                    요청 보내기
                  </Button>
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </PageShell>

      <BottomNavigation tabs={bottomTabs} activeTab="search" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-gray-50 p-3">
      <p className="text-caption text-gray-500">{label}</p>
      <p className="mt-1 text-body font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function DetailLoading() {
  return (
    <div className="mt-5 space-y-3" aria-label="매칭 상세를 불러오는 중">
      <div className="h-40 rounded-card bg-gray-100" />
      <div className="h-28 rounded-card bg-gray-100" />
    </div>
  );
}

function DetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-5 rounded-card border border-danger/20 bg-white p-5 text-center">
      <p className="text-body font-semibold text-gray-900">카풀 상세를 불러오지 못했습니다.</p>
      <p className="mt-1 text-caption text-gray-500">잠시 후 다시 시도해주세요.</p>
      <Button type="button" variant="outline" className="mt-3 h-9" onClick={onRetry}>
        <RefreshCw aria-hidden="true" size={16} />
        다시 시도
      </Button>
    </div>
  );
}
