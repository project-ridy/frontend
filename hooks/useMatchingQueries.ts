'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import {
  fetchMyHomeRides,
  fetchNearbyCommuteOffers,
  fetchRideDetail,
  requestRide,
  searchRides,
} from '@/lib/api/matching-api';
import type {
  MyHomeRidesQueryVariables,
  NearbyCommuteOffersQueryVariables,
  RequestRideMutationVariables,
  RideStatus,
  SearchRidesInput,
  SearchRidesQueryVariables,
} from '@/src/graphql/generated/graphql';

export const NEARBY_COMMUTE_RADIUS_KM = 5;
export const DEFAULT_NEARBY_CENTER = { lat: 37.2636, lng: 127.0286 } as const;

export interface NearbyCenter {
  lat: number;
  lng: number;
}

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

export function useNearbyCommuteOffersQuery(center: NearbyCenter = DEFAULT_NEARBY_CENTER) {
  const variables: NearbyCommuteOffersQueryVariables = {
    input: {
      lat: center.lat,
      lng: center.lng,
      radiusKm: NEARBY_COMMUTE_RADIUS_KM,
      workplaceId: null,
      departureTimeFrom: null,
      departureTimeTo: null,
      passengers: 1,
    },
    pagination: {
      first: 10,
      after: null,
    },
  };

  return useQuery({
    queryKey: ['matching', 'nearbyCommuteOffers', variables],
    queryFn: () => fetchNearbyCommuteOffers(variables),
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

export function useRideDetailQuery(id: string) {
  return useQuery({
    queryKey: ['matching', 'ride', id],
    queryFn: () => fetchRideDetail({ id }),
  });
}

export function useRequestRideMutation() {
  return useMutation({
    mutationFn: (variables: RequestRideMutationVariables) => requestRide(variables),
  });
}

export function createDefaultSearchInput(departureTime: string | null): SearchRidesInput {
  return {
    departure: {
      lat: 37.4979,
      lng: 127.0276,
    },
    arrival: {
      lat: 37.2636,
      lng: 127.0286,
    },
    departureTime: searchDepartureTime(departureTime),
    passengers: 1,
    radiusKm: 5,
  };
}

function searchDepartureTime(value: string | null): Date {
  const today = new Date();
  const [hour = '8', minute = '30'] = (value ?? '08:30').split(':');
  today.setHours(Number(hour), Number(minute), 0, 0);
  return today;
}
