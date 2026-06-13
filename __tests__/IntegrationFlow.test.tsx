import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import ChatRoomPage from '@/app/chat/[id]/page';
import ChatPage from '@/app/chat/page';
import Home from '@/app/page';
import MatchingDetailPage from '@/app/matchings/[id]/page';
import MatchingsPage from '@/app/matchings/page';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';

const push = vi.fn();
let searchParams = new URLSearchParams('departure=강남역&destination=수원역&departureTime=08:30');
let routeParams: Record<string, string> = { id: 'ride-1' };

const socketMock = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => void>(),
  emit: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
  useParams: () => routeParams,
}));

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: (event: string, handler: (...args: unknown[]) => void) => socketMock.handlers.set(event, handler),
    off: (event: string) => socketMock.handlers.delete(event),
    emit: socketMock.emit,
    disconnect: socketMock.disconnect,
  })),
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

const chatRooms = [
  {
    id: 'room-1',
    unreadCount: 1,
    createdAt: '2026-06-12T08:00:00.000Z',
    lastMessage: {
      id: 'message-1',
      roomId: 'room-1',
      type: 'TEXT',
      content: '8시 30분 강남역 2번 출구에서 만나요',
      createdAt: '2026-06-12T08:10:00.000Z',
      sender: { id: 'driver-1', name: '박준서' },
    },
    ride: rides[0],
  },
];

const server = setupServer(
  graphql.query('MyHomeRides', () => {
    return HttpResponse.json({
      data: {
        myRides: {
          totalCount: 1,
          pageInfo: { hasNextPage: false, endCursor: 'ride-1' },
          nodes: [rides[0]],
        },
      },
    });
  }),
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
    return HttpResponse.json({ data: { ride: rides[0] } });
  }),
  graphql.mutation('RequestRide', () => {
    return HttpResponse.json({ data: { requestRide: { id: 'request-1', status: 'PENDING' } } });
  }),
  graphql.query('ChatRooms', () => {
    return HttpResponse.json({ data: { chatRooms } });
  }),
  graphql.query('Messages', () => {
    return HttpResponse.json({
      data: {
        messages: {
          nodes: [
            {
              id: 'message-1',
              roomId: 'room-1',
              type: 'TEXT',
              content: '내일 탑승 가능하신가요?',
              createdAt: '2026-06-12T08:05:00.000Z',
              sender: { id: 'driver-1', name: '박준서' },
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: 'message-1' },
        },
      },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  cleanup();
  push.mockClear();
  searchParams = new URLSearchParams('departure=강남역&destination=수원역&departureTime=08:30');
  routeParams = { id: 'ride-1' };
  socketMock.handlers.clear();
  socketMock.emit.mockClear();
  socketMock.disconnect.mockClear();
});
afterAll(() => server.close());

function renderWithAuth(ui: React.ReactNode) {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  return render(<TestProviders>{ui}</TestProviders>);
}

function renderWithoutAuth(ui: React.ReactNode) {
  return render(<TestProviders>{ui}</TestProviders>);
}

describe('홈/매칭/채팅 통합 흐름', () => {
  it('인증 후 홈 화면에 진입한다', async () => {
    renderWithAuth(<Home />);

    expect(await screen.findByRole('heading', { name: '테크스타터' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '어디로 가세요?' })).toBeInTheDocument();
    expect(await screen.findByText('박준서')).toBeInTheDocument();
  });

  it('홈에서 검색 조건을 입력해 매칭 결과로 이동한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<Home />);

    await screen.findByRole('heading', { name: '테크스타터' });
    await user.type(screen.getByLabelText('출발지'), '강남역');
    await user.type(screen.getByLabelText('도착지'), '수원역');
    await user.clear(screen.getByLabelText('출발 시간'));
    await user.type(screen.getByLabelText('출발 시간'), '09:10');
    await user.click(screen.getByRole('button', { name: /매칭 찾기/ }));

    expect(push).toHaveBeenCalledWith('/matchings?departure=%EA%B0%95%EB%82%A8%EC%97%AD&destination=%EC%88%98%EC%9B%90%EC%97%AD&departureTime=09%3A10');
  });

  it('매칭 결과에서 상세로 이동해 탑승 요청을 보낸다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<MatchingsPage />);

    await user.click(await screen.findByRole('button', { name: /박준서/ }));
    expect(push).toHaveBeenCalledWith('/matchings/ride-1');

    cleanup();
    routeParams = { id: 'ride-1' };
    renderWithAuth(<MatchingDetailPage />);

    await user.click(await screen.findByRole('button', { name: '탑승 요청' }));
    await user.type(screen.getByLabelText('요청 메시지'), '강남역 1번 출구에서 탈게요');
    await user.click(screen.getByRole('button', { name: '요청 보내기' }));

    expect(await screen.findByText('탑승 요청을 보냈습니다')).toBeInTheDocument();
  });

  it('홈 채팅 탭에서 채팅방으로 이동해 메시지를 전송한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<Home />);

    await user.click(await screen.findByLabelText('채팅'));
    expect(push).toHaveBeenCalledWith('/chat');

    cleanup();
    renderWithAuth(<ChatPage />);

    await user.click(await screen.findByRole('button', { name: /강남역 → 수원역/ }));
    expect(push).toHaveBeenCalledWith('/chat/room-1');

    cleanup();
    routeParams = { id: 'room-1' };
    renderWithAuth(<ChatRoomPage />);

    await user.type(await screen.findByPlaceholderText('메시지 입력'), '곧 도착합니다');
    await user.click(screen.getByRole('button', { name: '전송' }));

    expect(socketMock.emit).toHaveBeenCalledWith('chat:message', {
      roomId: 'room-1',
      content: '곧 도착합니다',
      type: 'TEXT',
    });
  });

  it('바텀 내비게이션 4탭 이동 경로를 검증한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<Home />);

    expect(await screen.findByLabelText('홈')).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByLabelText('검색'));
    await user.click(screen.getByLabelText('채팅'));
    await user.click(screen.getByLabelText('내 정보'));

    expect(push).toHaveBeenCalledWith('/matchings');
    expect(push).toHaveBeenCalledWith('/chat');
    expect(push).toHaveBeenCalledWith('/profile');
  });

  it('토큰이 없으면 홈 접근 시 로그인으로 이동한다', async () => {
    renderWithoutAuth(<Home />);

    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    expect(screen.queryByRole('heading', { name: '테크스타터' })).not.toBeInTheDocument();
  });

  it('매칭 검색 실패 시 에러 UI를 표시한다', async () => {
    server.use(
      graphql.query('SearchRides', () => {
        return HttpResponse.json({ errors: [{ message: 'search failed' }] }, { status: 500 });
      }),
    );

    renderWithAuth(<MatchingsPage />);

    expect(await screen.findByText('매칭 결과를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('채팅방 목록 실패 시 에러 UI를 표시한다', async () => {
    server.use(
      graphql.query('ChatRooms', () => {
        return HttpResponse.json({ errors: [{ message: 'chat failed' }] }, { status: 500 });
      }),
    );

    renderWithAuth(<ChatPage />);

    expect(await screen.findByText('채팅방을 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('채팅방이 없으면 빈 상태를 표시한다', async () => {
    server.use(
      graphql.query('ChatRooms', () => {
        return HttpResponse.json({ data: { chatRooms: [] } });
      }),
    );

    renderWithAuth(<ChatPage />);

    expect(await screen.findByText('아직 채팅방이 없습니다')).toBeInTheDocument();
  });
});
