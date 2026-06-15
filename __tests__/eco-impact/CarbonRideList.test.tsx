import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CarbonRideList } from '@/features/eco-impact/components/CarbonRideList';
import type { EcoImpactDashboardQuery } from '@/src/graphql/generated/graphql';

type RideSaving = EcoImpactDashboardQuery['carbonHistory']['rides'][number];

const rides: ReadonlyArray<RideSaving> = [
  {
    rideId: 'ride-1',
    completedAt: '2026-06-12T08:30:00.000Z',
    departureAddr: '강남역',
    arrivalAddr: '수원역',
    distanceKm: 27.3,
    co2SavedKg: 5.73,
  },
  {
    rideId: 'ride-2',
    completedAt: '2026-06-11T08:20:00.000Z',
    departureAddr: null,
    arrivalAddr: null,
    distanceKm: 12,
    co2SavedKg: 2.52,
  },
];

describe('CarbonRideList', () => {
  it('운행별 절감 내역과 주소 fallback 및 더 보기 상태를 표시한다', () => {
    render(
      <CarbonRideList
        rides={rides}
        pageInfo={{ hasNextPage: true, endCursor: 'ride-2' }}
        onLoadMore={() => undefined}
      />,
    );

    expect(screen.getByRole('heading', { name: '운행별 절감 내역' })).toBeInTheDocument();
    expect(screen.getByText('강남역 → 수원역')).toBeInTheDocument();
    expect(screen.getByText('주소 정보 없음 → 주소 정보 없음')).toBeInTheDocument();
    expect(screen.getByText('27.3km')).toBeInTheDocument();
    expect(screen.getByText('5.73kg CO₂')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '더 보기' })).toBeInTheDocument();
  });

  it('다음 페이지가 없으면 더 보기 버튼을 표시하지 않는다', () => {
    render(
      <CarbonRideList
        rides={rides.slice(0, 1)}
        pageInfo={{ hasNextPage: false, endCursor: 'ride-1' }}
        onLoadMore={() => undefined}
      />,
    );

    expect(screen.queryByRole('button', { name: '더 보기' })).not.toBeInTheDocument();
  });

  it('운행 데이터가 없으면 빈 상태를 표시한다', () => {
    render(
      <CarbonRideList
        rides={[]}
        pageInfo={{ hasNextPage: false, endCursor: null }}
        onLoadMore={() => undefined}
      />,
    );

    expect(screen.getByText('아직 완료한 카풀이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('카풀을 완료하면 운행별 CO₂ 절감 내역이 표시됩니다.')).toBeInTheDocument();
  });
});
