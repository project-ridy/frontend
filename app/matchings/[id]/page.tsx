'use client';

import { ArrowLeft, CarFront, MessageSquare, RefreshCw, Send, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
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

  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface-muted px-page-mobile pb-36 pt-5 sm:px-page-tablet lg:max-w-6xl lg:px-page-desktop lg:pb-page-desktop">
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
            <p className="text-small font-medium text-text-tertiary-on-muted">매칭 상세</p>
            <h1 className="text-h2 text-text-primary">
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
            <section className="mt-5 space-y-gap-normal" aria-label="카풀 상세 정보">
              <Card>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-caption text-text-tertiary">경로</p>
                      <p className="mt-1 text-h3 text-text-primary">
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

              <Card>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-caption text-text-tertiary">차주</p>
                      <p className="mt-1 text-h3 text-text-primary">{rideDetailQuery.data.driver.name}</p>
                    </div>
                    <Users aria-hidden="true" size={22} className="text-primary" />
                  </div>
                  <div className="flex gap-2 text-caption text-text-tertiary">
                    <span>평점 {rideDetailQuery.data.driver.rating.toFixed(1)}</span>
                    <span aria-hidden="true">·</span>
                    <span>운행 {rideDetailQuery.data.driver.rideCount}회</span>
                  </div>
                </CardContent>
              </Card>
            </section>

            {requestSent ? (
              <p className="mt-4 rounded-ridy-lg border border-secondary/20 bg-secondary/10 p-4 text-body font-semibold text-secondary">
                탑승 요청을 보냈습니다
              </p>
            ) : null}

            {requestRideMutation.isError ? (
              <p className="mt-4 rounded-ridy-lg border border-orange-100 bg-orange-50/60 p-4 text-body font-semibold text-warning">
                탑승 요청을 보내지 못했습니다.
              </p>
            ) : null}

            <Button
              type="button"
              className="mt-5 h-12 min-h-11 w-full"
              disabled={requestSent}
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
                className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-ridy-lg border border-border-default bg-surface p-4 shadow-4"
              >
                <h2 id="request-ride-title" className="text-h3 text-text-primary">
                  탑승 요청
                </h2>
                <label className="mt-4 block" htmlFor="request-message">
                  <span className="mb-2 block text-caption font-semibold text-text-primary">요청 메시지</span>
                  <textarea
                    id="request-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-ridy-md border border-border-input bg-surface p-3 text-body text-text-primary outline-none transition-colors duration-fast focus:border-primary focus:ring-2 focus:ring-primary/20"
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
      </main>

      <BottomNavigation tabs={bottomTabs} activeTab="search" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-ridy-md bg-surface-secondary p-3">
      <p className="text-caption text-text-tertiary-on-muted">{label}</p>
      <p className="mt-1 text-body font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function DetailLoading() {
  return (
    <div className="mt-5 space-y-3" aria-label="매칭 상세를 불러오는 중">
      <div className="h-40 rounded-ridy-lg bg-surface-secondary" />
      <div className="h-28 rounded-ridy-lg bg-surface-secondary" />
    </div>
  );
}

function DetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-5 rounded-ridy-lg border border-orange-100 bg-orange-50/60 p-5 text-center">
      <p className="text-body font-semibold text-text-primary">카풀 상세를 불러오지 못했습니다.</p>
      <p className="mt-1 text-caption text-text-tertiary">연결이 불안정해요. 잠시 후 다시 확인해주세요.</p>
      <Button type="button" variant="outline" className="mt-3 h-9" onClick={onRetry}>
        <RefreshCw aria-hidden="true" size={16} />
        다시 시도
      </Button>
    </div>
  );
}
