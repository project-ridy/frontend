import type { PaymentType, SettlementStatus } from '@/src/graphql/generated/graphql';

export function formatPaymentAmount(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function formatPaymentDate(value: unknown): string {
  if (value === null || value === undefined) {
    return '기한 없음';
  }

  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return '기한 없음';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function settlementStatusLabel(status: SettlementStatus): string {
  const labels: Record<SettlementStatus, string> = {
    PENDING: '대기',
    PAID: '완료',
    FAILED: '실패',
    CANCELLED: '취소',
  };

  return labels[status];
}

export function paymentTypeLabel(type: PaymentType): string {
  const labels: Record<PaymentType, string> = {
    CARD: '카드',
    KAKAO_PAY: '카카오페이',
    TOSS_PAY: '토스페이',
  };

  return labels[type];
}
