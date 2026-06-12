import {
  MyHomeRidesDocument,
  SearchRidesDocument,
  type MyHomeRidesQuery,
  type MyHomeRidesQueryVariables,
  type SearchRidesQuery,
  type SearchRidesQueryVariables,
} from '@/src/graphql/generated/graphql';

import { executeGraphql } from '@/lib/api/graphql-client';

export async function fetchMyHomeRides(
  variables: MyHomeRidesQueryVariables,
): Promise<NonNullable<MyHomeRidesQuery['myRides']>> {
  const data = await executeGraphql<MyHomeRidesQuery, MyHomeRidesQueryVariables>(
    MyHomeRidesDocument,
    variables,
  );

  if (!data.myRides) {
    throw new Error('카풀 목록 응답이 비어 있습니다.');
  }

  return data.myRides;
}

export async function searchRides(
  variables: SearchRidesQueryVariables,
): Promise<NonNullable<SearchRidesQuery['searchRides']>> {
  const data = await executeGraphql<SearchRidesQuery, SearchRidesQueryVariables>(
    SearchRidesDocument,
    variables,
  );

  if (!data.searchRides) {
    throw new Error('매칭 검색 응답이 비어 있습니다.');
  }

  return data.searchRides;
}
