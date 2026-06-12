import { print } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

import { getAccessToken } from '@/lib/auth/token-storage';

interface GraphqlResponse<TResult> {
  data?: TResult;
  errors?: ReadonlyArray<{ message: string }>;
}

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? '/graphql';

export async function executeGraphql<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const accessToken = getAccessToken();
  const headers: HeadersInit = {
    'content-type': 'application/json',
  };

  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: print(document),
      variables,
    }),
  });

  const payload = (await response.json()) as GraphqlResponse<TResult>;

  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message ?? 'GraphQL 요청에 실패했습니다.');
  }

  if (!payload.data) {
    throw new Error('GraphQL 응답 데이터가 없습니다.');
  }

  return payload.data;
}
