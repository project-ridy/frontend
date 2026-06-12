'use client';

import { ArrowLeft, RefreshCw, Send } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { useMessagesQuery } from '@/hooks/useChatQueries';
import { useChatSocket } from '@/hooks/useChatSocket';
import type { MessagesQuery } from '@/src/graphql/generated/graphql';

type Message = NonNullable<MessagesQuery['messages']>['nodes'][number];
const EMPTY_MESSAGES: readonly Message[] = [];

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;
  const messagesQuery = useMessagesQuery(roomId ?? '');
  const [message, setMessage] = useState('');
  const chatSocket = useChatSocket(roomId ?? '', messagesQuery.data?.nodes ?? EMPTY_MESSAGES);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || trimmedMessage.length > 1000 || !chatSocket.sendMessage) {
      return;
    }

    chatSocket.sendMessage({ content: trimmedMessage, type: 'TEXT' });
    setMessage('');
  };

  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gray-50 px-page-mobile pt-5 sm:px-page-tablet">
        <header className="flex items-center gap-3" aria-label="채팅방 헤더">
          <Button type="button" variant="ghost" size="icon" aria-label="채팅 목록으로 돌아가기" onClick={() => router.push('/chat')}>
            <ArrowLeft aria-hidden="true" size={20} />
          </Button>
          <div>
            <p className="text-small font-medium text-gray-500">실시간 대화</p>
            <h1 className="text-h2 text-gray-900">채팅방</h1>
          </div>
        </header>

        <section className="mt-5 flex-1 space-y-3 pb-24" aria-label="메시지 목록">
          {chatSocket.hasConnectionError ? (
            <p className="rounded-card border border-warning/20 bg-white p-3 text-caption font-semibold text-warning">
              실시간 연결이 불안정합니다. 메시지 이력은 계속 볼 수 있어요.
            </p>
          ) : null}
          {messagesQuery.isPending ? <MessagesLoading /> : null}
          {messagesQuery.isError ? <MessagesError onRetry={() => void messagesQuery.refetch()} /> : null}
          {messagesQuery.isSuccess && messagesQuery.data.nodes.length === 0 ? <MessagesEmpty /> : null}
          {messagesQuery.isSuccess
            ? chatSocket.messages.map((item) => <MessageBubble key={item.id} message={item} />)
            : null}
        </section>

        <form className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-md gap-2 border-t border-gray-100 bg-white p-4" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="chat-message">
            메시지 입력
          </label>
          <input
            id="chat-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="메시지 입력"
            className="h-12 min-w-0 flex-1 rounded-button border border-gray-100 bg-white px-3 text-body text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" className="h-12 px-4" disabled={message.trim().length === 0 || message.trim().length > 1000}>
            <Send aria-hidden="true" size={18} />
            전송
          </Button>
        </form>
      </main>
    </AuthGuard>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isMine = message.sender.name === '나';

  return (
    <article className={isMine ? 'flex justify-end' : 'flex justify-start'}>
      <div className={isMine ? 'max-w-[78%] rounded-card bg-primary p-3 text-white' : 'max-w-[78%] rounded-card bg-white p-3 text-gray-900'}>
        <p className={isMine ? 'text-small font-semibold text-white/80' : 'text-small font-semibold text-gray-500'}>
          {message.sender.name}
        </p>
        <p className="mt-1 text-body">{message.content}</p>
      </div>
    </article>
  );
}

function MessagesLoading() {
  return (
    <div className="space-y-3" aria-label="메시지를 불러오는 중">
      <div className="h-16 w-3/4 rounded-card bg-gray-100" />
      <div className="ml-auto h-12 w-1/2 rounded-card bg-gray-100" />
    </div>
  );
}

function MessagesEmpty() {
  return (
    <div className="rounded-card border border-dashed border-gray-100 bg-white p-5 text-center">
      <p className="text-body font-semibold text-gray-900">아직 메시지가 없습니다</p>
      <p className="mt-1 text-caption text-gray-500">첫 인사를 보내 경로를 확인해보세요.</p>
    </div>
  );
}

function MessagesError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card border border-danger/20 bg-white p-5 text-center">
      <p className="text-body font-semibold text-gray-900">메시지를 불러오지 못했습니다.</p>
      <p className="mt-1 text-caption text-gray-500">잠시 후 다시 시도해주세요.</p>
      <Button type="button" variant="outline" className="mt-3 h-9" onClick={onRetry}>
        <RefreshCw aria-hidden="true" size={16} />
        다시 시도
      </Button>
    </div>
  );
}
