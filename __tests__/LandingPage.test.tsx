import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LandingPage from '@/app/landing/page';

describe('FE-SOCAR-UX-002 랜딩 hierarchy', () => {
  it('랜딩 hero와 지표 섹션을 예측 가능한 hierarchy로 표시한다', () => {
    render(<LandingPage />);

    const hero = screen.getByRole('region', { name: '랜딩 히어로' });

    expect(within(hero).getByRole('heading', { name: /함께 타는 출퇴근/ })).toBeInTheDocument();
    expect(within(hero).getByText('회사 전용 출퇴근 카풀')).toBeInTheDocument();
    expect(within(hero).getByRole('link', { name: /초대 코드로 시작하기/ })).toHaveAttribute('href', '/login');
    expect(within(hero).getByRole('link', { name: '서비스 보기' })).toHaveAttribute('href', '#how-it-works');

    const proof = screen.getByRole('region', { name: 'Ridy 신뢰 지표' });

    expect(within(proof).getByText('평점 4.8')).toBeInTheDocument();
    expect(within(proof).getByText('운행 12,400회')).toBeInTheDocument();
    expect(within(proof).getByText('CO₂ 8.2t 절감')).toBeInTheDocument();
  });
});
