import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Home from '@/app/page';
import { saveAuthTokens } from '@/lib/auth/token-storage';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

afterEach(() => {
  localStorage.clear();
  push.mockClear();
});

function renderAuthenticatedHome() {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  render(<Home />);
}

describe('홈 화면', () => {
  it('토큰이 없으면 로그인 화면으로 이동한다', async () => {
    render(<Home />);

    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    expect(screen.queryByRole('heading', { name: '테크스타터' })).not.toBeInTheDocument();
  });

  it('탑승자 홈의 경로 검색과 정기 카풀을 보여준다', async () => {
    renderAuthenticatedHome();

    expect(await screen.findByRole('heading', { name: '테크스타터' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '어디로 가세요?' })).toBeInTheDocument();
    expect(screen.getByLabelText('출발지')).toBeInTheDocument();
    expect(screen.getByLabelText('도착지')).toBeInTheDocument();
    expect(screen.getByLabelText('출발 시간')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /매칭 찾기/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '내 정기 카풀' })).toBeInTheDocument();
    expect(screen.getByText('박준서')).toBeInTheDocument();
    expect(screen.getByText('첫 카풀을 찾아보세요')).toBeInTheDocument();
  });

  it('경로와 시간을 입력하면 매칭 결과로 이동한다', async () => {
    const user = userEvent.setup();
    renderAuthenticatedHome();

    await screen.findByRole('heading', { name: '테크스타터' });
    await user.type(screen.getByLabelText('출발지'), '강남역');
    await user.type(screen.getByLabelText('도착지'), '수원역');
    await user.clear(screen.getByLabelText('출발 시간'));
    await user.type(screen.getByLabelText('출발 시간'), '09:10');
    await user.click(screen.getByRole('button', { name: /매칭 찾기/ }));

    expect(push).toHaveBeenCalledWith('/matchings?departure=%EA%B0%95%EB%82%A8%EC%97%AD&destination=%EC%88%98%EC%9B%90%EC%97%AD&departureTime=09%3A10');
  });

  it('하단 내비게이션을 표시하고 검색 탭을 누르면 매칭 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    renderAuthenticatedHome();

    expect(await screen.findByLabelText('홈')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByLabelText('검색')).toBeInTheDocument();
    expect(screen.getByLabelText('채팅')).toBeInTheDocument();
    expect(screen.getByLabelText('내 정보')).toBeInTheDocument();

    await user.click(screen.getByLabelText('검색'));

    expect(push).toHaveBeenCalledWith('/matchings');
  });
});
