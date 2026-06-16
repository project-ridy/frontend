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
const loginRequests: unknown[] = [];
const verificationRequests: unknown[] = [];
const signupRequests: unknown[] = [];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const server = setupServer(
  graphql.mutation('Login', ({ variables }) => {
    loginRequests.push(variables);

    return HttpResponse.json({
      data: {
        login: {
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
  graphql.mutation('RequestCompanyEmailVerification', ({ variables }) => {
    verificationRequests.push(variables);

    return HttpResponse.json({
      data: {
        requestCompanyEmailVerification: {
          id: 'challenge-1',
          companyEmail: 'jane@company.com',
          expiresAt: '2026-06-15T10:10:00.000Z',
          resendAvailableAt: '2999-01-01T00:00:00.000Z',
        },
      },
    });
  }),
  graphql.mutation('CompleteEmailPasswordSignup', ({ variables }) => {
    signupRequests.push(variables);

    return HttpResponse.json({
      data: {
        completeEmailPasswordSignup: {
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
  loginRequests.length = 0;
  verificationRequests.length = 0;
  signupRequests.length = 0;
  localStorage.clear();
  push.mockClear();
});
afterAll(() => server.close());

describe('로그인/온보딩 플로우', () => {
  it('OAuth 버튼 없이 이메일 로그인과 가입 폼을 노출한다', () => {
    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    expect(screen.getByRole('heading', { name: /Ridy/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '로그인' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '가입' })).toBeInTheDocument();
    expect(screen.getByLabelText('로그인 회사 이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('로그인 비밀번호')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /카카오|구글|Apple|애플/i })).not.toBeInTheDocument();
  });

  it('회사 이메일과 비밀번호로 로그인한다', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.type(screen.getByLabelText('로그인 회사 이메일'), ' Jane@Company.COM ');
    await user.type(screen.getByLabelText('로그인 비밀번호'), 'Password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(localStorage.getItem('ridy.accessToken')).toBe('access-token'));
    expect(loginRequests).toContainEqual({
      input: {
        companyEmail: 'jane@company.com',
        password: 'Password123',
      },
    });
    expect(localStorage.getItem('ridy.refreshToken')).toBe('refresh-token');
    expect(push).toHaveBeenCalledWith('/');
  });

  it('로그인 필수값이 없으면 요청하지 않는다', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('회사 이메일을 입력해주세요.')).toBeInTheDocument();
    expect(loginRequests).toHaveLength(0);

    await user.type(screen.getByLabelText('로그인 회사 이메일'), 'jane@company.com');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
    expect(loginRequests).toHaveLength(0);
  });

  it('로그인 에러를 표시한다', async () => {
    const user = userEvent.setup();
    server.use(
      graphql.mutation('Login', () => {
        return HttpResponse.json({ errors: [{ message: '회사 이메일 또는 비밀번호가 올바르지 않습니다' }] });
      }),
    );

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.type(screen.getByLabelText('로그인 회사 이메일'), 'jane@company.com');
    await user.type(screen.getByLabelText('로그인 비밀번호'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('회사 이메일 또는 비밀번호가 올바르지 않습니다')).toBeInTheDocument();
  });

  it('가입 코드와 회사 이메일로 인증코드를 요청한다', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.click(screen.getByRole('tab', { name: '가입' }));
    await user.type(screen.getByLabelText('초대 코드'), ' abc123 ');
    await user.type(screen.getByLabelText('회사 이메일'), ' jane@company.com ');
    await user.click(screen.getByRole('button', { name: '인증코드 받기' }));

    expect(await screen.findByLabelText('인증코드')).toBeInTheDocument();
    expect(verificationRequests).toContainEqual({
      input: {
        inviteCode: 'ABC123',
        companyEmail: 'jane@company.com',
      },
    });
    expect(screen.getByRole('button', { name: '인증코드 재발송 대기' })).toBeDisabled();
  });

  it('잘못된 가입 입력이면 요청하지 않는다', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.click(screen.getByRole('tab', { name: '가입' }));
    await user.click(screen.getByRole('button', { name: '인증코드 받기' }));

    expect(await screen.findByText('초대 코드를 입력해주세요.')).toBeInTheDocument();
    expect(verificationRequests).toHaveLength(0);

    await user.type(screen.getByLabelText('초대 코드'), 'ABC123');
    await user.type(screen.getByLabelText('회사 이메일'), 'jane-company');
    await user.click(screen.getByRole('button', { name: '인증코드 받기' }));

    expect(await screen.findByText('올바른 회사 이메일을 입력해주세요.')).toBeInTheDocument();
    expect(verificationRequests).toHaveLength(0);
  });

  it('인증코드와 비밀번호로 가입을 완료한다', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.click(screen.getByRole('tab', { name: '가입' }));
    await user.type(screen.getByLabelText('초대 코드'), 'ABC123');
    await user.type(screen.getByLabelText('회사 이메일'), 'jane@company.com');
    await user.click(screen.getByRole('button', { name: '인증코드 받기' }));
    await user.type(await screen.findByLabelText('인증코드'), ' 123456 ');
    await user.type(screen.getByLabelText('가입 비밀번호'), 'Password123');
    await user.type(screen.getByLabelText('비밀번호 확인'), 'Password123');
    await user.click(screen.getByRole('button', { name: '가입 완료' }));

    await waitFor(() => expect(localStorage.getItem('ridy.accessToken')).toBe('access-token'));
    expect(signupRequests).toContainEqual({
      input: {
        challengeId: 'challenge-1',
        verificationCode: '123456',
        password: 'Password123',
      },
    });
    expect(push).toHaveBeenCalledWith('/profile/setup');
  });

  it('약한 비밀번호와 확인 불일치를 막는다', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.click(screen.getByRole('tab', { name: '가입' }));
    await user.type(screen.getByLabelText('초대 코드'), 'ABC123');
    await user.type(screen.getByLabelText('회사 이메일'), 'jane@company.com');
    await user.click(screen.getByRole('button', { name: '인증코드 받기' }));
    await user.type(await screen.findByLabelText('인증코드'), '123456');
    await user.type(screen.getByLabelText('가입 비밀번호'), 'weak');
    await user.type(screen.getByLabelText('비밀번호 확인'), 'weak');
    await user.click(screen.getByRole('button', { name: '가입 완료' }));

    expect(await screen.findByText('비밀번호는 10자 이상이며 영문과 숫자를 포함해야 합니다.')).toBeInTheDocument();
    expect(signupRequests).toHaveLength(0);

    await user.clear(screen.getByLabelText('가입 비밀번호'));
    await user.clear(screen.getByLabelText('비밀번호 확인'));
    await user.type(screen.getByLabelText('가입 비밀번호'), 'Password123');
    await user.type(screen.getByLabelText('비밀번호 확인'), 'Password456');
    await user.click(screen.getByRole('button', { name: '가입 완료' }));

    expect(await screen.findByText('비밀번호 확인이 일치하지 않습니다.')).toBeInTheDocument();
    expect(signupRequests).toHaveLength(0);
  });

  it('인증코드 에러를 표시한다', async () => {
    const user = userEvent.setup();
    server.use(
      graphql.mutation('CompleteEmailPasswordSignup', () => {
        return HttpResponse.json({ errors: [{ message: '인증코드가 일치하지 않습니다' }] });
      }),
    );

    render(
      <TestProviders>
        <LoginPage />
      </TestProviders>,
    );

    await user.click(screen.getByRole('tab', { name: '가입' }));
    await user.type(screen.getByLabelText('초대 코드'), 'ABC123');
    await user.type(screen.getByLabelText('회사 이메일'), 'jane@company.com');
    await user.click(screen.getByRole('button', { name: '인증코드 받기' }));
    await user.type(await screen.findByLabelText('인증코드'), '000000');
    await user.type(screen.getByLabelText('가입 비밀번호'), 'Password123');
    await user.type(screen.getByLabelText('비밀번호 확인'), 'Password123');
    await user.click(screen.getByRole('button', { name: '가입 완료' }));

    expect(await screen.findByText('인증코드가 일치하지 않습니다')).toBeInTheDocument();
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
