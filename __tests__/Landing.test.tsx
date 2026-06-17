import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LandingPage, { metadata } from '@/app/landing/page';

describe('랜딩 페이지', () => {
  it('히어로, 서비스 소개, 이용 방법, 소셜 프루프, CTA를 표시한다', () => {
    render(<LandingPage />);

    expect(screen.getByRole('heading', { name: /함께 타는 출퇴근/ })).toBeInTheDocument();
    expect(screen.getByText('같은 회사 동료와 안전하게 매칭하고, 정산까지 한 번에 관리하세요.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '초대 코드로 시작하기' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: '서비스 보기' })).toHaveAttribute('href', '#how-it-works');
    expect(screen.getByText('카풀 매칭')).toBeInTheDocument();
    expect(screen.getByText('자동 정산')).toBeInTheDocument();
    expect(screen.getByText('친환경 임팩트')).toBeInTheDocument();
    expect(screen.getByText('1. 초대 코드 가입')).toBeInTheDocument();
    expect(screen.getByText('평점 4.8')).toBeInTheDocument();
    expect(screen.getByText('운행 12,400회')).toBeInTheDocument();
    expect(screen.getByText('CO₂ 8.2t 절감')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Ridy');
  });

  it('SEO metadata와 구조화 데이터를 제공한다', () => {
    render(<LandingPage />);

    expect(metadata.title).toBe('Ridy - 함께 타는 출퇴근 카풀');
    expect(metadata.description).toContain('같은 회사 동료와 안전하게 출퇴근 카풀');
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        title: 'Ridy - 함께 타는 출퇴근 카풀',
        type: 'website',
        url: '/landing',
      }),
    );
    expect(screen.getByTestId('landing-structured-data')).toHaveTextContent('SoftwareApplication');
  });

  it('FE-KT-004: 랜딩 화면이 KT Gray-first hierarchy와 단일 hero primary CTA를 사용한다', () => {
    render(<LandingPage />);

    const main = screen.getByRole('main');
    const heading = screen.getByRole('heading', { name: /함께 타는 출퇴근/ });
    const primaryCta = screen.getByRole('link', { name: /초대 코드로 시작하기/ });
    const secondaryCta = screen.getByRole('link', { name: '서비스 보기' });

    expect(main).toHaveClass('bg-surface-muted');
    expect(main).toHaveClass('text-text-primary');
    expect(heading).toHaveClass('text-text-primary');
    expect(primaryCta).toHaveClass('bg-primary');
    expect(primaryCta).toHaveClass('h-12');
    expect(secondaryCta).toHaveClass('border-primary');
    expect(secondaryCta).not.toHaveClass('bg-primary');
  });

  it('FE-KT-PURE-002: 랜딩 hero가 강한 radial glow 없이 Gray-first surface를 사용한다', () => {
    render(<LandingPage />);

    const main = screen.getByRole('main');
    const heroSection = screen.getByRole('heading', { name: /함께 타는 출퇴근/ }).closest('section');

    expect(main).toHaveClass('bg-surface-muted');
    expect(heroSection).not.toBeNull();
    expect(heroSection.innerHTML).not.toContain('radial-gradient');
    expect(heroSection.innerHTML).not.toContain('blur-3xl');
    expect(heroSection.innerHTML).not.toContain('backdrop-blur-xl');
    expect(heroSection.innerHTML).not.toContain('shadow-4');
  });
});
