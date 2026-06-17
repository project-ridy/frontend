import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import ChatRoomPage from '@/app/chat/[id]/page';
import ChatPage from '@/app/chat/page';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';

const push = vi.fn();
let routeParams: Record<string, string> = { id: 'room-1' };
const socketMock = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => void>(),
  emit: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
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

const chatRooms = [
  {
    id: 'room-1',
    unreadCount: 2,
    createdAt: '2026-06-12T08:00:00.000Z',
    lastMessage: {
      id: 'message-1',
      roomId: 'room-1',
      type: 'TEXT',
      content: '8시 30분 강남역 2번 출구에서 만나요',
      createdAt: '2026-06-12T08:10:00.000Z',
      sender: { id: 'driver-1', name: '박준서' },
    },
    ride: {
      id: 'ride-1',
      departureAddr: '강남역',
      arrivalAddr: '수원역',
      departureTime: '2026-06-12T08:30:00.000Z',
      driver: { id: 'driver-1', name: '박준서', rating: 4.8, rideCount: 42 },
    },
  },
];

const server = setupServer(
  graphql.query('ChatRooms', () => {
    return HttpResponse.json({
      data: {
        chatRooms,
      },
    });
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
            {
              id: 'message-2',
              roomId: 'room-1',
              type: 'TEXT',
              content: '네 가능합니다',
              createdAt: '2026-06-12T08:06:00.000Z',
              sender: { id: 'user-1', name: '나' },
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: 'message-2' },
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
  routeParams = { id: 'room-1' };
  socketMock.handlers.clear();
  socketMock.emit.mockClear();
  socketMock.disconnect.mockClear();
});
afterAll(() => server.close());

function renderWithAuth(ui: React.ReactNode) {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  return render(<TestProviders>{ui}</TestProviders>);
}

describe('채팅 목록 화면', () => {
  it('채팅방 목록을 최신 메시지와 함께 표시한다', async () => {
    renderWithAuth(<ChatPage />);

    expect(await screen.findByRole('heading', { name: '채팅' })).toBeInTheDocument();
    expect(await screen.findByText('강남역 → 수원역')).toBeInTheDocument();
    expect(screen.getByText(/박준서/)).toBeInTheDocument();
    expect(screen.getByText('8시 30분 강남역 2번 출구에서 만나요')).toBeInTheDocument();
    expect(screen.getByText(/읽지 않은 메시지\s*2개/)).toBeInTheDocument();
  });

  it('채팅방이 없으면 빈 상태를 표시한다', async () => {
    server.use(
      graphql.query('ChatRooms', () => {
        return HttpResponse.json({ data: { chatRooms: [] } });
      }),
    );

    renderWithAuth(<ChatPage />);

    expect(await screen.findByText('아직 채팅방이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('매칭이 수락되면 동료와 채팅할 수 있어요.')).toBeInTheDocument();
  });

  it('채팅방 목록 조회 실패 시 재시도 상태를 표시한다', async () => {
    server.use(
      graphql.query('ChatRooms', () => {
        return HttpResponse.json({ errors: [{ message: 'chat rooms failed' }] }, { status: 500 });
      }),
    );

    renderWithAuth(<ChatPage />);

    expect(await screen.findByText('채팅방을 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('마지막 메시지가 없으면 기본 문구를 표시한다', async () => {
    server.use(
      graphql.query('ChatRooms', () => {
        return HttpResponse.json({
          data: {
            chatRooms: [{ ...chatRooms[0], lastMessage: null, unreadCount: 0 }],
          },
        });
      }),
    );

    renderWithAuth(<ChatPage />);

    expect(await screen.findByText('아직 메시지가 없습니다')).toBeInTheDocument();
  });

  it('FE-KT-007: 채팅 목록이 KT surface와 unread badge hierarchy를 따른다', async () => {
    renderWithAuth(<ChatPage />);

    expect(await screen.findByRole('heading', { name: '채팅' })).toBeInTheDocument();

    expect(screen.getByRole('main')).toHaveClass('bg-surface-muted');
    expect((await screen.findByText('강남역 → 수원역')).closest('div')).toHaveClass('text-text-primary');
    expect(screen.getByText(/박준서/)).toHaveClass('text-text-tertiary');
    expect(screen.getByText(/읽지 않은 메시지\s*2개/)).toHaveClass('bg-primary-subtle');
  });
});

describe('채팅방 화면', () => {
  it('채팅방 메시지 이력을 표시한다', async () => {
    renderWithAuth(<ChatRoomPage />);

    expect(await screen.findByRole('heading', { name: '채팅방' })).toBeInTheDocument();
    expect(await screen.findByText('내일 탑승 가능하신가요?')).toBeInTheDocument();
    expect(screen.getByText('네 가능합니다')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('메시지 입력')).toBeInTheDocument();
  });

  it('메시지가 없으면 빈 대화 안내를 표시한다', async () => {
    server.use(
      graphql.query('Messages', () => {
        return HttpResponse.json({
          data: {
            messages: {
              nodes: [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        });
      }),
    );

    renderWithAuth(<ChatRoomPage />);

    expect(await screen.findByText('아직 메시지가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('첫 인사를 보내 경로를 확인해보세요.')).toBeInTheDocument();
  });

  it('메시지 조회 실패 시 재시도 상태를 표시한다', async () => {
    server.use(
      graphql.query('Messages', () => {
        return HttpResponse.json({ errors: [{ message: 'messages failed' }] }, { status: 500 });
      }),
    );

    renderWithAuth(<ChatRoomPage />);

    expect(await screen.findByText('메시지를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('채팅방 입장과 이탈 이벤트를 보낸다', async () => {
    const { unmount } = renderWithAuth(<ChatRoomPage />);

    await waitFor(() => expect(socketMock.emit).toHaveBeenCalledWith('chat:join', { roomId: 'room-1' }));

    unmount();

    expect(socketMock.emit).toHaveBeenCalledWith('chat:leave', { roomId: 'room-1' });
    expect(socketMock.disconnect).toHaveBeenCalled();
  });

  it('메시지를 입력하고 전송한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<ChatRoomPage />);

    await user.type(await screen.findByPlaceholderText('메시지 입력'), '강남역 2번 출구에 도착했어요');
    await user.click(screen.getByRole('button', { name: '전송' }));

    expect(socketMock.emit).toHaveBeenCalledWith('chat:message', {
      roomId: 'room-1',
      content: '강남역 2번 출구에 도착했어요',
      type: 'TEXT',
    });
    expect(screen.getByPlaceholderText('메시지 입력')).toHaveValue('');
  });

  it('빈 메시지는 전송하지 않는다', async () => {
    renderWithAuth(<ChatRoomPage />);

    await screen.findByPlaceholderText('메시지 입력');

    expect(screen.getByRole('button', { name: '전송' })).toBeDisabled();
    expect(socketMock.emit).not.toHaveBeenCalledWith('chat:message', expect.anything());
  });

  it('1000자를 초과하면 전송하지 않는다', async () => {
    renderWithAuth(<ChatRoomPage />);

    fireEvent.change(await screen.findByPlaceholderText('메시지 입력'), {
      target: { value: '가'.repeat(1001) },
    });

    expect(screen.getByRole('button', { name: '전송' })).toBeDisabled();
    expect(socketMock.emit).not.toHaveBeenCalledWith('chat:message', expect.anything());
  });

  it('소켓 연결 실패 안내를 표시한다', async () => {
    renderWithAuth(<ChatRoomPage />);

    await screen.findByText('내일 탑승 가능하신가요?');
    act(() => {
      socketMock.handlers.get('connect_error')?.(new Error('connect failed'));
    });

    expect(await screen.findByText('실시간 연결이 불안정합니다. 메시지 이력은 계속 볼 수 있어요.')).toBeInTheDocument();
  });

  it('새 메시지를 수신하면 대화에 추가한다', async () => {
    renderWithAuth(<ChatRoomPage />);

    await screen.findByText('내일 탑승 가능하신가요?');
    act(() => {
      socketMock.handlers.get('chat:messageCreated')?.({
        id: 'message-3',
        roomId: 'room-1',
        type: 'TEXT',
        content: '곧 도착합니다',
        createdAt: '2026-06-12T08:07:00.000Z',
        sender: { id: 'driver-1', name: '박준서' },
      });
    });

    expect(await screen.findByText('곧 도착합니다')).toBeInTheDocument();
  });

  it('FE-KT-007: 채팅방이 KT message bubble과 fixed input safe-area를 사용한다', async () => {
    renderWithAuth(<ChatRoomPage />);

    expect(await screen.findByText('내일 탑승 가능하신가요?')).toBeInTheDocument();

    expect(screen.getByRole('main')).toHaveClass('bg-surface-muted');
    expect(screen.getByText('내일 탑승 가능하신가요?').closest('div')).toHaveClass('bg-surface');
    expect(screen.getByText('네 가능합니다').closest('div')).toHaveClass('bg-primary');

    const inputBar = screen.getByRole('form', { name: '메시지 작성' });
    expect(inputBar).toHaveClass('bg-surface-raised');
    expect(inputBar).toHaveClass('supports-[padding:max(0px)]:pb-[max(env(safe-area-inset-bottom),1rem)]');
    expect(screen.getByPlaceholderText('메시지 입력')).toHaveClass('border-border-input');
    expect(screen.getByRole('button', { name: '전송' })).toHaveClass('min-h-11');
  });
});
