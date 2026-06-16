'use client';

import { MessageCircle, RefreshCw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { PageShell } from '@/components/ridy/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useChatRoomsQuery } from '@/hooks/useChatQueries';
import { formatRideTime, formatRoute } from '@/lib/matching-format';
import type { ChatRoomsQuery } from '@/src/graphql/generated/graphql';

const bottomTabs = [
  { id: 'home', label: '홈', icon: 'home' as const },
  { id: 'search', label: '검색', icon: 'search' as const },
  { id: 'chat', label: '채팅', icon: 'chat' as const },
  { id: 'profile', label: '내 정보', icon: 'profile' as const },
];

type ChatRoom = ChatRoomsQuery['chatRooms'][number];

export default function ChatPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const chatRoomsQuery = useChatRoomsQuery();

  const filteredRooms = useMemo(() => {
    const rooms = chatRoomsQuery.data ?? [];
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rooms;
    }

    return rooms.filter((room) => {
      const route = formatRoute(room.ride.departureAddr, room.ride.arrivalAddr).toLowerCase();
      const driverName = room.ride.driver.name.toLowerCase();
      const lastMessage = room.lastMessage?.content.toLowerCase() ?? '';

      return route.includes(normalizedQuery) || driverName.includes(normalizedQuery) || lastMessage.includes(normalizedQuery);
    });
  }, [chatRoomsQuery.data, query]);

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      home: '/',
      search: '/matchings',
      chat: '/chat',
      profile: '/profile',
    };

    router.push(routes[tabId] ?? '/');
  };

  return (
    <AuthGuard>
      <PageShell ariaLabel="채팅 목록" bottomNavOffset className="lg:max-w-4xl">
        <header aria-label="채팅 목록 헤더">
          <p className="text-small font-medium text-gray-500">함께 타는 길</p>
          <h1 className="mt-1 text-h2 text-gray-900">채팅</h1>
        </header>

        <section className="mt-5" aria-label="채팅방 검색 영역">
          <label className="sr-only" htmlFor="chat-room-search">
            채팅방 검색
          </label>
          <div className="flex h-12 items-center gap-2 rounded-button border border-gray-100 bg-white px-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search aria-hidden="true" size={18} className="shrink-0 text-gray-500" />
            <input
              id="chat-room-search"
              aria-label="채팅방 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="상대 이름이나 경로 검색"
              className="h-full min-w-0 flex-1 bg-transparent text-body text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
        </section>

        <section className="mt-5 space-y-gap-tight lg:grid lg:grid-cols-2 lg:gap-gap-normal lg:space-y-0" aria-label="채팅방 목록">
          {chatRoomsQuery.isPending ? <ChatRoomsLoading /> : null}
          {chatRoomsQuery.isError ? (
            <ChatRoomsError onRetry={() => void chatRoomsQuery.refetch()} />
          ) : null}
          {chatRoomsQuery.isSuccess && chatRoomsQuery.data.length === 0 ? <ChatRoomsEmpty /> : null}
          {chatRoomsQuery.isSuccess && chatRoomsQuery.data.length > 0 && filteredRooms.length === 0 ? <ChatRoomsNoSearchResult /> : null}
          {chatRoomsQuery.isSuccess
            ? filteredRooms.map((room) => (
                <ChatRoomCard key={room.id} room={room} onClick={() => router.push(`/chat/${room.id}`)} />
              ))
            : null}
        </section>
      </PageShell>

      <BottomNavigation tabs={bottomTabs} activeTab="chat" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function ChatRoomCard({ room, onClick }: { room: ChatRoom; onClick: () => void }) {
  const route = formatRoute(room.ride.departureAddr, room.ride.arrivalAddr);
  const lastMessage = room.lastMessage?.content ?? '아직 메시지가 없습니다';

  return (
    <button type="button" className="w-full text-left" onClick={onClick}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-h3 text-gray-900">{route}</p>
              <p className="mt-1 text-caption text-gray-500">
                {room.ride.driver.name} · {formatRideTime(room.ride.departureTime)}
              </p>
            </div>
            {room.unreadCount > 0 ? (
              <span className="rounded-full bg-primary px-2 py-1 text-small font-semibold text-white">
                읽지 않은 메시지 {room.unreadCount}개
              </span>
            ) : null}
          </div>
          <p className="mt-3 truncate text-body text-gray-900">{lastMessage}</p>
        </CardContent>
      </Card>
    </button>
  );
}

function ChatRoomsLoading() {
  return (
    <div className="space-y-2" aria-label="채팅방을 불러오는 중">
      <div className="h-28 rounded-card bg-gray-100" />
      <div className="h-28 rounded-card bg-gray-100" />
    </div>
  );
}

function ChatRoomsEmpty() {
  const router = useRouter();

  return (
    <div className="rounded-card border border-dashed border-gray-100 bg-white p-5 text-center">
      <MessageCircle aria-hidden="true" className="mx-auto text-gray-500" size={24} />
      <h2 className="mt-3 text-body font-semibold text-gray-900">아직 채팅방이 없습니다</h2>
      <p className="mt-1 text-caption text-gray-500">매칭이 수락되면 동료와 채팅할 수 있어요.</p>
      <Button type="button" className="mt-4 h-10" onClick={() => router.push('/matchings')}>
        매칭 찾으러 가기
      </Button>
    </div>
  );
}

function ChatRoomsNoSearchResult() {
  return (
    <div className="rounded-card border border-dashed border-gray-100 bg-white p-5 text-center">
      <MessageCircle aria-hidden="true" className="mx-auto text-gray-500" size={24} />
      <h2 className="mt-3 text-body font-semibold text-gray-900">검색 결과가 없습니다</h2>
      <p className="mt-1 text-caption text-gray-500">상대 이름이나 경로를 다시 확인해주세요.</p>
    </div>
  );
}

function ChatRoomsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card border border-danger/20 bg-white p-5 text-center">
      <p className="text-body font-semibold text-gray-900">채팅방을 불러오지 못했습니다.</p>
      <p className="mt-1 text-caption text-gray-500">잠시 후 다시 시도해주세요.</p>
      <Button type="button" variant="outline" className="mt-3 h-9" onClick={onRetry}>
        <RefreshCw aria-hidden="true" size={16} />
        다시 시도
      </Button>
    </div>
  );
}
