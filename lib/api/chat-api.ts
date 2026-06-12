import {
  ChatRoomsDocument,
  MessagesDocument,
  type ChatRoomsQuery,
  type ChatRoomsQueryVariables,
  type MessagesQuery,
  type MessagesQueryVariables,
} from '@/src/graphql/generated/graphql';

import { executeGraphql } from '@/lib/api/graphql-client';

export async function fetchChatRooms(
  variables: ChatRoomsQueryVariables,
): Promise<ChatRoomsQuery['chatRooms']> {
  const data = await executeGraphql<ChatRoomsQuery, ChatRoomsQueryVariables>(
    ChatRoomsDocument,
    variables,
  );

  return data.chatRooms;
}

export async function fetchMessages(
  variables: MessagesQueryVariables,
): Promise<NonNullable<MessagesQuery['messages']>> {
  const data = await executeGraphql<MessagesQuery, MessagesQueryVariables>(MessagesDocument, variables);

  if (!data.messages) {
    throw new Error('채팅 메시지 응답이 비어 있습니다.');
  }

  return data.messages;
}
