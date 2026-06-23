'use client';

import { CreditCard, ReceiptText, RefreshCw, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useMemo, useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useDeletePaymentMethodMutation,
  useMyPaymentMethodsQuery,
  useMySettlementsQuery,
  usePaySettlementMutation,
  useRegisterPaymentMethodMutation,
  useSettlementDetailQuery,
} from '@/hooks/usePaymentQueries';
import { formatRideTime, formatRoute } from '@/lib/matching-format';
import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentTypeLabel,
  settlementStatusLabel,
} from '@/lib/payment-format';
import type {
  MyPaymentMethodsQuery,
  MySettlementsQuery,
  PaymentType,
  SettlementStatus,
} from '@/src/graphql/generated/graphql';

const bottomTabs = [
  { id: 'home', label: '홈', icon: 'home' as const },
  { id: 'history', label: '기록', icon: 'history' as const },
  { id: 'chat', label: '채팅', icon: 'chat' as const },
  { id: 'profile', label: '내 정보', icon: 'profile' as const },
];

const statusFilters = [
  { id: 'ALL', label: '전체' },
  { id: 'PENDING', label: '대기' },
  { id: 'PAID', label: '완료' },
] as const;

type StatusFilter = (typeof statusFilters)[number]['id'];
type Settlement = MySettlementsQuery['mySettlements'][number];
type PaymentMethod = MyPaymentMethodsQuery['myPaymentMethods'][number];

export default function PaymentsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const settlementsQuery = useMySettlementsQuery();
  const paymentMethodsQuery = useMyPaymentMethodsQuery();

  const settlements = settlementsQuery.data ?? [];
  const selectedFromList = settlements.find((settlement) => settlement.id === selectedSettlementId) ?? null;
  const settlementDetailQuery = useSettlementDetailQuery(selectedSettlementId);
  const selectedSettlement = settlementDetailQuery.data ?? selectedFromList;

  const filteredSettlements = useMemo(() => {
    if (statusFilter === 'ALL') {
      return settlements;
    }

    return settlements.filter((settlement) => settlement.status === statusFilter);
  }, [settlements, statusFilter]);

  const summary = useMemo(() => createPaymentSummary(settlements), [settlements]);

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      home: '/',
      history: '/payments',
      chat: '/chat',
      profile: '/profile',
    };

    router.push(routes[tabId] ?? '/');
  };

  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface-muted px-page-mobile pb-36 pt-5 sm:px-page-tablet lg:max-w-6xl lg:px-page-desktop lg:pb-page-desktop">
        <header aria-label="정산 화면 헤더">
          <p className="text-small font-medium text-text-tertiary-on-muted">함께 탄 만큼 투명하게</p>
          <h1 className="mt-1 text-h2 text-text-primary">정산</h1>
        </header>

        <PaymentSummary summary={summary} />

        <section className="mt-5" aria-labelledby="settlement-filter-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="settlement-filter-heading" className="text-body font-semibold text-text-primary">
              정산 내역
            </h2>
            <ReceiptText aria-hidden="true" size={18} className="text-text-tertiary-on-muted" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.id}
                type="button"
                variant={statusFilter === filter.id ? 'default' : 'outline'}
                className="h-10 text-caption"
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </section>

        <section className="mt-5 space-y-gap-tight" aria-label="정산 목록">
          {settlementsQuery.isPending ? <PaymentsLoading /> : null}
          {settlementsQuery.isError ? (
            <PaymentsError onRetry={() => void settlementsQuery.refetch()} />
          ) : null}
          {settlementsQuery.isSuccess && filteredSettlements.length === 0 ? <PaymentsEmpty /> : null}
          {settlementsQuery.isSuccess
            ? filteredSettlements.map((settlement) => (
                <SettlementCard
                  key={settlement.id}
                  settlement={settlement}
                  isSelected={settlement.id === selectedSettlementId}
                  onSelect={() => setSelectedSettlementId(settlement.id)}
                />
              ))
            : null}
        </section>

        {selectedSettlementId ? (
          <SettlementDetailPanel
            settlement={selectedSettlement}
            isLoading={settlementDetailQuery.isPending && !selectedSettlement}
            isError={settlementDetailQuery.isError}
          />
        ) : null}

        <PaymentMethodsSection methods={paymentMethodsQuery.data ?? []} isLoading={paymentMethodsQuery.isPending} />
      </main>

      <BottomNavigation tabs={bottomTabs} activeTab="history" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function PaymentSummary({ summary }: { summary: PaymentSummaryData }) {
  return (
    <section className="mt-5 grid grid-cols-2 gap-3" aria-label="정산 요약">
      <Card>
        <CardContent className="p-4">
          <p className="text-caption text-text-tertiary">대기 정산</p>
          <p className="mt-1 text-h2 text-text-primary">{formatPaymentAmount(summary.pendingAmount)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-caption text-text-tertiary">완료 정산</p>
          <p className="mt-1 text-h2 text-text-primary">{formatPaymentAmount(summary.paidAmount)}</p>
        </CardContent>
      </Card>
        <Card className="col-span-2 bg-primary text-text-inverse">
        <CardContent className="flex items-center justify-between p-4">
          <div>
              <p className="text-caption text-white/80">차주 수익</p>
            <p className="mt-1 text-h2">{formatPaymentAmount(summary.driverAmount)}</p>
          </div>
          <Wallet aria-hidden="true" size={28} className="text-white/80" />
        </CardContent>
      </Card>
    </section>
  );
}

function SettlementCard({
  settlement,
  isSelected,
  onSelect,
}: {
  settlement: Settlement;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const route = formatRoute(settlement.ride.departureAddr, settlement.ride.arrivalAddr);

  return (
    <button type="button" className="w-full text-left" onClick={onSelect} aria-pressed={isSelected}>
        <Card className={isSelected ? 'ring-2 ring-primary' : 'transition-shadow hover:shadow-2'}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-h3 text-text-primary">{route}</p>
              <p className="mt-1 text-caption text-text-tertiary">
                {settlement.ride.driver.name} · {formatRideTime(settlement.ride.departureTime)}
              </p>
            </div>
            <StatusBadge status={settlement.status} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-caption">
            <p className="rounded-ridy-md bg-surface-secondary px-3 py-2 text-text-secondary">
              결제 금액 {formatPaymentAmount(settlement.amount)}
            </p>
            <p className="rounded-ridy-md bg-surface-secondary px-3 py-2 text-text-secondary">
              회사 부담 {formatPaymentAmount(settlement.companyFee)}
            </p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function SettlementDetailPanel({
  settlement,
  isLoading,
  isError,
}: {
  settlement: Settlement | null;
  isLoading: boolean;
  isError: boolean;
}) {
  const paySettlementMutation = usePaySettlementMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePaySettlement = async () => {
    if (!settlement) {
      return;
    }

    setSuccessMessage(null);
    await paySettlementMutation.mutateAsync({
      settlementId: settlement.id,
      idempotencyKey: createIdempotencyKey(settlement.id),
    });
    setSuccessMessage('정산 결제가 완료되었습니다.');
  };

  if (isLoading) {
    return <div className="mt-5 h-48 rounded-card bg-gray-100" aria-label="정산 상세를 불러오는 중" />;
  }

  if (isError || !settlement) {
    return (
      <section className="mt-5 rounded-card border border-orange-100 bg-orange-50/60 p-5 text-center" aria-label="정산 상세 오류">
        <p className="text-body font-semibold text-gray-900">정산 상세를 불러오지 못했습니다.</p>
      </section>
    );
  }

  const canPay = settlement.status === 'PENDING';
  const payButtonLabel = settlement.amount === 0 ? '정산 완료 처리' : `${formatPaymentAmount(settlement.amount)} 결제하기`;

  return (
    <section className="mt-5" aria-labelledby="settlement-detail-heading">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="settlement-detail-heading" className="text-h3 text-gray-900">
                정산 상세
              </h2>
              <p className="mt-1 text-caption text-gray-500">
                {formatRoute(settlement.ride.departureAddr, settlement.ride.arrivalAddr)} · {formatRideTime(settlement.ride.departureTime)}
              </p>
            </div>
            <StatusBadge status={settlement.status} />
          </div>

          <dl className="mt-4 space-y-2 text-body">
            <AmountRow label="결제 금액" value={settlement.amount} strong />
            <AmountRow label="차주 수령액" value={settlement.driverAmount} />
            <AmountRow label="플랫폼 수수료" value={settlement.platformFee} />
            <AmountRow label="회사 부담 수수료" value={settlement.companyFee} />
            <AmountRow label="사원 부담 수수료" value={settlement.passengerFee} />
          </dl>

          <p className="mt-4 text-caption text-gray-500">
            {settlement.status === 'PAID'
              ? `결제 완료: ${formatPaymentDate(settlement.paidAt)}`
              : `결제 기한: ${formatPaymentDate(settlement.dueDate)}`}
          </p>

          {canPay ? (
            <Button
              type="button"
              className="mt-4 h-10 w-full"
              onClick={() => void handlePaySettlement()}
              disabled={paySettlementMutation.isPending}
            >
              {paySettlementMutation.isPending ? '결제 중' : payButtonLabel}
            </Button>
          ) : null}
          {successMessage ? <p className="mt-3 text-caption font-semibold text-success">{successMessage}</p> : null}
          {paySettlementMutation.isError ? (
            <p className="mt-3 text-caption font-semibold text-danger">정산 결제에 실패했습니다.</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function PaymentMethodsSection({ methods, isLoading }: { methods: readonly PaymentMethod[]; isLoading: boolean }) {
  const registerPaymentMethodMutation = useRegisterPaymentMethodMutation();
  const deletePaymentMethodMutation = useDeletePaymentMethodMutation();
  const [type, setType] = useState<PaymentType>('CARD');
  const [alias, setAlias] = useState('');
  const [billingKey, setBillingKey] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    await registerPaymentMethodMutation.mutateAsync({
      input: {
        type,
        alias: alias || null,
        billingKey,
        isDefault: false,
      },
    });
    setAlias('');
    setBillingKey('');
    setSuccessMessage('결제수단이 등록되었습니다.');
  };

  const handleDelete = async (id: string) => {
    setSuccessMessage(null);
    await deletePaymentMethodMutation.mutateAsync({ id });
    setSuccessMessage('결제수단이 삭제되었습니다.');
  };

  return (
    <section className="mt-5" aria-labelledby="payment-method-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="payment-method-heading" className="text-body font-semibold text-gray-900">
          결제수단
        </h2>
        <CreditCard aria-hidden="true" size={18} className="text-gray-500" />
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          {isLoading ? <p className="text-caption text-gray-500">결제수단을 불러오는 중입니다.</p> : null}
          {!isLoading && methods.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-3 text-caption text-gray-500">등록된 결제수단이 없습니다.</p>
          ) : null}
          {methods.map((method) => (
            <div
              key={method.id}
              data-testid={`payment-method-${method.id}`}
              className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3"
            >
              <div>
                <p className="text-body font-semibold text-gray-900">{method.alias ?? paymentTypeLabel(method.type)}</p>
                <p className="mt-1 text-caption text-gray-500">
                  {paymentTypeLabel(method.type)} {method.isDefault ? '· 기본' : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-8"
                onClick={() => void handleDelete(method.id)}
                disabled={deletePaymentMethodMutation.isPending}
              >
                삭제
              </Button>
            </div>
          ))}

          <form className="space-y-3 border-t border-gray-100 pt-4" onSubmit={(event) => void handleSubmit(event)}>
            <div>
              <label htmlFor="payment-type" className="text-caption font-semibold text-gray-700">
                결제수단 타입
              </label>
              <select
                id="payment-type"
                value={type}
                onChange={(event) => setType(event.target.value as PaymentType)}
                className="mt-1 h-9 w-full rounded-lg border border-input bg-white px-2.5 text-body text-gray-900"
              >
                <option value="CARD">카드</option>
                <option value="KAKAO_PAY">카카오페이</option>
                <option value="TOSS_PAY">토스페이</option>
              </select>
            </div>
            <div>
              <label htmlFor="payment-alias" className="text-caption font-semibold text-gray-700">
                결제수단 별칭
              </label>
              <Input
                id="payment-alias"
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                placeholder="회사 카드"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="billing-key" className="text-caption font-semibold text-gray-700">
                빌링키
              </label>
              <Input
                id="billing-key"
                value={billingKey}
                onChange={(event) => setBillingKey(event.target.value)}
                placeholder="테스트 빌링키"
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" className="h-10 w-full" disabled={registerPaymentMethodMutation.isPending || !billingKey}>
              결제수단 등록
            </Button>
          </form>

          {successMessage ? <p className="text-caption font-semibold text-success">{successMessage}</p> : null}
          {registerPaymentMethodMutation.isError ? (
            <p className="text-caption font-semibold text-danger">결제수단 등록에 실패했습니다.</p>
          ) : null}
          {deletePaymentMethodMutation.isError ? (
            <p className="text-caption font-semibold text-danger">결제수단 삭제에 실패했습니다.</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function StatusBadge({ status }: { status: SettlementStatus }) {
  const variant = status === 'PENDING' ? 'secondary' : status === 'PAID' ? 'default' : 'destructive';

  return <Badge variant={variant}>{settlementStatusLabel(status)}</Badge>;
}

function AmountRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className={strong ? 'font-semibold text-gray-900' : 'text-gray-900'}>{formatPaymentAmount(value)}</dd>
    </div>
  );
}

function PaymentsLoading() {
  return (
    <div className="space-y-2" aria-label="정산 내역을 불러오는 중">
      <div className="h-28 rounded-card bg-gray-100" />
      <div className="h-28 rounded-card bg-gray-100" />
    </div>
  );
}

function PaymentsEmpty() {
  return (
    <div className="rounded-card border border-dashed border-primary/20 bg-primary-subtle/40 p-5 text-center">
      <ReceiptText aria-hidden="true" className="mx-auto text-gray-500" size={24} />
      <h2 className="mt-3 text-body font-semibold text-gray-900">아직 정산 내역이 없습니다</h2>
      <p className="mt-1 text-caption text-gray-500">카풀 운행이 완료되면 정산 내역이 표시됩니다.</p>
    </div>
  );
}

function PaymentsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card border border-orange-100 bg-orange-50/60 p-5 text-center">
      <p className="text-body font-semibold text-gray-900">정산 내역을 불러오지 못했습니다.</p>
      <p className="mt-1 text-caption text-gray-500">연결이 불안정해요. 잠시 후 다시 확인해주세요.</p>
      <Button type="button" variant="outline" className="mt-3 h-9" onClick={onRetry}>
        <RefreshCw aria-hidden="true" size={16} />
        다시 시도
      </Button>
    </div>
  );
}

interface PaymentSummaryData {
  pendingAmount: number;
  paidAmount: number;
  driverAmount: number;
}

function createPaymentSummary(settlements: readonly Settlement[]): PaymentSummaryData {
  return settlements.reduce<PaymentSummaryData>(
    (summary, settlement) => ({
      pendingAmount: summary.pendingAmount + (settlement.status === 'PENDING' ? settlement.amount : 0),
      paidAmount: summary.paidAmount + (settlement.status === 'PAID' ? settlement.amount : 0),
      driverAmount: summary.driverAmount + settlement.driverAmount,
    }),
    { pendingAmount: 0, paidAmount: 0, driverAmount: 0 },
  );
}

function createIdempotencyKey(settlementId: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${settlementId}-${crypto.randomUUID()}`;
  }

  return `${settlementId}-${Date.now()}`;
}
