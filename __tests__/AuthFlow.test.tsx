import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import LoginPage from '@/app/login/page';
import ProfileSetupPage from '@/app/profile/setup/page';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { saveAuthTokens, clearAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';

const push = vi.fn();
const joinRequests: unknown[] = [];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const server = setupServer(
  graphql.mutation('JoinWithInviteCode', ({ variables }) => {
    joinRequests.push(variables);

    return HttpResponse.json({
      data: {
        joinWithInviteCode: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: {
            id: 'user-1',
            email: 'jane@company.com',
            name: 'Jane',
            phone: null,
            imageUrl: null,
            role: 'PASSENGER',
            employeeId: null,
            companyId: 'company-1',
            rating: 0,
            rideCount: 0,
          },
        },
      },
    });
  }),
  graphql.mutation('UpdateProfile', async ({ variables }) => {
    const input = variables.input as { name?: string; phone?: string; role?: string; employeeId?: string };

    return HttpResponse.json({
      data: {
        updateProfile: {
          id: 'user-1',
          email: 'jane@company.com',
          name: input.name ?? 'Jane',
          phone: input.phone ?? null,
          imageUrl: null,
          role: input.role ?? 'PASSENGER',
          employeeId: input.employeeId ?? null,
          companyId: 'company-1',
          rating: 0,
          rideCount: 0,
        },
      },
    });
  }),
  graphql.mutation('RegisterVehicle', async ({ variables }) => {
    const input = variables.input as { model: string; color?: string; plate: string; capacity: number };

    return HttpResponse.json({
      data: {
        registerVehicle: {
          id: 'vehicle-1',
          userId: 'user-1',
          model: input.model,
          color: input.color ?? null,
          plate: input.plate,
          capacity: input.capacity,
        },
      },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  joinRequests.length = 0;
  localStorage.clear();
  push.mockClear();
});
afterAll(() => server.close());

describe('로그인/온보딩 플로우', () => {
  it('로그인 화면은 초대 코드, 회사 이메일과 카카오/구글 로그인만 노출하고 Apple 로그인은 제거한다', () => {
    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    expect(screen.getByRole('heading', { name: /Ridy/ })).toBeInTheDocument();
    expect(screen.getByLabelText('초대 코드')).toBeInTheDocument();
    expect(screen.getByLabelText('회사 이메일')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '카카오로 계속하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '구글로 계속하기' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Apple|애플/i })).not.toBeInTheDocument();
  });

  it('초대 코드 없이 소셜 로그인을 누르면 유효성 메시지를 보여준다', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.click(screen.getByRole('button', { name: '카카오로 계속하기' }));

    expect(await screen.findByText('초대 코드를 입력해주세요.')).toBeInTheDocument();
    expect(joinRequests).toHaveLength(0);
  });

  it('회사 이메일 없이 소셜 로그인을 누르면 유효성 메시지를 보여준다', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.type(screen.getByLabelText('초대 코드'), 'ABC123');
    await user.click(screen.getByRole('button', { name: '카카오로 계속하기' }));

    expect(await screen.findByText('회사 이메일을 입력해주세요.')).toBeInTheDocument();
    expect(joinRequests).toHaveLength(0);
  });

  it('회사 이메일 형식이 올바르지 않으면 요청하지 않고 유효성 메시지를 보여준다', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.type(screen.getByLabelText('초대 코드'), 'ABC123');
    await user.type(screen.getByLabelText('회사 이메일'), 'jane-company');
    await user.click(screen.getByRole('button', { name: '카카오로 계속하기' }));

    expect(await screen.findByText('올바른 회사 이메일을 입력해주세요.')).toBeInTheDocument();
    expect(joinRequests).toHaveLength(0);
  });

  it('초대 코드와 회사 이메일로 카카오 로그인이 성공하면 companyEmail을 전달하고 프로필 설정으로 이동한다', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.type(screen.getByLabelText('초대 코드'), ' abc123 ');
    await user.type(screen.getByLabelText('회사 이메일'), ' jane@company.com ');
    await user.click(screen.getByRole('button', { name: '카카오로 계속하기' }));

    await waitFor(() => expect(localStorage.getItem('ridy.accessToken')).toBe('access-token'));
    expect(joinRequests).toContainEqual({
      input: {
        inviteCode: 'ABC123',
        companyEmail: 'jane@company.com',
        provider: 'kakao',
        oauthToken: 'mock-kakao-oauth-token',
        employeeId: null,
      },
    });
    expect(localStorage.getItem('ridy.refreshToken')).toBe('refresh-token');
    expect(push).toHaveBeenCalledWith('/profile/setup');
  });

  it('도메인 불일치 응답이면 backend 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    server.use(
      graphql.mutation('JoinWithInviteCode', () => {
        return HttpResponse.json({ errors: [{ message: '회사 이메일 도메인이 일치하지 않습니다' }] });
      }),
    );

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.type(screen.getByLabelText('초대 코드'), 'ABC123');
    await user.type(screen.getByLabelText('회사 이메일'), 'jane@external.com');
    await user.click(screen.getByRole('button', { name: '카카오로 계속하기' }));

    expect(await screen.findByText('회사 이메일 도메인이 일치하지 않습니다')).toBeInTheDocument();
  });

  it('프로필 설정에서 차주 토글 시 차량 정보 입력 폼을 노출한다', async () => {
    const user = userEvent.setup();
    saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });

    render(
      <TestProviders>
        <ProfileSetupPage />
      </TestProviders>,
    );

    expect(screen.getByRole('heading', { name: '프로필 설정' })).toBeInTheDocument();
    expect(screen.queryByLabelText('차량 모델')).not.toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: '차주로 시작' }));

    expect(screen.getByLabelText('차량 모델')).toBeInTheDocument();
    expect(screen.getByLabelText('차량 색상')).toBeInTheDocument();
    expect(screen.getByLabelText('차량 번호')).toBeInTheDocument();
    expect(screen.getByLabelText('탑승 정원')).toBeInTheDocument();
  });

  it('차주 프로필 제출 시 프로필 업데이트와 차량 등록 후 홈으로 이동한다', async () => {
    const user = userEvent.setup();
    saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });

    render(
      <TestProviders>
        <ProfileSetupPage />
      </TestProviders>,
    );

    await user.type(screen.getByLabelText('이름'), '손정원');
    await user.type(screen.getByLabelText('사번'), 'EMP-001');
    await user.type(screen.getByLabelText('연락처'), '01012345678');
    await user.click(screen.getByRole('switch', { name: '차주로 시작' }));
    await user.type(screen.getByLabelText('차량 모델'), 'IONIQ 5');
    await user.type(screen.getByLabelText('차량 색상'), '파란색');
    await user.type(screen.getByLabelText('차량 번호'), '12가3456');
    await user.clear(screen.getByLabelText('탑승 정원'));
    await user.type(screen.getByLabelText('탑승 정원'), '4');
    await user.click(screen.getByRole('button', { name: '시작하기' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
  });

  it('인증 가드는 토큰이 없으면 로그인 화면으로 이동시킨다', async () => {
    render(
      <AuthGuard>
        <p>보호된 화면</p>
      </AuthGuard>,
    );

    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('보호된 화면')).not.toBeInTheDocument();
  });

  it('인증 가드는 토큰이 있으면 보호된 화면을 렌더링한다', async () => {
    saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });

    render(
      <AuthGuard>
        <p>보호된 화면</p>
      </AuthGuard>,
    );

    expect(await screen.findByText('보호된 화면')).toBeInTheDocument();
  });

  it('토큰 저장소는 accessToken과 refreshToken을 저장하고 초기화한다', () => {
    saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });

    expect(localStorage.getItem('ridy.accessToken')).toBe('access-token');
    expect(localStorage.getItem('ridy.refreshToken')).toBe('refresh-token');

    clearAuthTokens();

    expect(localStorage.getItem('ridy.accessToken')).toBeNull();
    expect(localStorage.getItem('ridy.refreshToken')).toBeNull();
  });
});
