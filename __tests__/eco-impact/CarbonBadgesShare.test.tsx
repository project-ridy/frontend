import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CarbonBadgesShare } from '@/features/eco-impact/components/CarbonBadgesShare';
import type { EcoImpactDashboardQuery } from '@/src/graphql/generated/graphql';

type Impact = EcoImpactDashboardQuery['myCarbonImpact'];

const impact: Impact = {
  period: 'all',
  totalRides: 12,
  totalDistanceKm: 128.4,
  co2SavedKg: 26.96,
  treeEquivalent: 1.23,
  level: 'SPROUT',
  badges: [
    {
      id: 'FIRST_SHARE',
      label: '첫 카풀',
      description: '첫 완료 카풀을 달성했어요.',
      achievedAt: '2026-06-01T09:00:00.000Z',
    },
  ],
};

describe('CarbonBadgesShare', () => {
  it('현재 레벨과 획득한 배지를 표시한다', () => {
    render(<CarbonBadgesShare impact={impact} />);

    expect(screen.getByRole('heading', { name: '친환경 배지' })).toBeInTheDocument();
    expect(screen.getByText('SPROUT')).toBeInTheDocument();
    expect(screen.getByText('첫 카풀')).toBeInTheDocument();
    expect(screen.getByText('첫 완료 카풀을 달성했어요.')).toBeInTheDocument();
  });

  it('배지가 없으면 빈 상태를 표시한다', () => {
    render(<CarbonBadgesShare impact={{ ...impact, badges: [] }} />);

    expect(screen.getByText('아직 획득한 배지가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('카풀을 더 완료하면 친환경 배지를 받을 수 있어요.')).toBeInTheDocument();
  });

  it('Web Share API가 없으면 클립보드에 공유 문구를 복사한다', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });

    render(<CarbonBadgesShare impact={impact} />);

    await user.click(screen.getByRole('button', { name: '임팩트 공유하기' }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('26.96kg CO₂'));
    expect(await screen.findByText('공유 문구를 클립보드에 복사했습니다.')).toBeInTheDocument();
  });
});
