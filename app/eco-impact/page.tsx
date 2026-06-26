'use client';

import { Leaf, RefreshCw, Route, Sprout, Trees } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CarbonBadgesShare } from '@/features/eco-impact/components/CarbonBadgesShare';
import { CarbonMonthlyChart } from '@/features/eco-impact/components/CarbonMonthlyChart';
import { CarbonRideList } from '@/features/eco-impact/components/CarbonRideList';
import { useEcoImpactDashboardQuery } from '@/hooks/useEcoImpactQueries';

const bottomTabs = [
  { id: 'home', label: '홈', icon: 'home' as const },
  { id: 'history', label: '기록', icon: 'history' as const },
  { id: 'chat', label: '채팅', icon: 'chat' as const },
  { id: 'profile', label: '내 정보', icon: 'profile' as const },
];

export default function EcoImpactPage() {
  const router = useRouter();
  const dashboardQuery = useEcoImpactDashboardQuery();
  const impact = dashboardQuery.data?.myCarbonImpact;

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
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gray-50 px-page-mobile pb-36 pt-5 sm:px-page-tablet">
        <header aria-label="친환경 임팩트 화면 헤더">
          <p className="text-small font-medium text-secondary">함께 달린 만큼 지구에 남긴 변화</p>
          <h1 className="mt-1 text-h2 text-gray-900">친환경 임팩트</h1>
        </header>

        {dashboardQuery.isPending ? <EcoImpactLoading /> : null}
        {dashboardQuery.isError ? <EcoImpactError onRetry={() => void dashboardQuery.refetch()} /> : null}
        {impact ? <ImpactSummaryCards impact={impact} /> : null}
        {impact ? <CarbonBadgesShare impact={impact} /> : null}
        {dashboardQuery.data ? <CarbonMonthlyChart monthly={dashboardQuery.data.carbonHistory.monthly} /> : null}
        {dashboardQuery.data ? (
          <CarbonRideList
            rides={dashboardQuery.data.carbonHistory.rides}
            pageInfo={dashboardQuery.data.carbonHistory.pageInfo}
            onLoadMore={() => undefined}
          />
        ) : null}
      </main>

      <BottomNavigation tabs={bottomTabs} activeTab="profile" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function EcoImpactLoading() {
  return (
    <section className="mt-5 grid grid-cols-2 gap-3" aria-label="친환경 임팩트를 불러오는 중">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-28 rounded-card bg-gray-100" />
      ))}
    </section>
  );
}

function EcoImpactError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="mt-5 rounded-card border border-orange-100 bg-orange-50/60 p-5 text-center" aria-label="친환경 임팩트 오류">
      <p className="text-body font-semibold text-gray-900">친환경 임팩트를 불러오지 못했습니다.</p>
      <p className="mt-1 text-caption text-gray-500">연결이 불안정해요. 잠시 후 다시 확인해주세요.</p>
      <Button type="button" className="mt-4" onClick={onRetry}>
        <RefreshCw aria-hidden="true" size={16} />
        다시 시도
      </Button>
    </section>
  );
}

function ImpactSummaryCards({
  impact,
}: {
  impact: NonNullable<ReturnType<typeof useEcoImpactDashboardQuery>['data']>['myCarbonImpact'];
}) {
  const cards = [
    {
      label: '총 CO₂ 절감량',
      value: `${formatNumber(impact.co2SavedKg)}kg`,
      icon: Leaf,
      className: 'bg-secondary text-white',
      iconClassName: 'text-white/80',
      labelClassName: 'text-white/80',
    },
    {
      label: '트리 환산',
      value: `${formatNumber(impact.treeEquivalent)}그루`,
      icon: Trees,
      className: 'bg-white text-gray-900',
      iconClassName: 'text-secondary',
      labelClassName: 'text-gray-500',
    },
    {
      label: '완료 카풀',
      value: `${impact.totalRides.toLocaleString('ko-KR')}회`,
      icon: Sprout,
      className: 'bg-white text-gray-900',
      iconClassName: 'text-secondary',
      labelClassName: 'text-gray-500',
    },
    {
      label: '공유 거리',
      value: `${formatNumber(impact.totalDistanceKm)}km`,
      icon: Route,
      className: 'bg-white text-gray-900',
      iconClassName: 'text-primary',
      labelClassName: 'text-gray-500',
    },
  ];

  return (
    <section className="mt-5 grid grid-cols-2 gap-3" aria-label="친환경 임팩트 요약">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label} className={card.className}>
            <CardContent className="flex min-h-28 flex-col justify-between p-4">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-caption ${card.labelClassName}`}>{card.label}</p>
                <Icon aria-hidden="true" size={20} className={card.iconClassName} />
              </div>
              <p className="mt-4 text-h2">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR', {
    maximumFractionDigits: 2,
  });
}
