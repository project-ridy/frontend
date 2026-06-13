'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createReview, fetchRideReviews, fetchUserReviews } from '@/lib/api/review-api';
import type { CreateReviewMutationVariables, UserReviewsQueryVariables } from '@/src/graphql/generated/graphql';

export function useRideReviewsQuery(rideId: string | null) {
  return useQuery({
    queryKey: ['review', 'rideReviews', rideId],
    queryFn: () => {
      if (!rideId) {
        throw new Error('운행 ID가 없습니다.');
      }

      return fetchRideReviews({ rideId });
    },
    enabled: Boolean(rideId),
  });
}

export function useUserReviewsQuery(userId: string | null) {
  const variables: UserReviewsQueryVariables | null = userId
    ? { userId, pagination: { first: 20, after: null } }
    : null;

  return useQuery({
    queryKey: ['review', 'userReviews', variables],
    queryFn: () => {
      if (!variables) {
        throw new Error('사용자 ID가 없습니다.');
      }

      return fetchUserReviews(variables);
    },
    enabled: variables !== null,
  });
}

export function useCreateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreateReviewMutationVariables) => createReview(variables),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['review', 'rideReviews', variables.input.rideId] }),
        queryClient.invalidateQueries({ queryKey: ['review', 'userReviews'] }),
      ]);
    },
  });
}
