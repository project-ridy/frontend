'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchMyHomeRides, searchRides } from '@/lib/api/matching-api';
import type {
  MyHomeRidesQueryVariables,
  RideStatus,
  SearchRidesQueryVariables,
} from '@/src/graphql/generated/graphql';

export function useMyHomeRidesQuery(status: RideStatus | null = 'OPEN') {
  const variables: MyHomeRidesQueryVariables = {
    status,
    pagination: {
      first: 10,
      after: null,
    },
  };

  return useQuery({
    queryKey: ['matching', 'myRides', variables],
    queryFn: () => fetchMyHomeRides(variables),
  });
}

export function useSearchRidesQuery(variables: SearchRidesQueryVariables | null) {
  return useQuery({
    queryKey: ['matching', 'searchRides', variables],
    queryFn: () => {
      if (!variables) {
        throw new Error('검색 조건이 없습니다.');
      }

      return searchRides(variables);
    },
    enabled: variables !== null,
  });
}
