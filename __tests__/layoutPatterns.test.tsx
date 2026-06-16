import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageShell } from '@/components/ridy/PageShell';

describe('FE-SOCAR-UX-001 페이지 shell', () => {
  it('mobile safe-area와 desktop max-width class를 제공한다', () => {
    render(
      <PageShell ariaLabel="테스트 페이지" bottomNavOffset>
        <h1>테스트 화면</h1>
      </PageShell>,
    );

    const main = screen.getByRole('main', { name: '테스트 페이지' });

    expect(main).toHaveClass('min-h-dvh');
    expect(main).toHaveClass('px-page-mobile');
    expect(main).toHaveClass('sm:px-page-tablet');
    expect(main).toHaveClass('lg:max-w-6xl');
    expect(main).toHaveClass('pb-[calc(6rem+env(safe-area-inset-bottom))]');
    expect(screen.getByRole('heading', { name: '테스트 화면' })).toBeInTheDocument();
  });
});
