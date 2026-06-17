import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AlertBanner } from '@/components/ridy/AlertBanner';
import { StateView } from '@/components/ridy/StateView';

describe('FE-KT-003 상태 피드백 컴포넌트', () => {
  it('StateView가 원인과 다음 행동 CTA를 함께 제공한다', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();

    render(
      <StateView
        state="error"
        title="카풀 목록을 불러오지 못했습니다"
        description="네트워크 연결이 불안정해 최신 목록을 가져오지 못했습니다."
        actionLabel="다시 시도"
        onAction={handleRetry}
      />,
    );

    expect(screen.getByRole('status')).toHaveClass('bg-surface');
    expect(screen.getByRole('status')).toHaveClass('rounded-ridy-lg');
    expect(screen.getByText('카풀 목록을 불러오지 못했습니다')).toHaveClass('text-text-primary');
    expect(screen.getByText(/네트워크 연결/)).toHaveClass('text-text-secondary');

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it('StateView empty 상태가 KT gray surface와 secondary CTA를 사용한다', () => {
    render(
      <StateView
        state="empty"
        title="아직 등록된 카풀이 없습니다"
        description="출발지와 도착지를 설정하면 같은 회사 동료의 카풀을 찾을 수 있습니다."
        actionLabel="경로 설정하기"
      />,
    );

    expect(screen.getByRole('status')).toHaveClass('bg-surface-secondary');
    expect(screen.getByRole('button', { name: '경로 설정하기' })).toHaveClass('border-primary');
  });

  it('AlertBanner가 severity별 원인과 다음 행동을 색상만이 아닌 텍스트로 전달한다', () => {
    render(
      <AlertBanner
        severity="danger"
        title="요청할 수 없습니다"
        description="잔여 좌석이 없어 다른 카풀을 선택해야 합니다."
        actionLabel="다른 카풀 보기"
      />,
    );

    expect(screen.getByRole('alert')).toHaveClass('border-danger-on-muted');
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
    expect(screen.getByText('요청할 수 없습니다')).toHaveClass('text-danger-on-muted');
    expect(screen.getByText('잔여 좌석이 없어 다른 카풀을 선택해야 합니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다른 카풀 보기' })).toBeInTheDocument();
  });
});
