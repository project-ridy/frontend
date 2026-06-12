import {
  MyHomeRidesDocument,
  RequestRideDocument,
  RideDetailDocument,
  SearchRidesDocument,
  type MyHomeRidesQuery,
  type MyHomeRidesQueryVariables,
  type RequestRideMutation,
  type RequestRideMutationVariables,
  type RideDetailQuery,
  type RideDetailQueryVariables,
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

export async function fetchRideDetail(
  variables: RideDetailQueryVariables,
): Promise<NonNullable<RideDetailQuery['ride']>> {
  const data = await executeGraphql<RideDetailQuery, RideDetailQueryVariables>(
    RideDetailDocument,
    variables,
  );

  if (!data.ride) {
    throw new Error('카풀 상세 응답이 비어 있습니다.');
  }

  return data.ride;
}

export async function requestRide(
  variables: RequestRideMutationVariables,
): Promise<NonNullable<RequestRideMutation['requestRide']>> {
  const data = await executeGraphql<RequestRideMutation, RequestRideMutationVariables>(
    RequestRideDocument,
    variables,
  );

  if (!data.requestRide) {
    throw new Error('탑승 요청 응답이 비어 있습니다.');
  }

  return data.requestRide;
}
