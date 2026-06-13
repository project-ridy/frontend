import {
  CreateReviewDocument,
  RideReviewsDocument,
  UserReviewsDocument,
  type CreateReviewMutation,
  type CreateReviewMutationVariables,
  type RideReviewsQuery,
  type RideReviewsQueryVariables,
  type UserReviewsQuery,
  type UserReviewsQueryVariables,
} from '@/src/graphql/generated/graphql';

import { executeGraphql } from '@/lib/api/graphql-client';

export async function fetchRideReviews(
  variables: RideReviewsQueryVariables,
): Promise<RideReviewsQuery['rideReviews']> {
  const data = await executeGraphql<RideReviewsQuery, RideReviewsQueryVariables>(
    RideReviewsDocument,
    variables,
  );

  return data.rideReviews;
}

export async function fetchUserReviews(
  variables: UserReviewsQueryVariables,
): Promise<UserReviewsQuery['userReviews']> {
  const data = await executeGraphql<UserReviewsQuery, UserReviewsQueryVariables>(
    UserReviewsDocument,
    variables,
  );

  return data.userReviews;
}

export async function createReview(
  variables: CreateReviewMutationVariables,
): Promise<NonNullable<CreateReviewMutation['createReview']>> {
  const data = await executeGraphql<CreateReviewMutation, CreateReviewMutationVariables>(
    CreateReviewDocument,
    variables,
  );

  if (!data.createReview) {
    throw new Error('리뷰 생성 응답이 비어 있습니다.');
  }

  return data.createReview;
}
