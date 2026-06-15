import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CarbonMonthlyChart } from '@/features/eco-impact/components/CarbonMonthlyChart';
import type { EcoImpactDashboardQuery } from '@/src/graphql/generated/graphql';

type MonthlyPoint = EcoImpactDashboardQuery['carbonHistory']['monthly'][number];

const monthly: ReadonlyArray<MonthlyPoint> = [
  { period: '2026-05', totalRides: 5, totalDistanceKm: 52.2, co2SavedKg: 10.96 },
  { period: '2026-06', totalRides: 7, totalDistanceKm: 76.2, co2SavedKg: 16 },
];

describe('CarbonMonthlyChart', () => {
  it('월별 탄소 절감 막대를 표시한다', () => {
    render(<CarbonMonthlyChart monthly={monthly} />);

    expect(screen.getByRole('heading', { name: '월별 절감 추이' })).toBeInTheDocument();
    expect(screen.getByLabelText('2026-05 10.96kg CO₂ 절감')).toBeInTheDocument();
    expect(screen.getByLabelText('2026-06 16kg CO₂ 절감')).toBeInTheDocument();
    expect(screen.getByText('5회')).toBeInTheDocument();
    expect(screen.getByText('7회')).toBeInTheDocument();
  });

  it('월별 데이터가 없으면 첫 카풀을 유도하는 빈 상태를 표시한다', () => {
    render(<CarbonMonthlyChart monthly={[]} />);

    expect(screen.getByText('아직 월별 임팩트가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('첫 카풀을 완료하면 절감 추이가 쌓입니다.')).toBeInTheDocument();
  });
});
