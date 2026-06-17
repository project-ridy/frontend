import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

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
          totalCount: 1,
          pageInfo: {
            hasNextPage: false,
            endCursor: 'ride-1',
          },
          nodes: [
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
              driver: {
                id: 'driver-1',
                name: '박준서',
                rating: 4.8,
                rideCount: 42,
              },
              requests: [],
            },
          ],
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

function renderAuthenticatedHome() {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  renderHome();
}

function renderHome() {
  render(
    <TestProviders>
      <Home />
    </TestProviders>,
  );
}

describe('홈 화면', () => {
  it('토큰이 없으면 로그인 화면으로 이동한다', async () => {
    renderHome();

    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    expect(screen.queryByRole('heading', { name: '테크스타터' })).not.toBeInTheDocument();
  });

  it('탑승자 홈의 경로 검색과 정기 카풀을 보여준다', async () => {
    renderAuthenticatedHome();

    expect(await screen.findByRole('heading', { name: '테크스타터' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '어디로 가세요?' })).toBeInTheDocument();
    expect(screen.getByLabelText('출발지')).toBeInTheDocument();
    expect(screen.getByLabelText('도착지')).toBeInTheDocument();
    expect(screen.getByLabelText('출발 시간')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /매칭 찾기/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '내 정기 카풀' })).toBeInTheDocument();
    expect(await screen.findByText('박준서')).toBeInTheDocument();
    expect(screen.getByText('강남역')).toBeInTheDocument();
    expect(screen.getByText('수원역')).toBeInTheDocument();
    expect(screen.getByText('5,000원')).toBeInTheDocument();
    expect(screen.queryByText('첫 카풀을 찾아보세요')).not.toBeInTheDocument();
  });

  it('내 카풀이 없으면 빈 상태를 보여준다', async () => {
    server.use(
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

    renderAuthenticatedHome();

    expect(await screen.findByText('첫 카풀을 찾아보세요')).toBeInTheDocument();
    expect(screen.queryByText('박준서')).not.toBeInTheDocument();
  });

  it('내 카풀 조회가 실패하면 에러 상태와 재시도 버튼을 보여준다', async () => {
    server.use(
      graphql.query('MyHomeRides', () => {
        return HttpResponse.json({
          errors: [{ message: '카풀 목록을 불러오지 못했습니다.' }],
        });
      }),
    );

    renderAuthenticatedHome();

    expect(await screen.findByText('카풀 목록을 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('경로와 시간을 입력하면 매칭 결과로 이동한다', async () => {
    const user = userEvent.setup();
    renderAuthenticatedHome();

    await screen.findByRole('heading', { name: '테크스타터' });
    await user.type(screen.getByLabelText('출발지'), '강남역');
    await user.type(screen.getByLabelText('도착지'), '수원역');
    await user.clear(screen.getByLabelText('출발 시간'));
    await user.type(screen.getByLabelText('출발 시간'), '09:10');
    await user.click(screen.getByRole('button', { name: /매칭 찾기/ }));

    expect(push).toHaveBeenCalledWith('/matchings?departure=%EA%B0%95%EB%82%A8%EC%97%AD&destination=%EC%88%98%EC%9B%90%EC%97%AD&departureTime=09%3A10');
  });

  it('하단 내비게이션을 표시하고 검색 탭을 누르면 매칭 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    renderAuthenticatedHome();

    expect(await screen.findByLabelText('홈')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByLabelText('검색')).toBeInTheDocument();
    expect(screen.getByLabelText('채팅')).toBeInTheDocument();
    expect(screen.getByLabelText('내 정보')).toBeInTheDocument();

    await user.click(screen.getByLabelText('검색'));

    expect(push).toHaveBeenCalledWith('/matchings');
  });

  it('FE-KT-005: 홈 화면과 하단 내비게이션이 KT responsive shell 기준을 따른다', async () => {
    renderAuthenticatedHome();

    expect(await screen.findByRole('heading', { name: '테크스타터' })).toBeInTheDocument();

    const main = screen.getByRole('main');
    expect(main).toHaveClass('bg-surface-muted');
    expect(main).toHaveClass('lg:max-w-6xl');
    expect(main).toHaveClass('lg:px-page-desktop');
    expect(main).toHaveClass('lg:pb-page-desktop');

    const routeSearchSection = screen.getByRole('region', { name: '어디로 가세요?' });
    expect(routeSearchSection).toHaveClass('lg:sticky');
    expect(routeSearchSection).toHaveClass('lg:top-6');

    const regularRidesSection = screen.getByRole('region', { name: '내 정기 카풀' });
    expect(regularRidesSection).toHaveClass('lg:mt-0');

    const navigation = screen.getByRole('navigation', { name: '하단 내비게이션' });
    expect(navigation).toHaveClass('bg-surface-raised');
    expect(navigation).toHaveClass('shadow-4');
    expect(navigation).toHaveClass('supports-[padding:max(0px)]:pb-[max(env(safe-area-inset-bottom),0.75rem)]');

    expect(screen.getByLabelText('홈')).toHaveClass('min-h-11');
  });
});
