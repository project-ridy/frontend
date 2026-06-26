'use client';

import { MessageSquareText, RefreshCw, Star } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { type FormEvent, useMemo, useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateReviewMutation, useRideReviewsQuery, useUserReviewsQuery } from '@/hooks/useReviewQueries';
import { formatRideTime, formatRoute } from '@/lib/matching-format';
import { buildReviewComment, formatReviewDate, formatStars } from '@/lib/review-format';
import type { RideReviewsQuery } from '@/src/graphql/generated/graphql';

const bottomTabs = [
  { id: 'home', label: '홈', icon: 'home' as const },
  { id: 'history', label: '기록', icon: 'history' as const },
  { id: 'chat', label: '채팅', icon: 'chat' as const },
  { id: 'profile', label: '내 정보', icon: 'profile' as const },
];

const quickTags = ['시간준수', '친절', '안전운행', '쾌적한 차량', '경로 배려'] as const;
const maxCommentLength = 200;

type Review = RideReviewsQuery['rideReviews'][number];

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const rideId = getRouteParam(params.matchingId);
  const [targetUserId, setTargetUserId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const rideReviewsQuery = useRideReviewsQuery(rideId);
  const userReviewsQuery = useUserReviewsQuery(targetUserId || null);
  const createReviewMutation = useCreateReviewMutation();

  const combinedComment = useMemo(
    () => buildReviewComment(selectedTags, comment),
    [comment, selectedTags],
  );

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      home: '/',
      history: '/payments',
      chat: '/chat',
      profile: '/profile',
    };

    router.push(routes[tabId] ?? '/');
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rideId || !targetUserId || rating === 0) {
      return;
    }

    setSuccessMessage(null);
    try {
      await createReviewMutation.mutateAsync({
        input: {
          rideId,
          toUserId: targetUserId,
          rating,
          comment: combinedComment,
        },
      });
      setSuccessMessage('리뷰가 등록되었습니다.');
      setRating(0);
      setComment('');
      setSelectedTags([]);
    } catch {
      // Mutation state renders the failure message below.
    }
  };

  if (!rideId) {
    return (
      <AuthGuard>
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface-muted px-page-mobile pb-36 pt-5 sm:px-page-tablet lg:max-w-6xl lg:px-page-desktop lg:pb-page-desktop">
          <h1 className="text-h2 text-text-primary">평점/리뷰</h1>
          <p className="mt-3 rounded-ridy-lg bg-surface p-5 text-body text-text-secondary">잘못된 운행 ID입니다.</p>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface-muted px-page-mobile pb-36 pt-5 sm:px-page-tablet lg:max-w-6xl lg:px-page-desktop lg:pb-page-desktop">
        <header aria-label="평점 리뷰 헤더">
          <p className="text-small font-medium text-text-tertiary-on-muted">함께 탄 경험을 남겨주세요</p>
          <h1 className="mt-1 text-h2 text-text-primary">평점/리뷰</h1>
        </header>

        <section className="mt-5" aria-label="리뷰 작성 안내">
          <Card className="bg-primary text-text-inverse">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-caption text-white/80">운행 {rideId}</p>
                <p className="mt-1 text-h3">완료된 운행 참여자에게만 리뷰를 남길 수 있어요.</p>
              </div>
              <Star aria-hidden="true" size={28} className="text-white/80" />
            </CardContent>
          </Card>
        </section>

        <section className="mt-5" aria-labelledby="review-form-heading">
          <Card>
            <CardContent className="p-4">
              <h2 id="review-form-heading" className="text-h3 text-text-primary">
                리뷰 작성
              </h2>
              <form className="mt-4 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <div>
                  <label htmlFor="target-user-id" className="text-caption font-semibold text-text-secondary">
                    상대방 ID
                  </label>
                  <Input
                    id="target-user-id"
                    value={targetUserId}
                    onChange={(event) => setTargetUserId(event.target.value)}
                    placeholder="driver-1"
                    className="mt-1"
                  />
                </div>

                <div>
                  <p className="text-caption font-semibold text-text-secondary">별점</p>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <Button
                        key={score}
                        type="button"
                        variant={rating === score ? 'default' : 'outline'}
                        className="min-h-11 px-2 text-caption"
                        onClick={() => setRating(score)}
                      >
                        {score}점
                      </Button>
                    ))}
                  </div>
                  <p className="mt-2 text-caption text-warning">{formatStars(rating)}</p>
                </div>

                <div>
                  <p className="text-caption font-semibold text-text-secondary">빠른 리뷰 태그</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);

                      return (
                        <Button
                          key={tag}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          className="min-h-11 text-caption"
                          aria-pressed={isSelected}
                          onClick={() => handleToggleTag(tag)}
                        >
                          {tag}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="review-comment" className="text-caption font-semibold text-text-secondary">
                    리뷰 코멘트
                  </label>
                  <textarea
                    id="review-comment"
                    value={comment}
                    maxLength={maxCommentLength}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="좋았던 점을 알려주세요"
                    className="mt-1 min-h-24 w-full rounded-ridy-md border border-border-input bg-surface px-3 py-2 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/30"
                  />
                  <p className="mt-1 text-right text-small text-text-tertiary">
                    {comment.length}/{maxCommentLength}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="min-h-11 w-full"
                  disabled={!targetUserId || rating === 0 || createReviewMutation.isPending}
                >
                  리뷰 제출
                </Button>
              </form>
              {successMessage ? <p className="mt-3 text-caption font-semibold text-success">{successMessage}</p> : null}
              {createReviewMutation.isError ? (
                <p className="mt-3 text-caption font-semibold text-danger">리뷰 등록에 실패했습니다.</p>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <ReviewListSection
          title="운행 리뷰"
          ariaLabel="운행 리뷰 목록"
          reviews={rideReviewsQuery.data ?? []}
          isLoading={rideReviewsQuery.isPending}
          isError={rideReviewsQuery.isError}
          emptyText="아직 운행 리뷰가 없습니다"
          errorText="운행 리뷰를 불러오지 못했습니다."
          onRetry={() => void rideReviewsQuery.refetch()}
        />

        <ReviewListSection
          title="받은 리뷰"
          ariaLabel="받은 리뷰 목록"
          reviews={userReviewsQuery.data ?? []}
          isLoading={Boolean(targetUserId) && userReviewsQuery.isPending}
          isError={userReviewsQuery.isError}
          emptyText={targetUserId ? '아직 받은 리뷰가 없습니다' : '상대방 ID를 입력하면 받은 리뷰를 확인할 수 있습니다'}
          errorText="받은 리뷰를 불러오지 못했습니다."
          onRetry={() => void userReviewsQuery.refetch()}
        />
      </main>

      <BottomNavigation tabs={bottomTabs} activeTab="profile" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function ReviewListSection({
  title,
  ariaLabel,
  reviews,
  isLoading,
  isError,
  emptyText,
  errorText,
  onRetry,
}: {
  title: string;
  ariaLabel: string;
  reviews: readonly Review[];
  isLoading: boolean;
  isError: boolean;
  emptyText: string;
  errorText: string;
  onRetry: () => void;
}) {
  return (
    <section className="mt-5" aria-label={ariaLabel}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-body font-semibold text-gray-900">{title}</h2>
        <MessageSquareText aria-hidden="true" size={18} className="text-gray-500" />
      </div>
      <div className="space-y-gap-tight">
        {isLoading ? <div className="h-28 rounded-card bg-gray-100" aria-label={`${title} 불러오는 중`} /> : null}
        {isError ? <ReviewListError text={errorText} onRetry={onRetry} /> : null}
        {!isLoading && !isError && reviews.length === 0 ? <ReviewListEmpty text={emptyText} /> : null}
        {!isLoading && !isError ? reviews.map((review) => <ReviewCard key={review.id} review={review} />) : null}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-body font-semibold text-gray-900">
              {review.fromUser.name} → {review.toUser.name}
            </p>
            <p className="mt-1 text-caption text-gray-500">
              {formatRoute(review.ride.departureAddr, review.ride.arrivalAddr)} · {formatRideTime(review.ride.departureTime)}
            </p>
          </div>
          <Badge variant="secondary">{formatReviewDate(review.createdAt)}</Badge>
        </div>
        <p className="mt-3 text-warning" aria-label={`${review.rating}점`}>
          {formatStars(review.rating)}
        </p>
        {review.comment ? <p className="mt-2 whitespace-pre-line text-body text-gray-900">{review.comment}</p> : null}
      </CardContent>
    </Card>
  );
}

function ReviewListEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-primary/20 bg-primary-subtle/40 p-5 text-center">
      <p className="text-body font-semibold text-gray-900">{text}</p>
    </div>
  );
}

function ReviewListError({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <div className="rounded-card border border-orange-100 bg-orange-50/60 p-5 text-center">
      <p className="text-body font-semibold text-gray-900">{text}</p>
      <Button type="button" variant="outline" className="mt-3 h-9" onClick={onRetry}>
        <RefreshCw aria-hidden="true" size={16} />
        다시 시도
      </Button>
    </div>
  );
}

function getRouteParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
