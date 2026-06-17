import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import MatchingDetailPage from '@/app/matchings/[id]/page';
import MatchingsPage from '@/app/matchings/page';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';

const push = vi.fn();
let searchParams = new URLSearchParams('departure=강남역&destination=수원역&departureTime=08:30');
let routeParams: Record<string, string> = { id: 'ride-1' };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
  useParams: () => routeParams,
}));

const rides = [
  {
    id: 'ride-1',
    departure: { lat: 37.4979, lng: 127.0276 },
    departureAddr: '강남역',
    arrival: { lat: 37.2636, lng: 127.0286 },
    arrivalAddr: '수원역',
    departureTime: '2026-06-12T08:30:00.000Z',
    availableSeats: 2,
    fare: 5000,
    status: 'OPEN',
    driver: { id: 'driver-1', name: '박준서', rating: 4.8, rideCount: 42 },
    requests: [],
  },
  {
    id: 'ride-2',
    departure: { lat: 37.4979, lng: 127.0276 },
    departureAddr: '강남역',
    arrival: { lat: 37.2636, lng: 127.0286 },
    arrivalAddr: '수원역',
    departureTime: '2026-06-12T08:45:00.000Z',
    availableSeats: 1,
    fare: 4500,
    status: 'OPEN',
    driver: { id: 'driver-2', name: '이민수', rating: 4.5, rideCount: 28 },
    requests: [],
  },
];

const server = setupServer(
  graphql.query('SearchRides', () => {
    return HttpResponse.json({
      data: {
        searchRides: {
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
});
afterAll(() => server.close());

function renderWithAuth(ui: React.ReactNode) {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  render(<TestProviders>{ui}</TestProviders>);
}

describe('매칭 결과 화면', () => {
  it('검색 결과 카드 리스트를 표시한다', async () => {
    renderWithAuth(<MatchingsPage />);

    expect(await screen.findByRole('heading', { name: '매칭 결과' })).toBeInTheDocument();
    expect(screen.getByText('강남역 → 수원역')).toBeInTheDocument();
    expect(screen.getByText('2명의 동료')).toBeInTheDocument();
    expect(screen.getByText('박준서')).toBeInTheDocument();
    expect(screen.getByText('이민수')).toBeInTheDocument();
    expect(screen.getByText('5,000원')).toBeInTheDocument();
    expect(screen.getByText('4,500원')).toBeInTheDocument();
  });

  it('검색 결과가 없으면 빈 상태를 표시한다', async () => {
    server.use(
      graphql.query('SearchRides', () => {
        return HttpResponse.json({
          data: {
            searchRides: {
              totalCount: 0,
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [],
            },
          },
        });
      }),
    );

    renderWithAuth(<MatchingsPage />);

    expect(await screen.findByText('근처 카풀이 없습니다')).toBeInTheDocument();
  });

  it('요금순 정렬이 동작한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MatchingsPage />);

    await screen.findByText('박준서');
    await user.click(screen.getByRole('button', { name: '요금순' }));

    const cards = screen.getAllByTestId('matching-result-card');
    expect(within(cards[0]!).getByText('이민수')).toBeInTheDocument();
    expect(within(cards[1]!).getByText('박준서')).toBeInTheDocument();
  });

  it('평점순과 출발시간순 정렬이 동작한다', async () => {
    const user = userEvent.setup();
    server.use(
      graphql.query('SearchRides', () => {
        return HttpResponse.json({
          data: {
            searchRides: {
              totalCount: rides.length,
              pageInfo: { hasNextPage: false, endCursor: 'ride-1' },
              nodes: [rides[1], rides[0]],
            },
          },
        });
      }),
    );

    renderWithAuth(<MatchingsPage />);

    await screen.findByText('박준서');
    await user.click(screen.getByRole('button', { name: '요금순' }));
    expect(within(screen.getAllByTestId('matching-result-card')[0]!).getByText('이민수')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '평점순' }));
    expect(within(screen.getAllByTestId('matching-result-card')[0]!).getByText('박준서')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '출발시간순' }));
    expect(within(screen.getAllByTestId('matching-result-card')[0]!).getByText('박준서')).toBeInTheDocument();
  });

  it('카드를 누르면 상세 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MatchingsPage />);

    await user.click(await screen.findByRole('button', { name: /박준서/ }));

    expect(push).toHaveBeenCalledWith('/matchings/ride-1');
  });

  it('FE-KT-006: 매칭 결과 카드가 KT badge와 route hierarchy를 유지한다', async () => {
    renderWithAuth(<MatchingsPage />);

    const cards = await screen.findAllByTestId('matching-result-card');
    const firstCard = within(cards[0]!);

    expect(screen.getByRole('main')).toHaveClass('bg-surface-muted');
    expect(firstCard.getByLabelText('박준서 카풀 카드')).toHaveClass('bg-surface');
    expect(firstCard.getByText('OPEN')).toHaveClass('bg-primary-subtle');
    expect(firstCard.getByText('강남역')).toHaveClass('text-text-primary');
    expect(firstCard.getByText('수원역')).toHaveClass('text-text-primary');
    expect(firstCard.getByText('5,000원')).toHaveClass('text-text-primary');
    expect(firstCard.getByText('2석 남음')).toHaveClass('text-text-secondary');
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
