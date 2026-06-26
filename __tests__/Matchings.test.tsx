import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import MatchingDetailPage from '@/app/matchings/[id]/page';
import MatchingsPage from '@/app/matchings/page';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';
import type { NearbyCommuteOffersQueryVariables } from '@/src/graphql/generated/graphql';

const push = vi.fn();
let searchParams = new URLSearchParams('departure=강남역&destination=수원역&departureTime=08:30');
let routeParams: Record<string, string> = { id: 'ride-1' };
let lastNearbyVariables: NearbyCommuteOffersQueryVariables | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
  useParams: () => routeParams,
}));

const rides = [
  {
    id: 'ride-1',
    companyId: 'company-1',
    pickupLabel: '강남역 인근',
    pickupPrivacy: 'APPROXIMATE',
    departure: { lat: 37.4979, lng: 127.0276 },
    departureAddr: '강남역',
    arrival: { lat: 37.2636, lng: 127.0286 },
    arrivalAddr: '수원역',
    workplace: {
      id: 'workplace-1',
      name: '테크스타터 본사',
      lat: 37.2636,
      lng: 127.0286,
      address: '수원시 팔달구',
      isDefault: true,
      createdAt: '2026-06-12T00:00:00.000Z',
      updatedAt: '2026-06-12T00:00:00.000Z',
    },
    departureTime: '2026-06-12T08:30:00.000Z',
    availableSeats: 2,
    fare: 5000,
    status: 'OPEN',
    driver: { id: 'driver-1', name: '박준서', rating: 4.8, rideCount: 42 },
    requests: [],
  },
  {
    id: 'ride-2',
    companyId: 'company-1',
    pickupLabel: '역삼동 인근',
    pickupPrivacy: 'APPROXIMATE',
    departure: { lat: 37.4979, lng: 127.0276 },
    departureAddr: '강남역',
    arrival: { lat: 37.2636, lng: 127.0286 },
    arrivalAddr: '수원역',
    workplace: {
      id: 'workplace-1',
      name: '테크스타터 본사',
      lat: 37.2636,
      lng: 127.0286,
      address: '수원시 팔달구',
      isDefault: true,
      createdAt: '2026-06-12T00:00:00.000Z',
      updatedAt: '2026-06-12T00:00:00.000Z',
    },
    departureTime: '2026-06-12T08:45:00.000Z',
    availableSeats: 1,
    fare: 4500,
    status: 'OPEN',
    driver: { id: 'driver-2', name: '이민수', rating: 4.5, rideCount: 28 },
    requests: [],
  },
];

const server = setupServer(
  graphql.query('NearbyCommuteOffers', ({ variables }) => {
    lastNearbyVariables = variables as NearbyCommuteOffersQueryVariables;

    return HttpResponse.json({
      data: {
        nearbyCommuteOffers: {
          totalCount: rides.length,
          pageInfo: { hasNextPage: false, endCursor: 'ride-2' },
          nodes: rides,
        },
      },
    });
  }),
  graphql.query('RideDetail', () => {
    return HttpResponse.json({
      data: {
        ride: rides[0],
      },
    });
  }),
  graphql.mutation('RequestRide', () => {
    return HttpResponse.json({
      data: {
        requestRide: {
          id: 'request-1',
          status: 'PENDING',
        },
      },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  push.mockClear();
  searchParams = new URLSearchParams('departure=강남역&destination=수원역&departureTime=08:30');
  routeParams = { id: 'ride-1' };
  lastNearbyVariables = null;
});
afterAll(() => server.close());

function renderWithAuth(ui: React.ReactNode) {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  render(<TestProviders>{ui}</TestProviders>);
}

describe('매칭 결과 화면', () => {
  it('FE-NH-004: 검색 UI 없이 홈 주변 카풀 UI를 재사용한다', async () => {
    renderWithAuth(<MatchingsPage />);

    expect(await screen.findByRole('region', { name: '동네 주변 회사행 카풀 지도' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '선택 가능한 카풀' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '하단 내비게이션' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '주변 카풀' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '매칭 결과' })).not.toBeInTheDocument();
    expect(screen.queryByText('강남역 → 수원역')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '요금순' })).not.toBeInTheDocument();
    expect(await screen.findByText('박준서')).toBeInTheDocument();
    expect(screen.getByText('이민수')).toBeInTheDocument();
    expect(screen.getByText('강남역 인근')).toBeInTheDocument();
    expect(screen.getByText('역삼동 인근')).toBeInTheDocument();
    expect(screen.getAllByText('테크스타터 본사')).toHaveLength(2);
    expect(screen.getByText('5,000원')).toBeInTheDocument();
    expect(screen.getByText('4,500원')).toBeInTheDocument();
    expect(lastNearbyVariables?.input.radiusKm).toBe(5);
  });

  it('주변 카풀이 없으면 빈 상태를 표시한다', async () => {
    server.use(
      graphql.query('NearbyCommuteOffers', () => {
        return HttpResponse.json({
          data: {
            nearbyCommuteOffers: {
              totalCount: 0,
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [],
            },
          },
        });
      }),
    );

    renderWithAuth(<MatchingsPage />);

    expect(await screen.findByText('첫 카풀을 찾아보세요')).toBeInTheDocument();
  });

  it('카드를 누르면 상세 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MatchingsPage />);

    await user.click(await screen.findByRole('button', { name: '박준서 카풀 카드' }));

    expect(push).toHaveBeenCalledWith('/matchings/ride-1');
  });

  it('FE-KT-006: 매칭 딥링크가 홈 지도 surface hierarchy를 유지한다', async () => {
    renderWithAuth(<MatchingsPage />);

    expect(screen.getByRole('main')).toHaveClass('bg-surface-muted');
    expect(await screen.findByRole('region', { name: '동네 주변 회사행 카풀 지도' })).toHaveClass('h-screen');
    expect(screen.getByRole('region', { name: '선택 가능한 카풀' })).toHaveClass('fixed');
    expect(await screen.findByLabelText('박준서 카풀 카드')).toHaveClass('bg-surface');
  });
});

describe('매칭 상세 화면', () => {
  it('상세 정보와 탑승 요청 버튼을 표시한다', async () => {
    renderWithAuth(<MatchingDetailPage />);

    expect(await screen.findByRole('heading', { name: '박준서' })).toBeInTheDocument();
    expect(screen.getByText('강남역 → 수원역')).toBeInTheDocument();
    expect(screen.getByText('평점 4.8')).toBeInTheDocument();
    expect(screen.getByText('운행 42회')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '탑승 요청' })).toBeInTheDocument();
  });

  it('메시지를 입력하고 탑승 요청을 보낸다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MatchingDetailPage />);

    await user.click(await screen.findByRole('button', { name: '탑승 요청' }));
    await user.type(screen.getByLabelText('요청 메시지'), '강남역 1번 출구에서 탈게요');
    await user.click(screen.getByRole('button', { name: '요청 보내기' }));

    expect(await screen.findByText('탑승 요청을 보냈습니다')).toBeInTheDocument();
  });

  it('탑승 요청 실패 시 에러 상태를 표시한다', async () => {
    const user = userEvent.setup();
    server.use(
      graphql.mutation('RequestRide', () => {
        return HttpResponse.json({ errors: [{ message: 'request failed' }] }, { status: 500 });
      }),
    );

    renderWithAuth(<MatchingDetailPage />);

    await user.click(await screen.findByRole('button', { name: '탑승 요청' }));
    await user.click(screen.getByRole('button', { name: '요청 보내기' }));

    expect(await screen.findByText('탑승 요청을 보내지 못했습니다.')).toBeInTheDocument();
  });

  it('FE-KT-006: 매칭 상세 화면이 KT surface와 요청 feedback hierarchy를 따른다', async () => {
    renderWithAuth(<MatchingDetailPage />);

    expect(await screen.findByRole('heading', { name: '박준서' })).toBeInTheDocument();

    expect(screen.getByRole('main')).toHaveClass('bg-surface-muted');
    expect(screen.getByText('출발 시간').closest('div')).toHaveClass('rounded-ridy-md');
    expect(screen.getByText('예상 요금').closest('div')).toHaveClass('bg-surface-secondary');
    expect(screen.getByRole('button', { name: '탑승 요청' })).toHaveClass('min-h-11');
  });
});
