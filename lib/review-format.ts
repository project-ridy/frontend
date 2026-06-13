export function formatStars(rating: number): string {
  const safeRating = Math.max(0, Math.min(5, rating));
  return '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
}

export function formatReviewDate(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return '날짜 미정';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function buildReviewComment(tags: readonly string[], comment: string): string | null {
  const trimmedComment = comment.trim();
  const tagComment = tags.join(', ');

  if (tagComment && trimmedComment) {
    return `${tagComment}\n${trimmedComment}`;
  }

  if (tagComment) {
    return tagComment;
  }

  return trimmedComment || null;
}
