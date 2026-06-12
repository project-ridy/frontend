'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { getAccessToken } from '@/lib/auth/token-storage';
import type { MessageType, MessagesQuery } from '@/src/graphql/generated/graphql';

type ChatMessage = NonNullable<MessagesQuery['messages']>['nodes'][number];

interface SendMessageInput {
  content: string;
  type?: MessageType;
}

const CHAT_SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL ?? '/chat';

export function useChatSocket(roomId: string, initialMessages: readonly ChatMessage[]) {
  const [messages, setMessages] = useState<readonly ChatMessage[]>(initialMessages);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [sendMessage, setSendMessage] = useState<((input: SendMessageInput) => void) | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const socket = io(CHAT_SOCKET_URL, {
      auth: { token: getAccessToken() },
    });

    socket.emit('chat:join', { roomId });
    socket.on('connect_error', () => setHasConnectionError(true));
    socket.on('chat:messageCreated', (message: ChatMessage) => {
      if (message.roomId !== roomId) {
        return;
      }

      setMessages((currentMessages) => [...currentMessages, message]);
    });

    setSendMessage(() => (input: SendMessageInput) => {
      socket.emit('chat:message', {
        roomId,
        content: input.content,
        type: input.type ?? 'TEXT',
      });
    });

    return () => {
      socket.emit('chat:leave', { roomId });
      socket.disconnect();
    };
  }, [roomId]);

  return {
    messages,
    hasConnectionError,
    sendMessage,
  };
}
