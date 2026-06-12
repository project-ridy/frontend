export function formatRideTime(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return '시간 미정';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatFare(value: number | null): string {
  if (value === null) {
    return '금액 미정';
  }

  return `${value.toLocaleString('ko-KR')}원`;
}

export function formatRoute(departure: string | null, arrival: string | null): string {
  return `${departure ?? '출발지 미정'} → ${arrival ?? '도착지 미정'}`;
}
