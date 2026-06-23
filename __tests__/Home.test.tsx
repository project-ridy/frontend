import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import Home from '@/app/page';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';
import type { NearbyCommuteOffersQueryVariables } from '@/src/graphql/generated/graphql';

const push = vi.fn();
let lastNearbyVariables: NearbyCommuteOffersQueryVariables | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const server = setupServer(
  graphql.query('NearbyCommuteOffers', ({ variables }) => {
    lastNearbyVariables = variables as NearbyCommuteOffersQueryVariables;

    return HttpResponse.json({
      data: {
        nearbyCommuteOffers: {
          totalCount: 1,
          pageInfo: {
            hasNextPage: false,
            endCursor: 'ride-1',
          },
          nodes: [
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
  lastNearbyVariables = null;
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

  it('탑승자 홈에 지도 전체 화면과 하단 카풀 카드를 보여준다', async () => {
    renderAuthenticatedHome();

    expect(screen.queryByLabelText('홈 헤더')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: '동네 주변 회사행 카풀 지도' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '동네 주변 회사행 카풀 지도' })).not.toHaveClass('pt-24');
    expect(screen.getByRole('region', { name: '선택 가능한 카풀' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '선택 가능한 카풀' })).toHaveClass('max-h-[24vh]');
    expect(await screen.findByText('박준서')).toBeInTheDocument();
    expect(screen.getByText('강남역 인근')).toBeInTheDocument();
    expect(screen.getByText('테크스타터 본사')).toBeInTheDocument();
    expect(screen.getByText('5,000원')).toBeInTheDocument();
    expect(screen.queryByText('첫 카풀을 찾아보세요')).not.toBeInTheDocument();
  });

  it('내 카풀이 없으면 빈 상태를 보여준다', async () => {
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

    renderAuthenticatedHome();

    expect(await screen.findByText('첫 카풀을 찾아보세요')).toBeInTheDocument();
    expect(screen.queryByText('박준서')).not.toBeInTheDocument();
  });

  it('내 카풀 조회가 실패하면 에러 상태와 재시도 버튼을 보여준다', async () => {
    server.use(
      graphql.query('NearbyCommuteOffers', () => {
        return HttpResponse.json({
          errors: [{ message: '카풀 목록을 불러오지 못했습니다.' }],
        });
      }),
    );

    renderAuthenticatedHome();

    expect(await screen.findByText('카풀 목록을 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('FE-NH-003: 하단 내비게이션은 검색 없이 기록 탭을 표시한다', async () => {
    const user = userEvent.setup();
    renderAuthenticatedHome();

    expect(await screen.findByLabelText('홈')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByLabelText('검색')).not.toBeInTheDocument();
    expect(screen.getByLabelText('기록')).toBeInTheDocument();
    expect(screen.getByLabelText('채팅')).toBeInTheDocument();
    expect(screen.getByLabelText('내 정보')).toBeInTheDocument();

    await user.click(screen.getByLabelText('기록'));

    expect(push).toHaveBeenCalledWith('/payments');
  });

  it('FE-KT-005: 홈 화면과 하단 내비게이션이 KT responsive shell 기준을 따른다', async () => {
    renderAuthenticatedHome();

    expect(await screen.findByRole('region', { name: '동네 주변 회사행 카풀 지도' })).toBeInTheDocument();

    expect(screen.getByRole('main')).toHaveClass('bg-surface-muted');
    expect(screen.getByRole('region', { name: '동네 주변 회사행 카풀 지도' })).toHaveClass('h-screen');
    expect(screen.getByRole('region', { name: '선택 가능한 카풀' })).toHaveClass('fixed');

    const navigation = screen.getByRole('navigation', { name: '하단 내비게이션' });
    expect(navigation).toHaveClass('bg-surface-raised');
    expect(navigation).toHaveClass('shadow-4');
    expect(navigation).toHaveClass('supports-[padding:max(0px)]:pb-[max(env(safe-area-inset-bottom),0.75rem)]');

    expect(screen.getByLabelText('홈')).toHaveClass('min-h-11');
  });

  it('FE-KT-PURE-003: 홈 지도 화면이 gradient strip 없이 KT surface hierarchy를 사용한다', async () => {
    renderAuthenticatedHome();

    const mapSection = await screen.findByRole('region', { name: '동네 주변 회사행 카풀 지도' });

    expect(mapSection.innerHTML).not.toContain('bg-gradient-to-r');
    expect(mapSection.innerHTML).not.toContain('from-primary');
    expect(mapSection.innerHTML).not.toContain('to-secondary');
    expect(mapSection.innerHTML).toContain('bg-surface');
  });

  it('FE-NW-002: Kakao 키가 있으면 동네 주변 회사행 카풀 지도 영역을 보여준다', async () => {
    vi.stubEnv('NEXT_PUBLIC_KAKAO_MAP_APP_KEY', 'test-kakao-key');

    renderAuthenticatedHome();

    expect(await screen.findByRole('region', { name: '동네 주변 회사행 카풀 지도' })).toBeInTheDocument();
    expect(screen.getByText('Kakao 지도')).toBeInTheDocument();
    expect(screen.getByText('테크스타터 출근길')).toBeInTheDocument();
  });

  it('FE-NW-002: 위치 권한이 허용되면 현재 위치 기준 안내를 보여준다', async () => {
    vi.stubEnv('NEXT_PUBLIC_KAKAO_MAP_APP_KEY', 'test-kakao-key');
    const getCurrentPosition = vi.fn((success: PositionCallback) =>
      success({ coords: { latitude: 37.5, longitude: 127, accuracy: 20 } } as GeolocationPosition),
    );
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
    const user = userEvent.setup();

    renderAuthenticatedHome();

    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(screen.getByText('현재 위치를 사용하면 주변 회사행 카풀을 더 정확히 보여줍니다.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '현재 위치 사용' }));

    expect(await screen.findByText('현재 위치 기준으로 주변 카풀을 보여줍니다.')).toBeInTheDocument();
  });

  it('FE-NH-006: 현재 위치 5km 반경 테두리와 제한 조회를 표시한다', async () => {
    vi.stubEnv('NEXT_PUBLIC_KAKAO_MAP_APP_KEY', 'test-kakao-key');
    const getCurrentPosition = vi.fn((success: PositionCallback) =>
      success({ coords: { latitude: 37.5, longitude: 127, accuracy: 20 } } as GeolocationPosition),
    );
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
    const user = userEvent.setup();

    renderAuthenticatedHome();

    expect(await screen.findByText('5km 반경 안의 카풀만 표시합니다.')).toBeInTheDocument();
    await waitFor(() => expect(lastNearbyVariables?.input.radiusKm).toBe(5));

    await user.click(screen.getByRole('button', { name: '현재 위치 사용' }));

    await waitFor(() => {
      expect(lastNearbyVariables?.input).toMatchObject({ lat: 37.5, lng: 127, radiusKm: 5 });
    });
  });

  it('선택 버튼을 누르면 카풀 상세로 이동한다', async () => {
    const user = userEvent.setup();
    renderAuthenticatedHome();

    await user.click(await screen.findByRole('button', { name: '선택' }));

    expect(push).toHaveBeenCalledWith('/matchings/ride-1');
  });
});
