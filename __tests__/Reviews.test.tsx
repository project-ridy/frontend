import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import ReviewPage from '@/app/reviews/[matchingId]/page';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';

const push = vi.fn();
const createReviewMock = vi.fn();
let routeParams: Record<string, string> = { matchingId: 'ride-1' };

vi.mock('next/navigation', () => ({
  useParams: () => routeParams,
  useRouter: () => ({ push }),
}));

const rideReviews = [
  {
    id: 'review-1',
    rating: 5,
    comment: '시간준수, 친절\n약속 시간에 정확히 도착했어요.',
    createdAt: '2026-06-12T10:00:00.000Z',
    fromUser: { id: 'passenger-1', name: '김서연', rating: 4.7, rideCount: 12 },
    toUser: { id: 'driver-1', name: '박준서', rating: 4.8, rideCount: 42 },
    ride: {
      id: 'ride-1',
      departureAddr: '강남역',
      arrivalAddr: '수원역',
      departureTime: '2026-06-12T08:30:00.000Z',
    },
  },
];

const userReviews = [
  {
    id: 'review-2',
    rating: 4,
    comment: '안전운행이 좋았습니다.',
    createdAt: '2026-06-10T10:00:00.000Z',
    fromUser: { id: 'driver-2', name: '이민수', rating: 4.7, rideCount: 28 },
    toUser: { id: 'driver-1', name: '박준서', rating: 4.8, rideCount: 42 },
    ride: {
      id: 'ride-2',
      departureAddr: '판교역',
      arrivalAddr: '광교중앙역',
      departureTime: '2026-06-10T08:20:00.000Z',
    },
  },
];

const server = setupServer(
  graphql.query('RideReviews', () => {
    return HttpResponse.json({ data: { rideReviews } });
  }),
  graphql.query('UserReviews', () => {
    return HttpResponse.json({ data: { userReviews } });
  }),
  graphql.mutation('CreateReview', ({ variables }) => {
    createReviewMock(variables);

    return HttpResponse.json({
      data: {
        createReview: {
          id: 'review-3',
          rating: 5,
          comment: '시간준수, 친절\n좋은 카풀이었습니다.',
          createdAt: '2026-06-12T11:00:00.000Z',
          fromUser: { id: 'passenger-1', name: '김서연', rating: 4.7, rideCount: 12 },
          toUser: { id: 'driver-1', name: '박준서', rating: 4.8, rideCount: 42 },
          ride: rideReviews[0].ride,
        },
      },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  push.mockClear();
  createReviewMock.mockClear();
  routeParams = { matchingId: 'ride-1' };
});
afterAll(() => server.close());

function renderWithAuth(ui: React.ReactNode) {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  return render(<TestProviders>{ui}</TestProviders>);
}

describe('평점/리뷰 화면', () => {
  it('별점과 코멘트를 입력하고 리뷰를 제출한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<ReviewPage />);

    expect(await screen.findByRole('heading', { name: '평점/리뷰' })).toBeInTheDocument();
    expect(screen.getByText('운행 ride-1')).toBeInTheDocument();

    await user.type(screen.getByLabelText('상대방 ID'), 'driver-1');
    await user.click(screen.getByRole('button', { name: '5점' }));
    await user.click(screen.getByRole('button', { name: '시간준수' }));
    await user.click(screen.getByRole('button', { name: '친절' }));
    await user.type(screen.getByLabelText('리뷰 코멘트'), '좋은 카풀이었습니다.');
    await user.click(screen.getByRole('button', { name: '리뷰 제출' }));

    expect(createReviewMock).toHaveBeenCalledWith({
      input: {
        rideId: 'ride-1',
        toUserId: 'driver-1',
        rating: 5,
        comment: '시간준수, 친절\n좋은 카풀이었습니다.',
      },
    });
    expect(await screen.findByText('리뷰가 등록되었습니다.')).toBeInTheDocument();
  });

  it('별점 또는 상대방 ID가 없으면 제출할 수 없다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<ReviewPage />);

    const submitButton = await screen.findByRole('button', { name: '리뷰 제출' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText('상대방 ID'), 'driver-1');
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '4점' }));
    expect(submitButton).toBeEnabled();
  });

  it('빠른 리뷰 태그를 다중 선택하고 해제한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<ReviewPage />);

    const punctualTag = await screen.findByRole('button', { name: '시간준수' });
    const safeTag = screen.getByRole('button', { name: '안전운행' });

    await user.click(punctualTag);
    await user.click(safeTag);

    expect(punctualTag).toHaveAttribute('aria-pressed', 'true');
    expect(safeTag).toHaveAttribute('aria-pressed', 'true');

    await user.click(punctualTag);

    expect(punctualTag).toHaveAttribute('aria-pressed', 'false');
    expect(safeTag).toHaveAttribute('aria-pressed', 'true');
  });

  it('운행 리뷰와 받은 리뷰 목록을 표시한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<ReviewPage />);

    expect(await screen.findByText(/약속 시간에 정확히 도착했어요/)).toBeInTheDocument();

    const rideReviewSection = screen.getByLabelText('운행 리뷰 목록');
    expect(within(rideReviewSection).getByText('김서연 → 박준서')).toBeInTheDocument();
    expect(within(rideReviewSection).getByText('★★★★★')).toBeInTheDocument();

    await user.type(screen.getByLabelText('상대방 ID'), 'driver-1');

    const receivedReviewSection = screen.getByLabelText('받은 리뷰 목록');
    expect(await within(receivedReviewSection).findByText('이민수 → 박준서')).toBeInTheDocument();
    expect(within(receivedReviewSection).getByText('안전운행이 좋았습니다.')).toBeInTheDocument();
  });

  it('리뷰 목록이 없으면 빈 상태를 표시한다', async () => {
    server.use(
      graphql.query('RideReviews', () => HttpResponse.json({ data: { rideReviews: [] } })),
      graphql.query('UserReviews', () => HttpResponse.json({ data: { userReviews: [] } })),
    );

    renderWithAuth(<ReviewPage />);

    expect(await screen.findByText('아직 운행 리뷰가 없습니다')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('상대방 ID'), 'driver-1');
    expect(screen.getByText('아직 받은 리뷰가 없습니다')).toBeInTheDocument();
  });

  it('조회 실패와 제출 실패 상태를 표시한다', async () => {
    server.use(
      graphql.query('RideReviews', () => HttpResponse.json({ errors: [{ message: 'ride reviews failed' }] }, { status: 500 })),
      graphql.mutation('CreateReview', () => HttpResponse.json({ errors: [{ message: 'create failed' }] }, { status: 500 })),
    );

    const user = userEvent.setup();
    renderWithAuth(<ReviewPage />);

    expect(await screen.findByText('운행 리뷰를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('상대방 ID'), 'driver-1');
    await user.click(screen.getByRole('button', { name: '5점' }));
    await user.click(screen.getByRole('button', { name: '리뷰 제출' }));

    expect(await screen.findByText('리뷰 등록에 실패했습니다.')).toBeInTheDocument();
  });
});
