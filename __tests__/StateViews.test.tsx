import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AlertBanner } from '@/components/ridy/AlertBanner';
import { StateView } from '@/components/ridy/StateView';

describe('공통 상태 UI', () => {
  it('빈 상태가 원인 문구와 다음 행동 CTA를 제공한다', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();

    render(
      <StateView
        tone="empty"
        title="아직 매칭 내역이 없습니다"
        description="조건을 입력하면 함께 이동할 동료를 찾을 수 있습니다."
        actionLabel="매칭 찾기"
        onAction={handleAction}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('아직 매칭 내역이 없습니다');
    expect(screen.getByText('조건을 입력하면 함께 이동할 동료를 찾을 수 있습니다.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '매칭 찾기' }));

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('오류 상태가 재시도 액션과 보조 이동 액션을 구분한다', async () => {
    const handleRetry = vi.fn();
    const handleBack = vi.fn();
    const user = userEvent.setup();

    render(
      <StateView
        tone="error"
        title="정산 내역을 불러오지 못했습니다"
        description="네트워크 상태를 확인한 뒤 다시 시도해주세요."
        actionLabel="다시 시도"
        onAction={handleRetry}
        secondaryActionLabel="홈으로 이동"
        onSecondaryAction={handleBack}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('정산 내역을 불러오지 못했습니다');

    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    await user.click(screen.getByRole('button', { name: '홈으로 이동' }));

    expect(handleRetry).toHaveBeenCalledTimes(1);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('오프라인 배너가 색상뿐 아니라 텍스트로 상태를 전달한다', () => {
    render(
      <AlertBanner
        tone="offline"
        title="오프라인 상태입니다"
        description="연결이 복구되면 최신 카풀 정보를 다시 불러옵니다."
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('오프라인 상태입니다');
    expect(screen.getByText('연결이 복구되면 최신 카풀 정보를 다시 불러옵니다.')).toBeInTheDocument();
  });
});
