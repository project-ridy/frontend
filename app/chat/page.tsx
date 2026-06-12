'use client';

import { MessageCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
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
  const chatRoomsQuery = useChatRoomsQuery();

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      home: '/',
      search: '/matchings',
      chat: '/chat',
      profile: '/my',
    };

    router.push(routes[tabId] ?? '/');
  };

  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gray-50 px-page-mobile pb-24 pt-5 sm:px-page-tablet">
        <header aria-label="채팅 목록 헤더">
          <p className="text-small font-medium text-gray-500">함께 타는 길</p>
          <h1 className="mt-1 text-h2 text-gray-900">채팅</h1>
        </header>

        <section className="mt-5 space-y-gap-tight" aria-label="채팅방 목록">
          {chatRoomsQuery.isPending ? <ChatRoomsLoading /> : null}
          {chatRoomsQuery.isError ? (
            <ChatRoomsError onRetry={() => void chatRoomsQuery.refetch()} />
          ) : null}
          {chatRoomsQuery.isSuccess && chatRoomsQuery.data.length === 0 ? <ChatRoomsEmpty /> : null}
          {chatRoomsQuery.isSuccess
            ? chatRoomsQuery.data.map((room) => (
                <ChatRoomCard key={room.id} room={room} onClick={() => router.push(`/chat/${room.id}`)} />
              ))
            : null}
        </section>
      </main>

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
  return (
    <div className="rounded-card border border-dashed border-gray-100 bg-white p-5 text-center">
      <MessageCircle aria-hidden="true" className="mx-auto text-gray-500" size={24} />
      <h2 className="mt-3 text-body font-semibold text-gray-900">아직 채팅방이 없습니다</h2>
      <p className="mt-1 text-caption text-gray-500">매칭이 수락되면 동료와 채팅할 수 있어요.</p>
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
