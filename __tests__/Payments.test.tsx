import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import PaymentsPage from '@/app/payments/page';
import { saveAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';

const push = vi.fn();
const paySettlementMock = vi.fn();
const registerPaymentMethodMock = vi.fn();
const deletePaymentMethodMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const settlements = [
  {
    id: 'settlement-1',
    amount: 5000,
    driverAmount: 4750,
    platformFee: 250,
    companyFee: 125,
    passengerFee: 125,
    status: 'PENDING',
    dueDate: '2026-06-14T23:59:59.000Z',
    paidAt: null,
    createdAt: '2026-06-12T09:30:00.000Z',
    passenger: { id: 'passenger-1', name: '김서연' },
    ride: {
      id: 'ride-1',
      departureAddr: '강남역',
      arrivalAddr: '수원역',
      departureTime: '2026-06-12T08:30:00.000Z',
      driver: { id: 'driver-1', name: '박준서', rating: 4.8, rideCount: 42 },
    },
  },
  {
    id: 'settlement-2',
    amount: 4500,
    driverAmount: 4275,
    platformFee: 225,
    companyFee: 0,
    passengerFee: 225,
    status: 'PAID',
    dueDate: null,
    paidAt: '2026-06-11T09:30:00.000Z',
    createdAt: '2026-06-11T09:20:00.000Z',
    passenger: { id: 'passenger-1', name: '김서연' },
    ride: {
      id: 'ride-2',
      departureAddr: '판교역',
      arrivalAddr: '광교중앙역',
      departureTime: '2026-06-11T08:20:00.000Z',
      driver: { id: 'driver-2', name: '이민수', rating: 4.7, rideCount: 28 },
    },
  },
];

let paymentMethods = [
  {
    id: 'payment-method-1',
    type: 'CARD',
    alias: '회사 카드',
    isDefault: true,
    createdAt: '2026-06-10T10:00:00.000Z',
  },
];

const server = setupServer(
  graphql.query('MySettlements', () => {
    return HttpResponse.json({ data: { mySettlements: settlements } });
  }),
  graphql.query('SettlementDetail', () => {
    return HttpResponse.json({ data: { settlementDetail: settlements[0] } });
  }),
  graphql.query('MyPaymentMethods', () => {
    return HttpResponse.json({ data: { myPaymentMethods: paymentMethods } });
  }),
  graphql.mutation('PaySettlement', ({ variables }) => {
    paySettlementMock(variables);

    return HttpResponse.json({
      data: {
        paySettlement: {
          ...settlements[0],
          status: 'PAID',
          paidAt: '2026-06-12T10:00:00.000Z',
        },
      },
    });
  }),
  graphql.mutation('RegisterPaymentMethod', ({ variables }) => {
    registerPaymentMethodMock(variables);
    paymentMethods = [
      ...paymentMethods,
      {
        id: 'payment-method-2',
        type: 'TOSS_PAY',
        alias: '토스페이',
        isDefault: false,
        createdAt: '2026-06-12T10:00:00.000Z',
      },
    ];

    return HttpResponse.json({ data: { registerPaymentMethod: paymentMethods[1] } });
  }),
  graphql.mutation('DeletePaymentMethod', ({ variables }) => {
    deletePaymentMethodMock(variables);
    paymentMethods = paymentMethods.filter((method) => method.id !== 'payment-method-1');

    return HttpResponse.json({ data: { deletePaymentMethod: true } });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  push.mockClear();
  paySettlementMock.mockClear();
  registerPaymentMethodMock.mockClear();
  deletePaymentMethodMock.mockClear();
  paymentMethods = [
    {
      id: 'payment-method-1',
      type: 'CARD',
      alias: '회사 카드',
      isDefault: true,
      createdAt: '2026-06-10T10:00:00.000Z',
    },
  ];
});
afterAll(() => server.close());

function renderWithAuth(ui: React.ReactNode) {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  return render(<TestProviders>{ui}</TestProviders>);
}

describe('정산 화면', () => {
  it('정산 요약과 목록을 표시한다', async () => {
    renderWithAuth(<PaymentsPage />);

    expect(await screen.findByRole('heading', { name: '정산' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveClass('lg:max-w-6xl');
    expect(screen.getByLabelText('이번 달 정산 현황')).toBeInTheDocument();
    expect(await screen.findByText('강남역 → 수원역')).toBeInTheDocument();
    expect(screen.getByText('대기 정산')).toBeInTheDocument();
    expect(screen.getByText('5,000원')).toBeInTheDocument();
    expect(screen.getByText('완료 정산')).toBeInTheDocument();
    expect(screen.getByText('4,500원')).toBeInTheDocument();
    expect(screen.getByText('판교역 → 광교중앙역')).toBeInTheDocument();
    expect(screen.getByText('회사 부담 125원')).toBeInTheDocument();
  });

  it('정산 상태 필터가 동작한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<PaymentsPage />);

    await screen.findByText('강남역 → 수원역');
    await user.click(screen.getByRole('button', { name: '대기' }));

    expect(screen.getByText('강남역 → 수원역')).toBeInTheDocument();
    expect(screen.queryByText('판교역 → 광교중앙역')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '완료' }));

    expect(screen.queryByText('강남역 → 수원역')).not.toBeInTheDocument();
    expect(screen.getByText('판교역 → 광교중앙역')).toBeInTheDocument();
  });

  it('정산 상세를 열고 결제를 실행한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<PaymentsPage />);

    await user.click(await screen.findByRole('button', { name: /강남역 → 수원역/ }));

    expect(await screen.findByRole('heading', { name: '정산 상세' })).toBeInTheDocument();
    expect(screen.getByText('플랫폼 수수료')).toBeInTheDocument();
    expect(screen.getByText('사원 부담 수수료')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '5,000원 결제하기' }));

    expect(paySettlementMock).toHaveBeenCalledWith(
      expect.objectContaining({ settlementId: 'settlement-1', idempotencyKey: expect.any(String) }),
    );
    expect(await screen.findByText('정산 결제가 완료되었습니다.')).toBeInTheDocument();
  });

  it('결제수단을 등록하고 삭제한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<PaymentsPage />);

    expect(await screen.findByText('회사 카드')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('결제수단 타입'), 'TOSS_PAY');
    await user.type(screen.getByLabelText('결제수단 별칭'), '토스페이');
    await user.type(screen.getByLabelText('빌링키'), 'billing-key-2');
    await user.click(screen.getByRole('button', { name: '결제수단 등록' }));

    expect(registerPaymentMethodMock).toHaveBeenCalledWith({
      input: {
        type: 'TOSS_PAY',
        alias: '토스페이',
        billingKey: 'billing-key-2',
        isDefault: false,
      },
    });
    expect(await screen.findByText('결제수단이 등록되었습니다.')).toBeInTheDocument();

    const methodCard = screen.getByTestId('payment-method-payment-method-1');
    await user.click(within(methodCard).getByRole('button', { name: '삭제' }));

    expect(deletePaymentMethodMock).toHaveBeenCalledWith({ id: 'payment-method-1' });
    expect(await screen.findByText('결제수단이 삭제되었습니다.')).toBeInTheDocument();
  });

  it('정산 목록이 없으면 빈 상태를 표시한다', async () => {
    server.use(
      graphql.query('MySettlements', () => {
        return HttpResponse.json({ data: { mySettlements: [] } });
      }),
    );

    renderWithAuth(<PaymentsPage />);

    expect(await screen.findByText('아직 정산 내역이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('카풀 운행이 완료되면 정산 내역이 표시됩니다.')).toBeInTheDocument();
  });

  it('정산 조회와 결제 실패 상태를 표시한다', async () => {
    server.use(
      graphql.query('MySettlements', () => {
        return HttpResponse.json({ errors: [{ message: 'settlements failed' }] }, { status: 500 });
      }),
    );

    renderWithAuth(<PaymentsPage />);

    expect(await screen.findByText('정산 내역을 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });
});
