'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchChatRooms, fetchMessages } from '@/lib/api/chat-api';
import type { ChatRoomsQueryVariables, MessagesQueryVariables } from '@/src/graphql/generated/graphql';

export function useChatRoomsQuery() {
  const variables: ChatRoomsQueryVariables = {
    pagination: { first: 20, after: null },
  };

  return useQuery({
    queryKey: ['chat', 'rooms', variables],
    queryFn: () => fetchChatRooms(variables),
  });
}

export function useMessagesQuery(roomId: string) {
  const variables: MessagesQueryVariables = {
    roomId,
    pagination: { first: 50, after: null },
  };

  return useQuery({
    queryKey: ['chat', 'messages', variables],
    queryFn: () => fetchMessages(variables),
    enabled: roomId.length > 0,
  });
}
