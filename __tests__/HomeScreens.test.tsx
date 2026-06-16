import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import DriverPage from '@/app/driver/page';
import Home from '@/app/page';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const server = setupServer(
  graphql.query('MyHomeRides', () => {
    return HttpResponse.json({
      data: {
        myRides: {
          totalCount: 0,
          pageInfo: { hasNextPage: false, endCursor: null },
          nodes: [],
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
});
afterAll(() => server.close());

function renderAuthenticated(ui: React.ReactNode) {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  render(<TestProviders>{ui}</TestProviders>);
}

describe('FE-SOCAR-UX-003 홈 화면', () => {
  it('탑승자 홈이 검색과 정기 카풀 empty CTA를 표시한다', async () => {
    renderAuthenticated(<Home />);

    expect(await screen.findByRole('heading', { name: '어디로 가세요?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /매칭 찾기/ })).toBeInTheDocument();
    expect(await screen.findByText('첫 카풀을 찾아보세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '조건 입력하고 매칭 찾기' })).toBeInTheDocument();
  });

  it('차주 홈이 운행 등록과 요청 상태 badge를 표시한다', async () => {
    server.use(
      graphql.query('MyHomeRides', () => {
        return HttpResponse.json({
          data: {
            myRides: {
              totalCount: 1,
              pageInfo: { hasNextPage: false, endCursor: 'ride-1' },
              nodes: [
                {
                  id: 'ride-1',
                  departure: { lat: 37.4979, lng: 127.0276 },
                  departureAddr: '강남역',
                  arrival: { lat: 37.2636, lng: 127.0286 },
                  arrivalAddr: '판교역',
                  departureTime: '2026-06-12T08:30:00.000Z',
                  availableSeats: 2,
                  fare: 5000,
                  status: 'OPEN',
                  driver: { id: 'driver-1', name: '나', rating: 4.9, rideCount: 12 },
                  requests: [{ id: 'request-1', status: 'PENDING' }],
                },
              ],
            },
          },
        });
      }),
    );

    renderAuthenticated(<DriverPage />);

    expect(await screen.findByRole('heading', { name: '차주 모드' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '운행 등록' })).toBeInTheDocument();
    expect(screen.getByLabelText('운행 출발지')).toBeInTheDocument();
    expect(screen.getByLabelText('운행 도착지')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '운행 등록' })).toBeInTheDocument();
    expect(await screen.findByText('요청 대기 1건')).toBeInTheDocument();
    expect(screen.getAllByText('OPEN').length).toBeGreaterThan(0);
  });
});
