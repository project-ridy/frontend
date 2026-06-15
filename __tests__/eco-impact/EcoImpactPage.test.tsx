import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import EcoImpactPage from '@/app/eco-impact/page';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const dashboardPayload = {
  myCarbonImpact: {
    period: 'all',
    totalRides: 12,
    totalDistanceKm: 128.4,
    co2SavedKg: 26.96,
    treeEquivalent: 1.23,
    level: 'SPROUT',
    badges: [
      {
        id: 'FIRST_SHARE',
        label: '첫 카풀',
        description: '첫 완료 카풀을 달성했어요.',
        achievedAt: '2026-06-01T09:00:00.000Z',
      },
    ],
  },
  carbonHistory: {
    monthly: [
      { period: '2026-05', totalRides: 5, totalDistanceKm: 52.2, co2SavedKg: 10.96 },
      { period: '2026-06', totalRides: 7, totalDistanceKm: 76.2, co2SavedKg: 16.0 },
    ],
    rides: [
      {
        rideId: 'ride-1',
        completedAt: '2026-06-12T08:30:00.000Z',
        departureAddr: '강남역',
        arrivalAddr: '수원역',
        distanceKm: 27.3,
        co2SavedKg: 5.73,
      },
    ],
    pageInfo: {
      hasNextPage: true,
      endCursor: 'ride-1',
    },
  },
};

const server = setupServer(
  graphql.query('EcoImpactDashboard', () => {
    return HttpResponse.json({ data: dashboardPayload });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  push.mockClear();
});
afterAll(() => server.close());

function renderWithAuth(ui: React.ReactNode) {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  return render(<TestProviders>{ui}</TestProviders>);
}

describe('친환경 임팩트 화면', () => {
  it('탄소 절감 요약 카드를 표시한다', async () => {
    renderWithAuth(<EcoImpactPage />);

    expect(await screen.findByRole('heading', { name: '친환경 임팩트' })).toBeInTheDocument();
    expect(await screen.findByText('총 CO₂ 절감량')).toBeInTheDocument();
    expect(screen.getByText('26.96kg')).toBeInTheDocument();
    expect(screen.getByText('트리 환산')).toBeInTheDocument();
    expect(screen.getByText('1.23그루')).toBeInTheDocument();
    expect(screen.getByText('완료 카풀')).toBeInTheDocument();
    expect(screen.getByText('12회')).toBeInTheDocument();
    expect(screen.getAllByText('공유 거리')).toHaveLength(2);
    expect(screen.getByText('128.4km')).toBeInTheDocument();
  });

  it('GraphQL 실패 시 재시도 가능한 에러 상태를 표시한다', async () => {
    const user = userEvent.setup();
    server.use(
      graphql.query('EcoImpactDashboard', () => {
        return HttpResponse.json({ errors: [{ message: 'eco impact failed' }] }, { status: 500 });
      }),
    );

    renderWithAuth(<EcoImpactPage />);

    expect(await screen.findByText('친환경 임팩트를 불러오지 못했습니다.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(await screen.findByText('친환경 임팩트를 불러오지 못했습니다.')).toBeInTheDocument();
  });
});
